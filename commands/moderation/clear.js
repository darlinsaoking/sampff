const { EmbedBuilder } = require('discord.js');
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'clear',
    description: 'Eliminar una cantidad específica de mensajes.',
    async execute(message, args) {
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

        let amount = parseInt(args[0]);

        if (isNaN(amount) || amount < 1 || amount > 100) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ 
                    name: `❌ Especifica cantidad ${message.member.displayName}`, 
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('Proporciona un número entre 1 y 100 para la cantidad de mensajes a eliminar.')
                .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();
            return message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
        }

        if (amount === 100) {
            amount = 99; // Ajustar el valor de amount a 99 para evitar el error
        }

        try {
            const fetched = await message.channel.messages.fetch({ limit: amount + 1 });

            await message.channel.bulkDelete(fetched, true);

            const successEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({ 
                    name: `✅ Comando CLEAR ${message.member.displayName}`, 
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription(`Se han eliminado ${fetched.size - 1} mensajes correctamente.`)
                .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            await message.channel.send({ embeds: [successEmbed] }).then(msg => {
                setTimeout(() => msg.delete(), 5000);
            });
        } catch (error) {
            console.error('Error al eliminar mensajes:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ 
                    name: `❌ Error al eliminar ${message.member.displayName}`, 
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('Hubo un error al intentar eliminar los mensajes en este canal.')
                .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();
            await message.channel.send({ embeds: [errorEmbed] }).then(() => message.delete().catch(console.error));
        }
    },
};