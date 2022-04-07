const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Delete this support ticket!'),
    async execute(interaction) {
        // if this is a support ticket
        await interaction.reply({ content: 'Please wait. Preparing transcript.', ephemeral: true });
        // Make a transcript
        // delete it
        interaction.channel.delete('Ticket closed');
        // dm the transcript
    },
};