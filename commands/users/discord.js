const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'discord',
    description: 'Envía embed con link de discord en embed.',
    async execute(message, args) {
        const discordLink = 'https://discord.gg/MsrEmKdX';

        const embed = new EmbedBuilder()
            .setColor('#00FF00') // Puedes cambiar el color del embed
            .setAuthor({ 
                name: `🔵 comando DISCORD ${message.member.displayName}`, 
                iconURL: message.guild.iconURL()
              })
            .setDescription(`**🔗· Discord de ${message.guild.name}: ${discordLink}**`)
            .setThumbnail(message.author.displayAvatarURL())
            .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('🛡️DISCORD')
                    .setStyle(ButtonStyle.Link)
                    .setURL(discordLink)
            );

        await message.channel.send({ embeds: [embed], components: [row] });

        // Eliminar el comando original para mantener el canal limpio
        await message.delete().catch(console.error);
    },
};
