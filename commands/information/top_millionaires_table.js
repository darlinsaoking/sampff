require('dotenv').config();
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'info_millionaires',
    description: 'Muestra la lista de los top 10 millonarios de GamaMobile RolePlay Android en DINERO y GAMAS',
    async execute(message) {
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

        const Cash_Row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('Update_Cash')
                    .setEmoji('💸')
                    .setLabel('MILLONARIOS')
                    .setStyle(ButtonStyle.Secondary)
            );

        const Coins_Row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('Update_Coins')
                    .setEmoji('💰')
                    .setLabel('MILLONARIOS')
                    .setStyle(ButtonStyle.Secondary)
            );

        await message.channel.send({ content: '', components: [Cash_Row] });
        await message.channel.send({ content: '', components: [Coins_Row] });

        await message.delete().catch(console.error);
    },
};