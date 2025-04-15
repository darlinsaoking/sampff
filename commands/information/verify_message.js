const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'sverify',
    description: 'Inicia el proceso de verificación de cuenta de juego a Discord',
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

        const embed = new EmbedBuilder()
            .setColor(0x2373ff)
            .setAuthor({ 
                name: `🎉·Bienvenido a Daptyldroid`, 
                iconURL: message.guild.iconURL()
            })
            .setDescription(`Sigue los siguientes pasos para completar la ✅verificación.\n\n` +
                `1️⃣**·PASO 1:** **👀·**Leer y acepta las <#13300076989298770222> y <#1330007698929877022>.\n` +
                `2️⃣**·PASO 2:** Pulsa en 🛡️ Verificar.\n` +
                `3️⃣**·PASO 3:** Sigue los pasos para 🛡️ Verificar tu cuenta y para **🔓·**desbloquear los canales.\n`)
            .setThumbnail(message.guild.iconURL())
            .setImage('https://cdn.discordapp.com/attachments/1330007698808246308/1360336393238216774/Picsart_25-04-11_14-30-50-660.jpg?ex=67fabf7d&is=67f96dfd&hm=0f7c4c15c8eed7f4293a41a8158976e2f46d25924808fe402dc0de544261f5cc&')
            .setTimestamp()
            .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('verify')
                    .setLabel('🛡️ Verificar')
                    .setStyle(ButtonStyle.Primary)
            );

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete().catch(console.error);
    },
};