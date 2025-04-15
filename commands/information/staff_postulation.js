const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'postulaciones',
    description: 'Información sobre las postulaciones al staff de DaptylDroid.',
    async execute(message) {
        const roleId = '931910985202143252'; // Reemplaza con el ID de tu rol específico

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
                name: `📋·Postulaciones DaptylDroid RolePlay Android📱|💻PC`,
                iconURL: message.guild.iconURL()
            })
            .setDescription(
                '**--------------POSTULACIONES--------------\n' +
                '------------------- STAFF -------------------**\n\n' +
                'Ya puedes formar parte del 👔staff de DaptylDroid,' +
                'este es un cargo muy importante el cual solo le concedemos' +
                'a nuestros jugadores más ✨️veteranos y experimentados que' +
                'se ofrezcan a ayudar en el crecimiento de la comunidad RolePlay de GamaMobile.\n\n' +
                '!Para postular hay que cumplir ciertos requisitos OBLIGATORIOS:\n\n' +
                '⬆️ • Ser nivel 3 o superior.\n' +
                '🔮 • Ser nivel 5 en Discord o superior.\n' +
                '🔎 • Responder 500 Dudas IC.\n' +
                '🚫 • Renunciar a la banda/facción.\n' +
                '🕛 • Tener suficiente tiempo.\n' +
                '🎩 • Ser paciente, educado y respetuoso.\n' +
                '📑 • Tener reportes mínimos.\n' +
                '❤️ • Ser leal a Daptyldroid.\n\n' +
                '**📒 ¿Cómo postular?**\n' +
                'Si cumples con todos los requisitos pulsa en el botón de abajo para postular.'
            )
            .setImage('https://cdn.discordapp.com/attachments/1330007698808246308/1360328755540787326/Picsart_25-04-11_13-59-03-323.jpg?ex=67fab861&is=67f966e1&hm=061bac21dafab239bc61103de43f5fe591d8feb83a9d582be5ce3a0f67ad9051&')
            .setFooter({ text: `🗳•Postulaciones STAFF servidor Daptyldroid`, iconURL: message.guild.iconURL() });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('postularse')
                    .setEmoji('👔')
                    .setLabel('POSTULAR')
                    .setStyle(ButtonStyle.Primary)
            );

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.channel.send('<:GamaSaurio:1298438994849304597>**Postulate para 👤formar parte del 👔equipo STAFF de <:GamaSaurio:1298438994849304597>Daptyldroid RolePlay.**');
        await message.delete().catch(console.error);
    },
};