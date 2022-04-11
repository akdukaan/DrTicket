const { SlashCommandBuilder } = require('@discordjs/builders');
const { fetchTranscript } = require('discord.js-transcript');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const {createPaste} = require('hastebin');
const sqlite3 = require('sqlite3');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Delete this support ticket!'),
    async execute(interaction) {
        let ticket = await getTicket(interaction.guild.id, interaction.channel.id);
        let guild = await getGuild(interaction.guild.id);
        if (ticket === undefined) {
            return interaction.reply({ content: 'This is not a ticket', ephemeral: true });
        }
        await interaction.reply({ content: 'Please wait. Preparing transcript.', ephemeral: true });

        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const link = await getTranscript(messages);

        let HTMLMessage = await interaction.channel?.messages.fetch();
        HTMLMessage = HTMLMessage?.map(r => r);
        HTMLMessage.reverse();
        const transcriptHMTL = fetchTranscript(JSON.stringify(HTMLMessage), interaction.client);
        const transcriptBuffer = Buffer.from(transcriptHMTL, 'utf8');
        const transcriptAttachment = new MessageAttachment(transcriptBuffer, `${interaction.channel.name}.htm`);

        if(guild.transcript){
            const embed = new MessageEmbed()
                .setTitle(`${interaction.channel.name}`)
                .setDescription(`Created by <@${ticket.creator}> (${interaction.client.users.cache.get(ticket.creator).tag}). Text transcript at [bin.birdflop.com](${link})`)
                .setColor(0x5865F2)
            interaction.guild.channels.cache.get(guild.transcript).send({embeds: [embed], files: [transcriptAttachment]});
        }

        deleteTicket(interaction.guild.id, interaction.channel.id);
        interaction.channel.delete('Ticket closed');

        const embed = new MessageEmbed()
            .setTitle("Ticket closed")
            .setDescription(`Thank you for creating a ticket in **${interaction.guild.name}**. A transcript of your conversation is attached. Alternatively, you can view a text transcript at [bin.birdflop.com](${link})`)
            .setColor(0x5865F2)

        interaction.client.users.cache.get(ticket.creator).send({embeds: [embed], files: [transcriptAttachment]});
    },
};

async function getTicket(guildid, channelid) {
    return new Promise(resolve => {
        let db = new sqlite3.Database("./storage.sqlite3", (err) => { 
            db.get(`SELECT * FROM tickets${guildid} WHERE channel = ?`, channelid, function(err, row) {
                if (!row) return resolve(undefined);
                resolve(row);
            })
        });
    })
}

async function deleteTicket(guildid, channelid) {
        let db = new sqlite3.Database("./storage.sqlite3", (err) => { 
            db.run(`DELETE FROM tickets${guildid} WHERE channel = ?`, channelid)
        });
}

async function getGuild(guildid) {
    return new Promise(resolve => {
        let db = new sqlite3.Database("./storage.sqlite3", (err) => { 
            db.get(`SELECT * FROM guilds WHERE guild = ?`, guildid, function(err, row) {
                if (!row) return resolve(undefined);
                resolve(row);
            })
        });
    })
}

async function getTranscript(messages) {
	const logs = [];
	messages.forEach(async msg => {
		const time = new Date(msg.createdTimestamp).toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
		msg.embeds.forEach(embed => {
			if (embed.footer) logs.push(`${embed.footer.text}`);
			embed.fields.forEach(field => {
				logs.unshift(`${field.value}`);
				logs.unshift(`${field.name}`);
			});
			if (embed.description) logs.unshift(`${embed.description}`);
			if (embed.title) logs.unshift(`${embed.title}`);
			if (embed.author) logs.unshift(`${embed.author.name}`);
		});
		if (msg.content) logs.unshift(`${msg.content}`);
		logs.unshift(`\n[${time}] ${msg.author.tag}`);
	});
	return await createPaste(logs.join('\n'), { server: 'https://bin.birdflop.com' });
};