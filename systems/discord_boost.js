const { Events, EmbedBuilder } = require('discord.js');

module.exports = (client) => {
    const roleId = '957492555862380584'; // Reemplaza con el ID del rol "Gamabooster"
    const channelId = '1361518065552068820'; // Reemplaza con el ID del canal deseado

    client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
        if (newMember.roles.cache.has(roleId) && !oldMember.roles.cache.has(roleId)) {
            const channel = newMember.guild.channels.cache.get(channelId);
            if (channel) {
                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('¡Bienvenido a la familia Daptylbooster!')
                    .setDescription(`¡Muchas gracias ${newMember} por convertirte en **Daptylbooster**! 🎉\n\nTu apoyo es fundamental para mejorar nuestro servidor. Juntos creamos una comunidad más fuerte y divertida.`)
                    .setThumbnail(newMember.displayAvatarURL()) // Foto del usuario
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() }) // Nombre del bot
                    .setTimestamp();

                await channel.send({ embeds: [embed] });
            }
        }
    });
};