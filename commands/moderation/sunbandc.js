const { EmbedBuilder } = require('discord.js');
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'sunbandc',
    description: 'Desbanear a un usuario del servidor',
    async execute(message, args) {
        const rolesAllowed = [
            '1330007698283958289', // Administrador
            '1330007698283958288',  // Moderador Global
            '1330007698283958287' // Moderador
        ];

        const SkinImage = await GetPlayerSkin(message.author.id);
        if (!message.member.roles.cache.some(role => rolesAllowed.includes(role.id))) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setAuthor({ 
                    name: `❌ Acceso Denegado ${message.member.displayName}`, 
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription(':levitate:•! Permisos insuficientes')
                .setThumbnail(`${SkinImage}`)
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
            return;
        }

        // Obtener el ID del usuario a desbanear
        const userId = args[0]; 
        if (!userId) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: `❌ Error ID ${message.member.displayName}`, iconURL: message.guild.iconURL() })
                .setDescription('Por favor, proporciona el ID de usuario para desbanear.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
            return;
        }

        const reason = args.slice(1).join(' ') || 'No proporcionada';
        
        try {
            // Desbanear al usuario usando su ID
            await message.guild.members.unban(userId, reason);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({ name: `✅ Comando SUNBAN ${message.member.displayName}`, iconURL: message.guild.iconURL() })
                .setDescription(`ℹ️ Se ha desbaneado al usuario con ID ${userId} por "${reason}".`)
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
        } catch (error) {
            console.error('Error al desbanear al usuario:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: `❌ Error SUNBAN ${message.member.displayName}`, iconURL: message.guild.iconURL() })
                .setDescription(`No se pudo desbanear al usuario con ID ${userId}: ${error.message}`)
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [errorEmbed] }).then(() => message.delete().catch(console.error));
        }
    },
};
