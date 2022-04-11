const { SlashCommandBuilder } = require('@discordjs/builders');
const sqlite3 = require('sqlite3');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('new')
        .setDescription('Create a new support ticket!'),
    async execute(interaction) {
        const categoryid = await getCategory(interaction.guild.id);
        const ticket = await getTicket(interaction.guild.id, interaction.member.id);
        console.log(ticket + " is ticket and category is is " + categoryid)

        if (categoryid === undefined) {
            interaction.reply({ content: 'Tickets have not yet been set up for this server', ephemeral: true });
            return;
        }

        const category = interaction.guild.channels.cache.get(categoryid);
        if (category === undefined) {
            interaction.reply({ content: 'Tickets have not yet been set up for this server', ephemeral: true });
            return;
        }

        if (ticket) {
            const channel = interaction.guild.channels.cache.get(ticket);
            if (channel) {
                interaction.reply({content: `You already have an open ticket. Please use ${channel.toString()}.`, ephemeral: true});
                return;
            }
            deleteTicket(interaction.guild.id, ticket);
        }
      
        const ticketnumber = await getTicketNumber(interaction.guild.id)
        interaction.guild.channels.create(`ticket-${(ticketnumber + "").padStart(4, "0")}`, {
            type: 'GUILD_TEXT',
            parent: categoryid,
            permissionOverwrites: [{
                id: interaction.member.id,
                allow: ['VIEW_CHANNEL']
            }]
        }).then(channel => {
            channel.send(interaction.member.toString() + ', please describe your issue in detail.');
            insertTicket(interaction.guild.id, channel.id, interaction.member.id)
            setTicketCounter(interaction.guild.id, ticketnumber + 1)
            interaction.reply({ content: `A new support ticket has been created at ${channel.toString()}!`, ephemeral: true });
        })
    },
};

async function insertTicket(guildid, channelid, memberid) {
    let db = new sqlite3.Database("./storage.sqlite3", (err) => { 
        db.run(`INSERT INTO tickets${guildid} VALUES (?, ?)`, [channelid, memberid]);
    });
    db.close();
}

async function setTicketCounter(guildid, newcounter) {
    let db = new sqlite3.Database("./storage.sqlite3", (err) => { 
        db.run(`UPDATE guilds SET counter = ${newcounter} WHERE guild = ${guildid}`)
    });
    db.close();
}

async function deleteTicket(guildid, channelid) {
    let db = new sqlite3.Database("./storage.sqlite3", (err) => { 
        db.run(`DELETE FROM tickets${guildid} WHERE channel = ?`, channelid)
    });
    db.close();
}

async function getTicketNumber(guildid) {
    return new Promise(resolve => {
        let db = new sqlite3.Database("./storage.sqlite3", (err) => {
            db.get(`SELECT counter FROM guilds WHERE guild = ?`, guildid, function(err, row) {
                console.log(row.counter + " is counter")
                resolve(row.counter);
            })
        });
        db.close();
    })
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
        db.close();
    })
}
