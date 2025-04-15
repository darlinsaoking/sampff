const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberAdd',
    execute(member) {
        const welcomeChannelId = '1288636153267884191'; // Reemplaza con el ID del canal de bienvenidas
        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
        if (!welcomeChannel) return;

        const welcomeEmbed = new EmbedBuilder()
            .setColor('#00FF00') // Color del borde del embed
            .setTitle('¡Bienvenido/a, Sistema De Bienvenidas de GamaMobile')
            .setDescription(`Hola ${member}, bienvenido/a al servidor, te recomiendo pasarte por <#1288636153267884192> & <#1288636153419006022> Para evitar jailes, sanciones, o hasta Baneos Recuerda Pasarte por <#1288636153267884190> Para completar tu registro :central: **${member.guild.name}**. ¡Esperamos que disfrutes tu estancia!`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true })) // Muestra el avatar del nuevo miembro
            .setImage('https://cdn.discordapp.com/attachments/1265847206087233599/1292201457160032296/240_sin_titulo_20241005210659.png?ex=67043163&is=6702dfe3&hm=e778fb7378263e84de1df60b8c3deb7a9747942bbc40c6d0be6ad8af6f64a795&') // Reemplaza con la URL de la imagen que deseas usar
            .setTimestamp()
            .setFooter({ text: '¡Estamos felices de tenerte aquí!' });
            
        welcomeChannel.send({ content: member.toString(), embeds: [welcomeEmbed] }); // Menciona al usuario y envía el embed
    },
};
