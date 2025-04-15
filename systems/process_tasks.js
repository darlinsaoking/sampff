const { EmbedBuilder, Events } = require('discord.js');
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

async function CheckDiscordTasks(client) {
    const [rows] = await pool.execute('SELECT * FROM discord_tasks;');

    if (rows.length > 0) {
        for (let i = 0; i < rows.length; i++) {
            const task = rows[i];

            if (task.type === 0) {
                const channel = client.channels.cache.get(task.channelid);

                if (channel) {
                    if (task.embed <= 0) {
                        await channel.send(`${task.message}`);
                    } else {
                        const embed = new EmbedBuilder();
                        embed.setDescription(`${task.message}`)

                        if (task.color) embed.setColor(`#${task.color}`)
                        if (task.tittle) embed.setAuthor({name: `${task.tittle}`})
                        if (task.footer_text) embed.setFooter(`${task.footer_text}`)
                        if (task.thumbnail) embed.setThumbnail(`${task.thumbnail}`)
                        if (task.image) embed.setImage(`${task.image}`)
                    }
                }

                task.type = -1;
                await pool.execute('DELETE FROM discord_tasks WHERE id = ?;', [task.id]);
            }
        }
    }
}

module.exports = (client) => {
    client.once('ready', async () => {
        setInterval(async () => {
            await CheckDiscordTasks(client);
        }, 1000);
    });
};

