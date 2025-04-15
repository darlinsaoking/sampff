const { EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
require('dotenv').config();

module.exports = {
    name: 'inv',
    description: 'Muestra tu inventario.',
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
                        name: `❌ Error INV ${message.member.displayName}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setDescription('No se encontró ninguna cuenta vinculada a tu usuario de Discord.')
                    .setTimestamp()
                    .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() });
                await message.channel.send({ embeds: [embed] });
                await message.delete().catch(console.error);
                return;
            }

            const usuario = results[0];

            // Obtener la skin del usuario
            const { skin } = usuario;
            const skinImage = `https://assets.open.mp/assets/images/skins/${skin}.png`; // URL de la skin

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({
                    name: `🟢 ${usuario.name}`,
                    iconURL: skinImage, // Usar la skin como icono
                })
                .setDescription(`:bar_chart: **INVENTARIO\n:toolbox: Piezas Mecánico ${usuario.mechanic_pieces}\n:pill: Medicina ${usuario.medicine} | ${usuario.seed_medicine}:seedling:\n:herb: Marihuana ${usuario.cannabis} | ${usuario.seed_cannabis}:seedling:\n:syringe: Crack ${usuario.crack} | ${usuario.seed_crack}:seedling:**`)
                .setThumbnail(skinImage) // Usar la skin como miniatura
                .setTimestamp()
                .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() });

            await message.channel.send({ embeds: [embed] });
            await message.delete().catch(console.error);

        } catch (error) {
            console.error('Error al obtener el inventario:', error);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: `❌ Error INV ${message.member.displayName}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('Hubo un error al intentar obtener tu inventario. Por favor, intenta más tarde.')
                .setTimestamp()
                .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() });
            await message.channel.send({ embeds: [embed] });
            await message.delete().catch(console.error);
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    }
};
