const { EmbedBuilder } = require('discord.js');
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'vtiktok',
    description: 'El bot enviará el mensaje proporcionado.',
    async execute(message, args, pool) {
        const rolesAllowed = [
            '1330007698283958282'
        ];

        const SpecificChannel = '1330007699173412901';

        // Verificar que el mensaje sea del canal correcto y que no sea de un bot
        if (message.channel.id !== SpecificChannel || message.author.bot) {
            return;
        }

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

        const sayMessage = args.join(' ');
        if (!sayMessage) {
            return message.delete().catch(console.error);
        }

        // Enviar el mensaje como si fuera el bot
        const sentMessage = await message.channel.send(`🟣·Hay nuevo video de GamaMobile·<:GamaSaurio:1298438994849304597> en 🎶·TikTok\n🔗»Enlace del video: ${sayMessage}`);
        
        // Agregar las reacciones al mensaje
        await sentMessage.react('👍');
        await sentMessage.react('💜');
        await sentMessage.react('👎');

        await message.delete().catch(console.error); // Eliminar el mensaje original
    },
};