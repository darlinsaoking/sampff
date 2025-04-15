const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mysql = require('mysql2/promise');
require('dotenv').config();

module.exports = {
    name: 'casas',
    description: 'Muestra las casas del usuario que ejecuta el comando.',
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

            // Obtener información del jugador
            const [userResults] = await connection.query('SELECT * FROM player WHERE id_discord = ?', [userId]);

            if (userResults.length === 0) {
                return message.channel.send(`No he encontrado una cuenta asociada a tu ID.`);
            }

            const usuario = userResults[0];

            // Obtener las propiedades del jugador desde la tabla 'properties'
            const [properties] = await connection.query('SELECT name, id FROM properties WHERE id_player = ?', [usuario.id]);

            if (properties.length === 0) {
                return message.channel.send(`No tienes propiedades registradas.`);
            }

            const { skin } = usuario;
            const skinImage = `https://assets.open.mp/assets/images/skins/${skin}.png`;

            // Crear la lista de propiedades
            const propertyListTitle = properties.map((property, index) => {
                const propertyName = property.name || `Propiedad ${property.id}`;  // Usar el nombre de la propiedad desde la DB
                return `${index + 1}️⃣ ${property.id} **|** 🏠 **${propertyName}**`;
            }).join('\n');

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({
                    name: `🔴 • ${usuario.name}`,
                    iconURL: skinImage,
                })
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() })
                .setThumbnail(skinImage)
                .addFields({
                    name: '🏡 • MIS PROPIEDADES', // Título de la sección de propiedades
                    value: propertyListTitle,
                    inline: false,
                });

            const row = new ActionRowBuilder();
            properties.forEach((property, index) => {
                const button = new ButtonBuilder()
                    .setCustomId(`property_${index}`)
                    .setLabel(`${index + 1}`)
                    .setStyle(ButtonStyle.Primary);
                row.addComponents(button);
            });

            const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });

            const filter = interaction => interaction.customId.startsWith('property_') && interaction.user.id === userId;
            const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (interaction) => {
                const index = parseInt(interaction.customId.split('_')[1]);
                const property = properties[index];
                const propertyName = property.name || `Propiedad ${property.id}`;  // Nombre de la propiedad desde la DB

                const infoEmbed = new EmbedBuilder()
                    .setTitle(`🏠 • ID ${property.id} | ${propertyName}`)
                    .setColor(0x00ff00)
                    .addFields(
                        { name: ':key: Propietario', value: `Desconocido`, inline: true },  // Aquí puedes agregar el propietario si lo tienes
                        { name: ':house_with_garden: Ubicación', value: `Desconocido`, inline: true },  // Aquí también puedes agregar la ubicación si la tienes
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [infoEmbed], ephemeral: true });
            });

            collector.on('end', () => {
                row.components.forEach(button => button.setDisabled(true));
                sentMessage.edit({ components: [row] });
            });

        } catch (error) {
            console.error('Error al consultar la base de datos:', error);
            message.channel.send('Hubo un error al obtener la información de tus propiedades.');
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    }
};
