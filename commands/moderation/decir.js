const { EmbedBuilder } = require('discord.js');
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'decir',
    description: 'El bot enviará el mensaje proporcionado.',
    async execute(message, args) {
        const rolesAllowed = [
            '931910985202143252'
        ];

        // Verificar si el usuario tiene uno de los roles permitidos
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
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: `❌ Mensaje no proporcionado ${message.member.displayName}`, iconURL: message.author.displayAvatarURL() })
                .setDescription('Por favor, proporciona un mensaje para que el bot lo envíe.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });

            await message.channel.send({ embeds: [embed] });
            return message.delete().catch(console.error);
        }

        // Enviar el mensaje como si fuera el bot
        await message.channel.send(sayMessage);
        await message.delete().catch(console.error); // Eliminar el mensaje original
    },
};