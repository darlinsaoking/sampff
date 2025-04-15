const { EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
require('dotenv').config();

module.exports = {
    name: 'cuenta',
    description: 'Muestra tu cuenta.',
    async execute(message) {
        const userId = message.author.id;

        let connection;
        try {
            connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });

            let [results] = await connection.query('SELECT * FROM player WHERE id_discord = ?', [userId]);

            if (results.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({
                        name: `❌ Error Cuenta ${message.member.displayName}`,
                    })
                    .setDescription('No se encontró ninguna cuenta vinculada a tu usuario de Discord.')
                    .setTimestamp()
                    .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
                await message.channel.send({ embeds: [embed] });
                await message.delete().catch(console.error);
                return;
            }

            const usuario = results[0];

            // Obtener el nombre de la banda
            let banda = 'Ninguna';
            if (usuario.crew) {
                const [crewResults] = await connection.query('SELECT name FROM crews WHERE id = ?', [usuario.crew]);
                if (crewResults.length > 0) {
                    banda = crewResults[0].name.replace(/{[^}]+}/g, '').trim();
                }
            }

            const vipMessage = usuario.vip ? '〽️ • Membresía VIP\n' : '';
            const bandaMessage = banda !== 'Ninguna' ? `☠️ • Banda: ${banda}` : '';

            // Obtener el rango del usuario basado en la columna `admin_level`
            const rankMessages = [
                'Usuario',        // admin_level 0
                'Ayudante',       // admin_level 1
                'Moderador',      // admin_level 2
                'Moderador Global', // admin_level 3
                'Administrador',   // admin_level 4
            ];
            const rankMessage = rankMessages[usuario.admin_level] || 'Desconocido';

            // Obtener la skin del usuario
            const { skin } = usuario;
            const skinImage = `https://assets.open.mp/assets/images/skins/${skin}.png`; // URL de la skin

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({
                    name: `🎈 • ${usuario.name}`,
                    iconURL: skinImage, // Usar la skin como icono
                })
                .setDescription(`🎈 • **${rankMessage}\n🎮 Nivel ${usuario.level} | 🕹️ EXP ${usuario.rep}\n${vipMessage}${bandaMessage}**`)
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() })
                .setThumbnail(skinImage); // Agregar la skin como miniatura

            await message.channel.send({ embeds: [embed] });
            await message.delete().catch(console.error);

        } catch (error) {
            console.error('Error al obtener la cuenta:', error);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: `❌ Error Cuenta ${message.member.displayName}`,
                })
                .setDescription('Hubo un error al intentar obtener tu cuenta. Por favor, intenta más tarde.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            await message.channel.send({ embeds: [embed] });
            await message.delete().catch(console.error);
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    }
};
