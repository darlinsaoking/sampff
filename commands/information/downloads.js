const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'descargas',
    description: 'Información sobre las descargas de clientes.',
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

        const PC_Embed = new EmbedBuilder()
			.setColor(0x2373ff)
			.setAuthor({ name: 'Open Multiplayer Launcher', iconURL: 'https://assets.open.mp/assets/images/assets/logo-dark-trans.png' })
			.setDescription(`
**|»** 🖥️PC: Gama Baja
**|»** 🔧Versiones:
**·** 📦**FULL**: 2.5GB · 🪤**RIP**: 500MB
**|»** ✅Disponible solo para [PC](https://github.com/openmultiplayer/launcher/releases)`)
			.setImage('https://cdn.discordapp.com/attachments/1330007698808246308/1360328755146526860/Picsart_25-04-11_14-00-14-545.jpg?ex=67fab860&is=67f966e0&hm=c6e63aa4ede6aa909db11f17163ca9d8dd51e82f7dc9b3dae3086c2c4a976397&')
			.setThumbnail('https://assets.open.mp/assets/images/assets/logo-dark-trans.png')
			.setFooter({ text: 'Open Multiplayer Launcher', iconURL: 'https://assets.open.mp/assets/images/assets/logo-dark-trans.png' });

        const DownloadLauncher = new ButtonBuilder()
        .setLabel('DESCARGAR LAUNCHER')
        .setEmoji('💻')
        .setURL('https://github.com/openmultiplayer/launcher/releases')
        .setStyle(ButtonStyle.Link);
        
        const DownloadRip = new ButtonBuilder()
        .setLabel('DESCARGAR RIP')
        .setEmoji('🪤')
        .setURL('https://drive.google.com/file/d/1I5u7xL6XOf5uWTMGRz0yY48FjXkNqQv_/view?usp=sharing')
        .setStyle(ButtonStyle.Link);

        const DownloadFull = new ButtonBuilder()
        .setLabel('DESCARGAR FULL')
        .setEmoji('📦')
        .setURL('https://amii.ir/files/hlm-gtasa.iso')
        .setStyle(ButtonStyle.Link);

        const PC_Downloads = new ActionRowBuilder().addComponents(DownloadLauncher, DownloadFull, DownloadRip);

        await message.channel.send({ embeds: [PC_Embed], components: [PC_Downloads] });

        const Android_Embed = new EmbedBuilder()
            .setColor(0x2373ff)
			.setAuthor({
					name: 'SA-MP Launcher',
					iconURL: 'https://play-lh.googleusercontent.com/S9iHZNrsP1od6ggCIGjQHV5Ex2bO20_jcDP-mfo6NtYB2MzAA3ANdQh8OQzp1tUGgfQ=w240-h480-rw'
				})
				.setDescription(`
**|»**📱Android: +7
**|»**🔧Versiones:
**·**📦**FULL**: 2.3GB ·🪤**LITE**: 900MB
**|»**✅Disponible para [Android](https://play.google.com/store/apps/details?id=ru.unisamp_mobile.launcher&pcampaignid=web_share)`)
				.setImage('https://media.discordapp.net/attachments/1330007698808246308/1344065830740295782/Picsart_25-02-25_16-57-09-715.jpg?ex=67bf8e59&is=67be3cd9&hm=5f489ead7a99edae43eaa4e991209983324f47f947b8897a12cd66eadb401476&=&format=webp&width=803&height=515')
				.setThumbnail('https://play-lh.googleusercontent.com/S9iHZNrsP1od6ggCIGjQHV5Ex2bO20_jcDP-mfo6NtYB2MzAA3ANdQh8OQzp1tUGgfQ=w240-h480-rw')
				.setFooter({
					text: 'SA-MP Launcher',
					iconURL: 'https://play-lh.googleusercontent.com/S9iHZNrsP1od6ggCIGjQHV5Ex2bO20_jcDP-mfo6NtYB2MzAA3ANdQh8OQzp1tUGgfQ=w240-h480-rw'
				});

        const DownloadAndroid = new ButtonBuilder()
        .setLabel('DESCARGAR')
        .setEmoji('💻')
        .setURL('https://play.google.com/store/apps/details?id=ru.unisamp_mobile.launcher&pcampaignid=web_share')
        .setStyle(ButtonStyle.Link);
        
        const Android_Downloads = new ActionRowBuilder().addComponents(DownloadAndroid);

        await message.channel.send({ embeds: [Android_Embed], components: [Android_Downloads] });

        await message.delete().catch(console.error);
    },
};