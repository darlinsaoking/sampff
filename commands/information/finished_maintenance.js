const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle  } = require('discord.js');
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'am',
    description: 'Aviso mantenimiento finalizado',
    async execute(message, pool) {
        const rolesAllowed = [
            '931910985202143252'
        ];

        const SkinImage = await GetPlayerSkin(message.author.id);
        if (!message.member.roles.cache.some(role => rolesAllowed.includes(role.id))) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setAuthor({ 
                    name: `❌Acceso Denegado ${message.member.displayName}`, 
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription(':levitate:•! Permisos insuficientes')
                .setThumbnail(`${SkinImage}`)
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
            return;
        }

        const Announce_Channel = '1330007699047452720';
        const announce_channel = message.guild.channels.cache.get(Announce_Channel);

         const MaintenanceEmbed = new EmbedBuilder()
        .setColor(0x2373ff)
        .setAuthor({
            name: `✅·Abierto Daptyldroid RolePlay Android📱|💻PC`,
            iconURL: message.guild.iconURL()
        })
        .setDescription('🎮 **Daptyldroid está abierto!** 🎉\n✨ Ya puedes entrar y disfrutar del juego. ¡Nos vemos dentro! 🚀')
        .setImage('https://media.discordapp.net/attachments/1330007698808246308/1360254142785781952/Picsart_25-04-11_09-02-08-427.jpg?ex=67fa72e3&is=67f92163&hm=390ae0c3a1492584eb5d84000ef330c26f2175b67532f16e5f39c1810d33dc87&=&format=webp&width=1042&height=651')
        .setTimestamp()
        .setFooter({ text: `📶·El servidor Daptyldroid se encuentra nuevamente en línea.`, iconURL: message.guild.iconURL() });
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ip_button')
                    .setLabel('199.127.60.172:7777')
                    .setEmoji('🎮')
                    .setStyle(ButtonStyle.Success)
            );

        await announce_channel.send({ embeds: [MaintenanceEmbed], components: [row] });
        await announce_channel.send('**:joystick:·¿Que esperas para entrar a Jugar?, ¡¡disfruta de lo mejor!!**');

        await message.reply('✅ He avisado la finalizacion de el modo mantenimiento.');
    },
};