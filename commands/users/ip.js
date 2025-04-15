const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'ip',
    description: 'Envía embed con IP.',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setColor(0x2373ff) // Puedes cambiar el color del embed
            .setAuthor({ 
                name: `🏙️•Daptyldroid RolePlay`, 
                iconURL: message.author.displayAvatarURL()
              })
            .setDescription(
                `🕴️**•**IP: *209.222.97.93**\n🖱️·Puerto: **7777**\n**»** 🖥️ [Jugar](https://discord.com/channels/1330007698250403880/1344085649208115200496) **•** 📱 [Jugar](https://discord.com/channels/1330007698250403880/1344085649208115200)\n`
            )
            .setThumbnail(message.guild.iconURL())
            .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ip_button')
                    .setLabel('209.222.97.93:7777')
                    .setEmoji('🏙️')
                    .setStyle(ButtonStyle.Primary)
            );

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete().catch(console.error);
    },
};