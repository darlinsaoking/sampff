const { Events, EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const canalBienvenidaID = '1361518059587764315'; // Cambia por el canal real
        const canal = member.guild.channels.cache.get(canalBienvenidaID);
        if (!canal) return;

        // Imagen remota no se puede adjuntar directamente, usamos una URL visible en embed
        const imgURL = 'https://media.discordapp.net/attachments/1330007698808246308/1360254137161355294/Picsart_25-04-11_09-03-07-467.jpg?format=webp&width=1042&height=651';

        const embed = new EmbedBuilder()
            .setColor('#9D00FF')
            .setAuthor({
                name: '🌌 Bienvenida Galáctica',
                iconURL: member.user.displayAvatarURL({ dynamic: true }),
            })
            .setTitle(`🎉 ¡${member.user.username} ha aterrizado en Daptyls!`)
            .setDescription(`> 🪐 ¡Hola ${member}! Estamos emocionados de tenerte con nosotros.\n\n📜 Pasa por <#1361518060493734039> para leer las reglas\n🎁 ¡Recuerda reclamar tu rol inicial!\n\n> **Prepárate para la mejor experiencia RP.**`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setImage(imgURL)
            .setFooter({
                text: `Ahora somos ${member.guild.memberCount} miembros • ${member.guild.name}`,
                iconURL: member.guild.iconURL({ dynamic: true })
            })
            .setTimestamp();

        canal.send({
            content: `🚀 ¡Bienvenido <@${member.id}> a la **familia Daptyls**!`,
            embeds: [embed]
        });
    }
};
