const { EmbedBuilder } = require('discord.js');
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'mute',
    description: 'Mutear a un usuario en el servidor',
    async execute(message, args, pool) {
        const rolesAllowed = [
            '931910985202143252', // Administrador
            '1236661918140338248',  // Moderador Global
            '1361515504367566919', // Moderador
            '1361515503184510976' //Ayudante
        ];
        const muteRoleId = '1361515501741932574'; // Replace with the actual mute role ID
        const UserRole = '1361515493176905900';

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
                .setColor(0xff0000)
                .setAuthor({ 
                    name: `❌ Menciona un usuario ${message.member.displayName}`, 
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('Mencione a un usuario para mutear.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
            return;
        }

        const minutes = parseInt(args[1]);
        if (isNaN(minutes) || minutes <= 0) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setAuthor({ 
                    name: `❌ Especifica minutos válidos ${message.member.displayName}`, 
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('Proporcione los minutos de muteo.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
            return;
        }

        if (minutes > 1440) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setAuthor({ 
                    name: `❌ Limite de minutos alcanzado. ${message.member.displayName}`, 
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('No puedes mutear por mas de 24 horas (1440 minutos)')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
            return;
        }

        const reason = args.slice(2).join(' ');
        if (!reason) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setAuthor({ 
                    name: `❌ Proporcione un motivo ${message.member.displayName}`, 
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('Proporcione el motivo del muteo.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
            return;
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
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

        if (member.roles.cache.has(muteRoleId)) {
            const embed = new EmbedBuilder()
                .setColor('#ffb900')
                .setAuthor({ 
                    name: `⚠️ Comando MUTE ${message.member.displayName}`, 
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription(`🔇 ${user.tag} ya esta muteado\nusa **!unmute** si quieres removerle el muteo.`)
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
            return;
        }

        // Check if the user is the server owner
        if (user.id === message.guild.ownerId) {
            const embed = new EmbedBuilder()
                .setColor(0x2373ff)
                .setAuthor({ 
                    name: `❌ No puedes mutear al propietario ${message.member.displayName}`, 
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('No puedes mutear al propietario del servidor.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
            return;
        }

        member.roles.add(muteRoleId).then(() => {
            member.roles.remove(UserRole);
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({ 
                    name: `✅ Comando MUTE ${message.member.displayName}`, 
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription(`🔇 ${user.tag} ha sido muteado por ${minutes} minutos.\nMotivo: ${reason}`)
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));

            setTimeout(() => {
                member.roles.remove(muteRoleId).then(() => {
                    member.roles.add(UserRole);
                    const unmuteEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setAuthor({ 
                            name: `🔊 Usuario desmutado • ${message.member.displayName}`, 
                            iconURL: message.author.displayAvatarURL()
                        })
                        .setDescription(`🔊 ${user.tag} ha sido desmuteado automáticamente después de ${minutes} minutos.`)
                        .setTimestamp()
                        .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
                    message.channel.send({ embeds: [unmuteEmbed] });
                }).catch(console.error);
            }, minutes * 60000);
        }).catch(error => {
            const embed = new EmbedBuilder()
                .setColor(0x2373ff)
                .setAuthor({ 
                    name: `❌ Error al mutear ${message.member.displayName}`, 
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription(`No se pudo mutear a ${user.tag}: ${error}`)
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
        });
    },
};