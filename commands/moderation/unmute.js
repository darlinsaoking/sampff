const { EmbedBuilder } = require('discord.js');
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'unmute',
    description: 'Desmutear a un usuario en el servidor',
    execute(message) {
        const rolesAllowed = [
            '1330007698283958289', // Administrador
            '1330007698283958288',  // Moderador Global
            '1330007698283958287', // Moderador
            '1330007698283958286' //Ayudante
        ];
        
        const muteRoleId = '1288636152126898275'; // Reemplaza con el ID del rol mute
        const UserRole = '1288636152126898273';
        
        const SkinImage = GetPlayerSkin(message.author.id);
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

        const user = message.mentions.users.first();
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ 
                    name: `❌ Menciona un usuario ${message.member.displayName}`, 
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('Mencione a un usuario para desmutear.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
            return;
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ 
                    name: `❌ Usuario no encontrado ${message.member.displayName}`, 
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('El usuario no está en el servidor.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
            return;
        }

        if (!member.roles.cache.has(muteRoleId)) {
            const embed = new EmbedBuilder()
                .setColor('#ffb900')
                .setAuthor({ 
                    name: `⚠️ Comando UNMUTE ${message.member.displayName}`, 
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription(`🔇 ${user.tag} no esta muteado\nusa **!mute** si necesitas mutearlo.`)
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
            return;
        }

        // Verificar si el usuario es el propietario del servidor
        if (user.id === message.guild.ownerId) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ 
                    name: `❌ No puedes desmutear al propietario ${message.member.displayName}`, 
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('No puedes desmutear al propietario del servidor.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
            return;
        }

        member.roles.remove(muteRoleId).then(() => {
            member.roles.add(UserRole);
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({ 
                    name: `⌨️ comando UNMUTE ${message.member.displayName}`, 
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription(`📳 **${user.tag}** ha sido desmuteado por **${message.member.displayName}**.`)
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
        }).catch(error => {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ 
                    name: `❌ Error al desmutear ${message.member.displayName}`, 
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription(`No se pudo desmutear a ${user.tag}: ${error}`)
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
        });
    },
};