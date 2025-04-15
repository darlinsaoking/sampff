const { EmbedBuilder } = require('discord.js');
require('dotenv').config();
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'spest',
    description: 'Muestra las estadísticas de un usuario específico.',
    async execute(message, args, pool) {
        const roleId = '931910985202143252'; // Reemplaza con el ID de tu rol específico
        let SkinImage;

        SkinImage = await GetPlayerSkin(message.author.id);
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

        // Verificar si se mencionó a un usuario o se proporcionó un nombre
        const user = message.mentions.users.first();
        const userNameOrId = user ? user.id : args[0];

        if (!userNameOrId) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: `❌ Error SPEST ${message.member.displayName}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('Modo de uso: !spest nombre_apellido.')
                .setTimestamp()
                .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() });
            await message.delete().catch(console.error);
            return message.channel.send({ embeds: [embed] });
        }

        try {
            let results;
            if (user) {
                // Buscar el usuario por id_discord
                [results] = await pool.query('SELECT * FROM player WHERE id_discord = ?', [user.id]);
            } else {
                // Buscar el usuario por nombre
                [results] = await pool.query('SELECT * FROM player WHERE name = ?', [userNameOrId]);
            }

            if (results.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({
                        name: `❌ Error SPEST ${message.member.displayName}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setDescription('No se encontró ninguna cuenta del usuario.')
                    .setTimestamp()
                    .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() });
                await message.delete().catch(console.error);
                return message.channel.send({ embeds: [embed] });
            }

            const usuario = results[0];

            // Obtener los trabajos activos del usuario
            const [workResults] = await pool.query('SELECT w.name FROM pworks pw JOIN works w ON pw.id_work = w.id WHERE pw.id_player = ?', [usuario.id]);
            const trabajos = workResults.map(row => row.name).join(', ') || 'Ninguno';

            // Obtener el nombre de la banda
            let crewName = 'Ninguna';
            if (usuario.crew) {
                const [crewResults] = await pool.query('SELECT name FROM crews WHERE id = ?', [usuario.crew]);
                if (crewResults.length > 0) {
                    crewName = crewResults[0].name.replace(/\{.*?\}/g, ''); // Eliminando códigos de color
                }
            }

            SkinImage = await GetPlayerSkin(user.id);
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({
                    name: `🟢 Estadisticas de ${usuario.name}`, // Usamos `name` en lugar de `nickname`
                    iconURL: message.guild.iconURL()
                })
                .setDescription(`**👔 ID-DB: ${usuario.id}RP**\n**👤 Nombre: ${usuario.name}**\n**💼 Trabajos: ${trabajos}**\n**☠️ Banda: ${crewName}**\n**🪙 Monedas: ${usuario.coins}**\n**🍔 Hambre: ${Math.floor(usuario.hungry)}**\n**🍹 Sed: ${Math.floor(usuario.thirst)}**\n**💵 Dinero en Efectivo: ${usuario.cash}**\n**🏦 Dinero en Banco: ${usuario.bank_money}**`)
                .setThumbnail(`${SkinImage}`)
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            await message.channel.send({ embeds: [embed] });
        } catch (err) {
            console.error('Error al obtener la información de la cuenta:', err);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: `❌ Error SPEST ${message.member.displayName}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('Hubo un error al intentar obtener la información de la cuenta. Por favor, intenta más tarde.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });

            await message.channel.send({ embeds: [errorEmbed] });
        }

        // Eliminar el mensaje de comando solo si el embed se envía correctamente
        await message.delete().catch(console.error);
    },
};