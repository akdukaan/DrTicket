const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const sqlite3 = require('sqlite3');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Create a panel and category for tickets'),
    async execute(interaction) {
        // Create the ticket category
        let tickets = await interaction.guild.channels.create("TICKETS", { type: "GUILD_CATEGORY" });
        // Change something in the config to indicate that this is the tickets category
        // Create a panel
        const exampleEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Need help?')
            .setDescription('Some description here');

        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('createticket')
                .setLabel('Create Ticket')
                .setStyle('PRIMARY'),
        );

        await interaction.channel.send({ embeds: [exampleEmbed], components: [row]});
        db = new sqlite3.Database("./storage.sqlite3", (err) => { 
            if (err) { 
                console.log('Error when creating the database', err) 
            } else { 
                // Create tables for each guild tickets
                // todo only if its not already there
                db.run(`INSERT INTO guilds VALUES (?, ?, ?, ?)`, [interaction.guild.id, null, tickets.id, 1]);
            } 
        })
        db.close();
        await interaction.reply({content: `Panel and ticket category created! Remember to give your support team VIEW CHANNEL permissions within the category! ${tickets.name}`, ephemeral: true });
    },
};