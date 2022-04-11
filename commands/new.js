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
            const channel = message.guild.channels.cache.get(ticket);
            if (channel) {
                interaction.reply({content: "You already have an open ticket. Please use that.", ephemeral: true});
                ticketchannel = interaction.guild.channels.cache.get(ticket)
                if (ticketchannel === undefined) {
                    db = new sqlite3.Database("./storage.sqlite3", (err) => { 
                        db.run(`DELETE FROM tickets${interaction.guild.id}`)
                    });
                } else {
                    console.log(ticketchannel)
                    ticketchannel.send("hi, use this channel my man");
                }
                return;
            }
            removeTicket(channel);
        }
        interaction.guild.channels.create(`ticket-0001`, {
            type: 'GUILD_TEXT',
            permissionOverwrites: [{
                id: interaction.member.id,
                allow: ['VIEW_CHANNEL']
            }]
        }).then (channel => {
            channel.send('Your new ticket channel is here');
            db = new sqlite3.Database("./storage.sqlite3", (err) => { 
                db.run(`INSERT INTO tickets${interaction.guild.id} VALUES (?, ?)`, [channel.id, interaction.member.id]);
            });
        })
        interaction.reply({ content: 'A new support ticket has been created!', ephemeral: true });
        
    },
};

async function removeTicket(channelid) {
    // Remove the ticket from the tickets DB
}


async function getCategory(guildid) {
    return new Promise(resolve => {
        setTimeout(() => {
            let db = new sqlite3.Database("./storage.sqlite3", (err) => {
                db.get(`SELECT category FROM guilds WHERE guild = ?`, guildid, function(err, row) {
                    resolve(row.category);
                })
            });
        }, 1000);
    })
}


async function getTicket(guildid, memberid) {
    return new Promise(resolve => {
        setTimeout(() => {
            let db = new sqlite3.Database("./storage.sqlite3", (err) => { 
                db.get(`SELECT channel FROM tickets${guildid} WHERE creator = ?`, memberid, function(err, row) {
                    if (row === undefined) { 
                        resolve(undefined);
                        return;
                    }
                    resolve(row.channel);
                })
            });
        }, 1000);
    })
}