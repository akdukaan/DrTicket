const { SlashCommandBuilder } = require('@discordjs/builders');
const sqlite3 = require('sqlite3');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('new')
        .setDescription('Create a new support ticket!'),
    async execute(interaction) {
        const category = await getCategory(interaction.guild.id);
        const ticket = await getTicket(interaction.guild.id, interaction.member.id);
        console.log(ticket + " is ticket and category is is " + category)

        if (category === undefined) {
            interaction.reply({ content: 'Tickets have not yet been set up for this server', ephemeral: true });
            return;
        }
        if (ticket !== undefined) {
            // TODO WHY THIS SO INCONSISTENT
            const channel = interaction.guild.channels.cache.get(ticket);
            if (channel !== undefined) {
                interaction.reply({content: "You already have an open ticket <mention channel>. Please use that.", ephemeral: true});
                channel.send("hi, use this channel <insert @ mention here>");
                return;
            }
            removeTicket(interaction.guild.id, ticket);
        }
        interaction.guild.channels.create(`ticket-0001`, {
            type: 'GUILD_TEXT',
            permissionOverwrites: [{
                id: interaction.member.id,
                allow: ['VIEW_CHANNEL']
            }]
        }).then (channel => {
            channel.setParent(category);
            channel.send('Your new ticket channel is here');
            db = new sqlite3.Database("./storage.sqlite3", (err) => { 
                db.run(`INSERT INTO tickets${interaction.guild.id} VALUES (?, ?)`, [channel.id, interaction.member.id]);
            });
        })
        interaction.reply({ content: 'A new support ticket has been created!', ephemeral: true });
        
    },
};

async function removeTicket(guildid, channel) {
    // Remove the ticket from the tickets DB
    console.log("removing ticket")
    let db = new sqlite3.Database("./storage.sqlite3", (err) => {
        db.get(`DELETE FROM tickets${guildid} WHERE channel = ?`, channel, function(err, row) {
        });
    });
    db.close();
}


async function getCategory(guildid) {
    return new Promise(resolve => {
            let db = new sqlite3.Database("./storage.sqlite3", (err) => {
                db.get(`SELECT category FROM guilds WHERE guild = ?`, guildid, function(err, row) {
                    if (!row) return resolve(undefined);
                    resolve(row.category);
                })
            });
            db.close();
    })
}


async function getTicket(guildid, memberid) {
    return new Promise(resolve => {
        let db = new sqlite3.Database("./storage.sqlite3", (err) => { 
            db.get(`SELECT channel FROM tickets${guildid} WHERE creator = ?`, memberid, function(err, row) {
                if (!row) return resolve(undefined);
                resolve(row.channel);
            })
        });
    })
}
