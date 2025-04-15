const { EmbedBuilder } = require('discord.js');
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'kick',
    description: 'Expulsar a un usuario del servidor',
    async execute(message, args) {
        const rolesAllowed = [
            '931910985202143252', // Administrador
            '1330007698283958288',  // Moderador Global
            '1330007698283958287' // Moderador
        ];

        // Check if the user has the required roles
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

        const user = message.mentions.users.first();
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: `❌ Error mención ${message.member.displayName}`, iconURL: message.guild.iconURL() })
                .setDescription('Mencione a un usuario para expulsar.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
            return;
        }

        // Check if the user is trying to kick themselves
        if (user.id === message.author.id) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: `❌ Error mención ${message.member.displayName}`, iconURL: message.guild.iconURL() })
                .setDescription('No puedes expulsarte a ti mismo.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
            return;
        }

        const reason = args.slice(1).join(' ');
        if (!reason) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: `❌ Error motivo ${message.member.displayName}`, iconURL: message.guild.iconURL() })
                .setDescription('Proporcione el motivo de la expulsión.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
            return;
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: `❌ Error mención ${message.member.displayName}`, iconURL: message.guild.iconURL() })
                .setDescription('El usuario no está en el servidor.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
            return;
        }

        // Check if the user is the server owner
        if (user.id === message.guild.ownerId) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: `❌ Permisos insuficientes ${message.member.displayName}`, iconURL: message.guild.iconURL() })
                .setDescription('No puedes expulsar al propietario del servidor.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
            return;
        }

        // Check if the user has a higher role
        if (member.roles.highest.position >= message.member.roles.highest.position) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: `❌ Permisos insuficientes ${message.member.displayName}`, iconURL: message.guild.iconURL() })
                .setDescription('No puedes expulsar a un usuario con un rol igual o superior al tuyo.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
            return;
        }

        // Send DM to the user about the kick
        const dmEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setAuthor({ 
                name: `🚫» Has sido expulsado de ${message.guild.name}`, 
                iconURL: message.guild.iconURL()
            })
            .setDescription(`ℹ️ **——————·ℹ️INFORMACIÓN·——————**\n\n📙 **Expulsado por:** ${message.member.displayName}\n📖 **Razón:** ${reason}\n\n❓ **¿Consideras que la sanción es injusta?** Puedes reincorporarte al servidor usando este enlace: [Reingresar al servidor](https://discord.gg/MsrEmKdX).`)
            .setTimestamp()
            .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() });

        try {
            await user.send({ embeds: [dmEmbed] });

            // Kick the user after the DM has been sent
            await member.kick(reason);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({ name: `✅ Comando KICK ${message.member.displayName}`, iconURL: message.guild.iconURL() })
                .setDescription(`📙· Has expulsado a **${user.tag}** del servidor por: **"${reason}"**\n❕**·Notificación __${user.tag} ha recibido la información de su sanción por privado.__**`)
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
        } catch (error) {
            console.error('Error al expulsar al usuario:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: `❌ Error KICK ${message.member.displayName}`, iconURL: message.guild.iconURL() })
                .setDescription(`No se pudo expulsar a ${user.tag}: ${error.message}`)
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [errorEmbed] }).then(() => message.delete().catch(console.error));
        }
    },
};