const { EmbedBuilder } = require('discord.js');
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'adm',
    description: 'El bot enviará el mensaje proporcionado como un embed a todos por DM.',
    async execute(message, args) {
        const AllowedRoles = [
            '931910985202143252'
        ];

        const guild = message.guild;

        // Verificar si el usuario tiene uno de los roles permitidos
        const SkinImage = await GetPlayerSkin(message.author.id);
        if (!message.member.roles.cache.some(role => AllowedRoles.includes(role.id))) {
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

        // Extraer el argumento 'Header' (se asume que es el segundo argumento)
        let Header = args[0];  // El segundo argumento será el Header del mensaje

        // Reemplazar el carácter ~ por espacio en el Header
        Header = Header.replace(/~/g, ' ');  // Reemplaza todos los ~ por espacios

        // Unir los argumentos después del Header como el mensaje
        const embedMessage = args.slice(1).join(' ').trim();  // El mensaje comienza después del Header
        if (!Header || !embedMessage) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: `❌ Mensaje no proporcionado ${message.member.displayName}`, iconURL: message.author.displayAvatarURL() })
                .setDescription('Por favor, proporciona un mensaje y encabezado para que el bot lo envíe como embed.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            await message.channel.send({ embeds: [embed] });
            return message.delete().catch(console.error);
        }

        // Crear y enviar el embed
        const embed = new EmbedBuilder()
            .setColor(0x2373ff)
            .setAuthor({ name: `📰 ·${Header} GamaMobile RolePlay Android📱|💻PC`, iconURL: message.guild.iconURL() })
            .setDescription(embedMessage)
            .setImage('https://media.discordapp.net/attachments/1330007698808246308/1344065830740295782/Picsart_25-02-25_16-57-09-715.jpg?ex=67bf8e59&is=67be3cd9&hm=5f489ead7a99edae43eaa4e991209983324f47f947b8897a12cd66eadb401476&=&format=webp&width=803&height=515')

        await message.channel.send({ embeds: [embed] });
        await message.delete().catch(console.error); // Eliminar el mensaje original

        const members = await guild.members.fetch();
        members.forEach(async (member) => {
            if (!member.user.bot) {
                try {
                    await member.send({ embeds: [embed] });
                    console.log(`Mensaje enviado a ${member.user.tag}`);
                } catch (error) {
                    console.error(`No se pudo enviar mensaje a ${member.user.tag}: ${error.message}`);
                }
            }
        });
    },
};