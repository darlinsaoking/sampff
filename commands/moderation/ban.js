const { EmbedBuilder } = require('discord.js');
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'ban',
    description: 'Banear a un usuario del servidor',
    async execute(message, args) {
        const rolesAllowed = [
            '931910985202143252', // Administrador
            '1236661918140338248',  // Moderador Global
            '1330007698283958287' // Moderador
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

        const user = message.mentions.users.first();
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: `❌ Error mención ${message.member.displayName}`, iconURL: message.guild.iconURL() })
                .setDescription('Mencione a un usuario para banear.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
            return;
        }

        // Check if the user is trying to ban themselves
        if (user.id === message.author.id) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: `❌ Error mención ${message.member.displayName}`, iconURL: message.guild.iconURL() })
                .setDescription('No puedes banearte a ti mismo.')
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
                .setDescription('Proporcione el motivo del baneo.')
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
                .setDescription('No puedes banear al propietario del servidor.')
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
                .setDescription('No puedes banear a un usuario con un rol igual o superior al tuyo.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
            return;
        }

        // Send DM to the user about the ban
        const dmEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setAuthor({ 
                name: `🚫 Has sido baneado de ${message.guild.name}`, 
                iconURL: message.guild.iconURL()
            })
            .setDescription(`Has sido baneado por **${message.member.displayName}**.\n\n**Razón:** ${reason}`)
            .setTimestamp()
            .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() });

        try {
            await user.send({ embeds: [dmEmbed] });

            // Ban the user after the DM has been sent
            await member.ban({ reason });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({ name: `✅ Comando BAN ${message.member.displayName}`, iconURL: message.guild.iconURL() })
                .setDescription(`ℹ️ Se ha baneado a ${user.tag} por "${reason}".`)
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
        } catch (error) {
            console.error('Error al banear al usuario:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: `❌ Error BAN ${message.member.displayName}`, iconURL: message.guild.iconURL() })
                .setDescription(`No se pudo banear a ${user.tag}: ${error.message}`)
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [errorEmbed] }).then(() => message.delete().catch(console.error));
        }
    },
};