const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('resolved')
		.setDescription('Marks a ticket as resolved'),
	async execute(interaction) {
		await interaction.reply({content: 'This ticket has been marked as resolved', ephemeral: true });
        interaction.channel.send("This message has been marked as resolved and will automatically close after 12 hours.")
	},
};