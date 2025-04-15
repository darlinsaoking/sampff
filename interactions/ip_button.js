module.exports = async (interaction) => {
    if (!interaction.isButton()) return;
    const { customId } = interaction;

    if (customId === 'ip_button') {
        interaction.reply({ content: '209.222.97.93:7777', flags: 64 });
    }
};