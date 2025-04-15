require('dotenv').config();
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'info_eco',
    description: 'Muestra la información de los jugadores con su dinero, vehículos, propiedades, gamas y más.',
    async execute(message, args, pool) {
        const roleId = '931910985202143252';

        const SkinImage = await GetPlayerSkin(message.author.id);
        if (!message.member.roles.cache.has(roleId)) {
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

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('Economy_Update')
                    .setEmoji('📈')
                    .setLabel('ECONOMIA')
                    .setStyle(ButtonStyle.Primary)
            );

        await message.channel.send({ content: 'Pulsa [ 📈 ECONOMIA ] para actualizar la informacion.', components: [row] });
        await message.delete().catch(console.error);
    },
};