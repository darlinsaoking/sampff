const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'postulacionesyt',
    description: 'Información sobre las postulaciones al staff de DaptylDroid.',
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
            .setColor('#FF0000')
            .setAuthor({
                name: `📌·YouTubers Daptyldroid RolePlay Android📱|💻PC`,
                iconURL: message.guild.iconURL()
            })
            .setDescription(
                '**:red_square:·—————————:small_red_triangle_down:Youtubers:small_red_triangle: ——————————·\n' +
                '----------:office_worker:Requisitos Youtuber -----------\n' +
                '--------------------------------------------**\n\n' +
                ':diamonds: · 50 suscriptores.\n' +
                ':postbox: · Vincular tu canal a discord.\n' +
                ':clipboard: · Subir tutorial de instalación de Samp Launcher (Android) o Open.MP Launcher (PC).\n' +
                ':busts_in_silhouette: · Tener 100 visitas en 3 video sobre GamaMobile.\n' +
                ':park: · Usar el !logo o !fondo o !app de GamaMobile en la miniatura del video.\n' +
                ':heart_exclamation: · Descripción del video agregar 🎮Juega ya desde: https://GamaMobile.xyz/.\n\n' +
                '**--------------------------------------------\n' +
                '----------------:gift:Recompensas--------------**\n\n' +
                ':coin: · 1 Gama [1 vez].\n' +
                ':trident: · VIP por 3 días [1 vez].\n' +
                ':billed_cap: · Accesorio exclusivo vinculado a tu canal [1 vez].\n' +
                ':yen: · 50.000B$ IC [1 vez].\n' +
                ':dollar: · Recompensa por invitado.\n' +
                ':closed_lock_with_key: · Código creador de contenido.\n' +
                ':tomato: · Rango <@&1288636152139612295> en discord.\n\n' +
                '**--------------------------------------------**\n' +
                ':white_small_square:Las recompensas pueden actualizarse en cualquier momento.\n' +
                ':information_source:En caso de estar interesado pulsa **YouTuber**  para solicitar.'
            )
            .setImage('https://media.discordapp.net/attachments/1330007698808246308/1344065830740295782/Picsart_25-02-25_16-57-09-715.jpg?ex=67bf8e59&is=67be3cd9&hm=5f489ead7a99edae43eaa4e991209983324f47f947b8897a12cd66eadb401476&=&format=webp&width=803&height=515')
            .setFooter({ text: `📌·YouTubers GamaMobile RolePlay Android📱|💻PC`, iconURL: message.guild.iconURL() });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('postularse_youtuber')
                    .setEmoji('🔴')
                    .setLabel('YOUTUBER')
                    .setStyle(ButtonStyle.Danger)
            );

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.channel.send('**Hola a todos esto es GamaMobile RolePlay, donde podrás Jugar a GTA RolePlay desde tu android en su versión más reciente con la aplicación de Samp Launcher de la Google Play.**');
        await message.delete().catch(console.error);
    },
};