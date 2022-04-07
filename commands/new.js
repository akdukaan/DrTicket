const { SlashCommandBuilder } = require('@discordjs/builders');
const sqlite3 = require('sqlite3');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('new')
        .setDescription('Create a new support ticket!'),
    async execute(interaction) {
        let category = undefined;
        let ticket = undefined;
        let db = new sqlite3.Database("./storage.sqlite3", (err) => { 
            if (err) { 
                console.log('Error when connecting to the database', err) 
                interaction.reply({ content: 'error connecting to database!', ephemeral: true });
            } else { 
                // Find the ticket category
                category = getCategory(interaction.guild.id);
                print(category + " is the category")

                ticket = getTicket(interaction.guild.id, interaction.member.id);
                console.log(ticket + "and cat is " + category)

                if (category !== undefined) {
                    interaction.reply({ content: 'Tickets have not yet been set up for this server', ephemeral: true });
                    return;
                }
                if (ticket === undefined) {
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
                } else {
                    console.log(category)
                    console.log(ticket)
                    interaction.reply({ content: 'Go use your existing ticket', ephemeral: true });
                    ticketchannel = interaction.guild.channels.cache.get(ticket)
                    if (ticketchannel === undefined) {
                        db = new sqlite3.Database("./storage.sqlite3", (err) => { 
                            db.run(`DELETE FROM tickets${interaction.guild.id}`)
                        });
                    } else {
                        console.log(ticketchannel)
                        ticketchannel.send("hi, use this channel my man");
                    }
                }
            }
        });
        db.close();
    },
};

async function getCategory(guildid) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let db = new sqlite3.Database("./storage.sqlite3", (err) => { 
                db.get(`SELECT category FROM guilds WHERE guild = ?`, guildid, function(err, row) {
                    console.log("Returning a real row category")
                    return row.category;
                })
            });
        }, 1000)
    })
    let db = new sqlite3.Database("./storage.sqlite3", (err) => { 
        db.get(`SELECT category FROM guilds WHERE guild = ?`, guildid, function(err, row) {
            console.log("Returning a real row category")
            return row.category;
        })
    });
    console.log("Returning undefined category")
}

function getTicket(guildid, memberid) {
    let db = new sqlite3.Database("./storage.sqlite3", (err) => { 
        db.get(`SELECT channel FROM tickets${guildid} WHERE creator = ?`, memberid, function(err, row) {
            if (row !== undefined) {
                console.log("Returning a real channel")
                return row.channel;
            }
        })
    });
    console.log("Returning undefined ticket")
}