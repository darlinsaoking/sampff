const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mysql = require('mysql2/promise');
require('dotenv').config();

module.exports = {
    name: 'veh',
    description: 'Muestra los autos del usuario que ejecuta el comando.',
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

            // Obtener los vehículos del jugador
            const [vehicles] = await connection.query('SELECT name, modelid FROM pvehicles WHERE id_player = ?', [usuario.id]);

            if (vehicles.length === 0) {
                return message.channel.send(`No tienes autos registrados.`);
            } 
            
            const { skin } = usuario;
            const skinImage = `https://assets.open.mp/assets/images/skins/${skin}.png`;

            // Crear la lista de vehículos
            const vehicleListTitle = vehicles.map((vehicle, index) => {
                const vehicleName = vehicle.name || `Vehículo ${vehicle.modelid}`;  // Usar el nombre del vehículo desde la DB
                return `${index + 1}️⃣ ${vehicle.modelid} **|** 🚙 **${vehicleName}**`;
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
                    name: '🚘 • MIS VEHÍCULOS', // Título de la sección de vehículos
                    value: vehicleListTitle,
                    inline: false,
                });

            const row = new ActionRowBuilder();
            vehicles.forEach((vehicle, index) => {
                const button = new ButtonBuilder()
                    .setCustomId(`vehicle_${index}`)
                    .setLabel(`${index + 1}`)
                    .setStyle(ButtonStyle.Primary);
                row.addComponents(button);
            });

            const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });

            const filter = interaction => interaction.customId.startsWith('vehicle_') && interaction.user.id === userId;
            const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (interaction) => {
                const index = parseInt(interaction.customId.split('_')[1]);
                const vehicle = vehicles[index];
                const vehicleName = vehicle.name || `Vehículo ${vehicle.modelid}`;  // Nombre del vehículo desde la DB
                const vehicleInfo = await getVehicleInfo(usuario.id, vehicle.modelid);

                const infoEmbed = new EmbedBuilder()
                    .setTitle(`:oncoming_automobile: • ID ${vehicle.modelid} | ${vehicleName}`)
                    .setColor(0x00ff00)
                    .addFields(
                        { name: ':fast_forward: Velocidad Máxima', value: `${vehicleInfo.max_vel} KM/H`, inline: true },
                        { name: ':fuelpump: Combustible', value: `${vehicleInfo.fuel} L`, inline: true },
                        { name: ':seat: Asientos', value: `${vehicleInfo.seats}`, inline: true },
                        { name: ':open_file_folder: Guantera', value: `${vehicleInfo.max_boot} L`, inline: true }
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
            message.channel.send('Hubo un error al obtener la información de tus autos.');
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    }
};

async function getVehicleInfo(playerId, modelid) {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        // Obtener detalles del vehículo usando modelid
        const [vehicleDetails] = await connection.query('SELECT max_vel, seats, gas, max_boot FROM pvehicles WHERE id_player = ? AND modelid = ?', [playerId, modelid]);

        if (vehicleDetails.length === 0) {
            return {
                max_vel: 'Desconocido',
                fuel: 'Desconocido',
                seats: 'Desconocido',
                max_boot: 'Desconocido'
            };
        }

        const vehicle = vehicleDetails[0];

        return {
            max_vel: vehicle.max_vel || 'Desconocido',
            fuel: vehicle.gas || 'Desconocido',
            seats: vehicle.seats || 'Desconocido',
            max_boot: vehicle.max_boot || 'Desconocido'
        };
    } catch (error) {
        console.error('Error al obtener información del vehículo:', error);
        return {
            max_vel: 'Error',
            fuel: 'Error',
            seats: 'Error',
            max_boot: 'Error'
        };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
