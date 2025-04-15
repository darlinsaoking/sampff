const { Client, GatewayIntentBits } = require('discord.js');
const samp = require('samp-query');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Configura tus datos aquí
const SERVER_IP = '209.222.97.93'; // IP de tu servidor
const SERVER_PORT = 7777;       // Puerto del servidor SA:MP
const CHANNEL_ID = '1359662162016211016'; // ID del canal de voz que cambiará nombre

const queryOptions = {
    host: SERVER_IP,
    port: SERVER_PORT,
    timeout: 1000
};

client.once('ready', () => {
    console.log(`Bot conectado como ${client.user.tag}`);

    setInterval(() => {
        samp.query(queryOptions, (error, response) => {
            if (error) {
                console.error('Error al consultar el servidor:', error.message);
                return;
            }

            const playerCount = response.players.length;
            const newChannelName = `👥 ${playerCount}·Users`;

            const channel = client.channels.cache.get(CHANNEL_ID);
            if (channel) {
                channel.setName(newChannelName)
                    .then(() => console.log(`Canal actualizado: ${newChannelName}`))
                    .catch(console.error);
            }
        });
    }, 30000); // Cada 30 segundos
});

client.login(process.env.BOT_TOKEN);
