const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settranscriptchannel')
        .setDescription('Send transcripts to this channel'),
    async execute(interaction) {
        
        await interaction.reply(`Setting the transcript channel to here`);
    },
};