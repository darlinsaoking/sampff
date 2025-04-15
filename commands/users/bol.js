const { EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const itemData = [];
const totalSlots = 10;

module.exports = {
    name: 'bol',
    description: 'Muestra tu inventario.',
    async execute(message) {
        const userId = message.author.id;
        let connection;

        try {
            connection = await pool.getConnection();

            const [userResults] = await connection.query('SELECT * FROM player WHERE id_discord = ?', [userId]);
            if (userResults.length > 0) {
                const usuario = userResults[0];
                const [inventoryResults] = await connection.query('SELECT * FROM pinventory WHERE id_player = ?', [usuario.id]);

                // Inicializar los slots con "Nada"
                const slots = Array(totalSlots).fill('Nada');

                // Llenar slots con items del inventario si existen
                inventoryResults.forEach(item => {
                    const { slot, type, name } = item;

                    // Si el item tiene un nombre en la columna 'name' de pinventory, lo usamos
                    const itemName = name || itemData.find(i => i.type === type)?.name || 'Undefined';

                    if (slot < totalSlots) {
                        slots[slot] = itemName;
                    }
                });

                // Obtener la skin del jugador
                const { skin } = usuario;
                const skinImage = `https://assets.open.mp/assets/images/skins/${skin}.png`;

                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({
                        name: `🔴 ${usuario.name}`,
                        iconURL: skinImage
                    })
                    .setDescription(`
**🧍 • BOLSILLOS**
**:billed_cap: • ${slots[0]}
🎒 • ${slots[1]}
:hand_splayed: • ${slots[2]}
:jeans: • ${slots[3]}
:jeans: • ${slots[4]}
:jeans: • ${slots[5]}
:jeans: • ${slots[6]}
:jeans: • ${slots[7]}
:jeans: • ${slots[8]}
:jeans: • ${slots[9]}**
                    `)
                    .setThumbnail(skinImage)
                    .setTimestamp()
                    .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });

                await message.channel.send({ embeds: [embed] });
                await message.delete().catch(console.error);
            } else {
                await message.channel.send('No se encontró tu usuario en la base de datos.');
            }
        } catch (error) {
            console.error('Error al obtener el Bolsillo:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: `❌ Error Bolsillos ${message.member.displayName}`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setDescription('Hubo un error al intentar obtener tu inventario. Por favor, intenta más tarde.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });

            await message.channel.send({ embeds: [errorEmbed] });
        } finally {
            if (connection) {
                connection.release();
            }
        }
    },
};
