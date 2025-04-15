const { EmbedBuilder } = require('discord.js');
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'a',
    description: 'El bot enviará el mensaje proporcionado como un embed.',
    async execute(message, args, pool) {
        const rolesPermitidos = [
            '931910985202143252',
            '1236661918140338248',
        ];

        // Verificar si el usuario tiene uno de los roles permitidos
        const SkinImage = await GetPlayerSkin(message.author.id);
        if (!message.member.roles.cache.some(role => rolesPermitidos.includes(role.id))) {
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

        // Verificar la mención de rol
        const rolMencionado = message.mentions.roles.first();
        if (!rolMencionado) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: `❌ Rol no proporcionado ${message.member.displayName}`, iconURL: message.author.displayAvatarURL() })
                .setDescription('Por favor, menciona un rol antes del mensaje para que el bot lo envíe como embed.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });

            await message.channel.send({ embeds: [embed] });
            return message.delete().catch(console.error);
        }

        // Extraer el argumento 'Header' (se asume que es el segundo argumento)
        let Header = args[1];  // El segundo argumento será el Header del mensaje

        // Reemplazar el carácter ~ por espacio en el Header
        Header = Header.replace(/~/g, ' ');  // Reemplaza todos los ~ por espacios

        // Unir los argumentos después del Header como el mensaje
        const embedMessage = args.slice(2).join(' ').trim();  // El mensaje comienza después del Header
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
            .setColor('#00FF00')
            .setAuthor({ name: `📰 ·${Header} DaptylDroid RolePlay Android📱|💻PC`, iconURL: message.guild.iconURL() })
            .setDescription(embedMessage)
            .setTimestamp()
            .setImage('https://media.discordapp.net/attachments/1330007698808246308/1344065830740295782/Picsart_25-02-25_16-57-09-715.jpg?ex=67bf8e59&is=67be3cd9&hm=5f489ead7a99edae43eaa4e991209983324f47f947b8897a12cd66eadb401476&=&format=webp&width=803&height=515')
            .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        await message.channel.send({ content: `<@&${rolMencionado.id}>`, embeds: [embed] });
        await message.delete().catch(console.error); // Eliminar el mensaje original
    },
};