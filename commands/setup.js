const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton, Permissions } = require('discord.js');
const sqlite3 = require('sqlite3');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Create a panel and category for tickets'),
    async execute(interaction) {
        // Create the ticket category
        let tickets = await interaction.guild.channels.create("TICKETS", { type: "GUILD_CATEGORY" });
        tickets.permissionOverwrites.set([
            {
                id: interaction.guild.id,
                deny: [Permissions.FLAGS.VIEW_CHANNEL],
            },
        ], 'Created private ticket category')
        // Create a panel
        const embedpanel = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Need help?')
            .setDescription('Some description here');
        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('new')
                .setLabel('Create Ticket')
                .setStyle('PRIMARY'),
        );
        await interaction.channel.send({ embeds: [embedpanel], components: [row]});

        if (await doesGuildExist(interaction.guild.id)) {
            updateGuild(interaction.guild.id, tickets.id);
        } else {
            createTicketsTable(interaction.guild.id);
            addGuild(interaction.guild.id, tickets.id);
        }
        await interaction.reply({content: `Panel and ticket category created! Remember to give your support team VIEW CHANNEL permissions within the category! ${tickets.name}`, ephemeral: true });
    },
};

async function updateGuild(guildid, categoryid) {
    let db = new sqlite3.Database("./storage.sqlite3", (err) => { 
        db.run(`UPDATE guilds SET category = ${categoryid} WHERE guild = ${guildid}`);
    });
}

async function createTicketsTable(guildid) {
    let db = new sqlite3.Database("./storage.sqlite3", (err) => { 
        db.run(`CREATE TABLE IF NOT EXISTS tickets${guildid}(channel TEXT PRIMARY KEY, creator TEXT NOT NULL)`);
    });
}

async function addGuild(guildid, categoryid) {
    let db = new sqlite3.Database("./storage.sqlite3", (err) => { 
        db.run(`INSERT INTO guilds VALUES (?, ?, ?, ?)`, [guildid, null, categoryid, 1]);
    });
}

async function doesGuildExist(guildid) {
    return new Promise(resolve => {
        let db = new sqlite3.Database("./storage.sqlite3", (err) => {
            db.get(`SELECT guild FROM guilds WHERE guild = ?`, guildid, function(err, row) {
                if (!row) return resolve(false);
                return resolve(true)
            })
        });
        db.close();
    })
}