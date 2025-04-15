const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'postulacionespd',
    description: 'Información sobre las postulaciones al staff de GamaMobile.',
    async execute(message) {
        const roleId = '931910985202143252';
        
        const SkinImage = GetPlayerSkin(message.author.id);
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
            .setColor(0x0099FF)
            .setTitle('👮·Policia DaptylDroid RolePlay Android📱|💻PC')
            .setDescription(
                'Ya puedes formar parte del :office: Policia de Daptyldroid. Este es un cargo muy importante ' +
                'Que requiere ganas y esfuerzo igual ✨️ que ' +
                ':police_officer: Paciencia .\n\n' +
                '**!** Para postular hay que cumplir ciertos requisitos OBLIGATORIOS:\n' +
                '⬆️ • Ser nivel 5 o superior.\n' +
                '🔮 • Ser nivel 5 en Discord o superior.\n' +
                '🔎 • Tener un Buen historial reciente.\n' +
                '🚫 • Renunciar a la banda/Staff.\n' +
                '🕛 • Tener suficiente tiempo.\n' +
                '🎩 • Ser paciente, educado y respetuoso.\n' +
                '📑 • Tener reportes mínimos.\n' +
                '❤️ • Ser leal a GamaMobile.\n\n' +
                '**📒 ¿Cómo postular?**\n' +
                'Si cumples con todos los requisitos pulsa en el botón de abajo para postular.\n\n' +
                '**:clipboard: · Reportar Policia **\n' +
                '📝 » Reporta a un 👮‍♂️ Miembro del Policía  que :no_entry: no está haciendo lo correcto.'
            )
            .setImage('https://cdn.discordapp.com/attachments/1330007698808246308/1360328755842912377/Picsart_25-04-11_13-57-25-275.jpg?ex=67fab861&is=67f966e1&hm=80dd34e31f402506fa8de9db323fbf170de24ee11a1c599e2d71d75827af350d&')
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('postularsee')
                    .setEmoji('👮‍♂️')
                    .setLabel('POSTULAR')
                    .setStyle(ButtonStyle.Primary)
            );

        await message.channel.send({ embeds: [embed], components: [row] });
    },
};