const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Crea un pool para la conexión a la base de datos
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// IDs de roles para cada nivel
const roleIds = [
    '1288636152097669171',
    '1288636152097669172',
    '1288636152097669173',
    '1288636152097669174',
    '1288636152097669175',
    '1288636152097669176',
    '1288636152097669177',
    '1288636152097669178',
    '1288636152097669179',
    '1288636152114450502',
    '1288636152114450503',
    '1288636152114450504',
    '1288636152114450505',
    '1288636152114450506',
    '1288636152114450507',
    '1288636152114450508',
    '1288636152114450509',
    '1288636152114450510',
    '1288636152114450511',
    '1288636152126898266',
    '1288636152126898267',
    '1288636152126898268',
    '1288636152126898269',
    '1288636152126898270',
    '1288636152126898271'
];

module.exports = {
    name: 'rank',
    description: 'Muestra la información del rango del usuario.',
    async execute(message) {
        const userId = message.author.id;

        try {
            const [rows] = await pool.execute('SELECT * FROM discord_users WHERE userId = ?', [userId]);

            if (rows.length > 0) {
                const user = rows[0];
                const currentRole = message.guild.roles.cache.get(roleIds[user.level - 1]);
                const roleName = currentRole ? currentRole.name : 'Ninguno';

                // Crear un embed con el texto "🎚️•Rank DISCORD" seguido por el nombre del autor
                const embed = new EmbedBuilder()
                    .setColor(0x2373ff) // Color verde
                    .setTitle(`🎚️•Rank DISCORD ${message.author.username}`) // Título con Rank DISCORD seguido del nombre de usuario
                    .setDescription(
                        `**:levitate:• Nivel** **${user.level}**\n` +
                        `**✨ Experiencia** **${user.experience}/${(user.level + 1) * 100}**`
                    ) // Descripción con formato en negrita
                    .setThumbnail(message.author.displayAvatarURL()) // Foto de perfil del usuario
                    .setTimestamp() // Fecha y hora
                    .setFooter({ text: `Solicitado por ${message.author.username}`, iconURL: message.author.displayAvatarURL() });

                // Crear un botón con el rol actual en color negro (estilo "Secondary")
                const button = new ButtonBuilder()
                    .setCustomId('show_role')
                    .setLabel(`${roleName}`)
                    .setStyle(ButtonStyle.Secondary); // Estilo del botón negro

                const row = new ActionRowBuilder().addComponents(button);

                // Enviar el embed con el botón
                await message.channel.send({ embeds: [embed], components: [row] });
                await message.delete(); // Elimina el mensaje original
            } else {
                message.channel.send('No tienes datos de nivel. Participa en el chat para ganar experiencia.');
            }
        } catch (error) {
            console.error('Error en la base de datos:', error);
            message.channel.send('Hubo un error al acceder a la base de datos.');
        }
    }
};
