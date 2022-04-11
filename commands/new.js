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

        if (ticket) {
            const channel = interaction.guild.channels.cache.get(ticket);
            if (channel) {
                interaction.reply({content: "You already have an open ticket. Please use that.", ephemeral: true});
                channel.send("hi, use this channel my man");
                return;
            }
            console.log(channel)
            deleteTicket(interaction.guild.id, ticket);
        }
      
        interaction.guild.channels.create(`ticket-0001`, {
            type: 'GUILD_TEXT',
            parent: category,
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


async function deleteTicket(guildid, channelid) {
    console.log("deleting ticket")
    let db = new sqlite3.Database("./storage.sqlite3", (err) => { 
        db.run(`DELETE FROM tickets${guildid} WHERE channel = ?`, channelid)
    });
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
