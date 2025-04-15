const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'fondo',
    description: 'Envía embed con logo.',
    async execute(message, args) {

        const embed = new EmbedBuilder()
            .setColor(0x2373ff) // Puedes cambiar el color del embed
            .setAuthor({ 
                name: `🎴FONDO GamaMobile ${message.author.tag}`, 
                iconURL: message.author.displayAvatarURL()
            })
            .setDescription(':levitate:•Fondo Oficial de GamaMobile')
            .setThumbnail(message.guild.iconURL())
            .setImage('https://cdn.discordapp.com/attachments/1316753645810745508/1327259004212084826/Picsart_25-01-09_18-57-40-274.png')
            .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() })
            .setTimestamp();

        await message.channel.send({ embeds: [embed]});
        await message.delete().catch(console.error);
    },
};
