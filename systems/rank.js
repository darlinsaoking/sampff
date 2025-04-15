const { EmbedBuilder, Events } = require('discord.js');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Crear un pool para la conexión a la base de datos
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// IDs de roles para cada nivel
const roleIds = [
    '1361515472603840562',
    '1361515473984028843',
    '1361515474650923163',
    '1361515476064276733',
    '1361515476223529041',
    '1361515476991217876',
    '1361515479344349194',
    '1361515480686526576',
    '1361515481496031276',
    '1361515482976489626',
    '1361515483127615589',
    '1361515484134248549',
    '1361515486474539269',
    '1361515486969331742',
    '1361515487477104814',
    '1361515488727007356',
    '1361515490756923414'
];

// Función para añadir experiencia
async function addExperience(userId, guildId, amount, client, channel) {
    const [rows] = await pool.execute('SELECT * FROM discord_users WHERE userId = ?', [userId]);

    if (rows.length > 0) {
        const user = rows[0];
        user.experience += amount;
        await checkLevelUp(user, guildId, client, channel);
        await pool.execute('UPDATE discord_users SET experience = ? WHERE userId = ?', [user.experience, userId]);
    } else {
        await pool.execute('INSERT INTO discord_users (userId, level, experience) VALUES (?, ?, ?)', [userId, 1, amount]);
    }
}

// Función para comprobar si el usuario sube de nivel
async function checkLevelUp(user, guildId, client, channel) {
    const levels =  [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3500, 4000, 6000, 8000, 9000];

    if (user.experience >= levels[user.level - 1]) {
        user.level++;
        user.experience = 0;
        console.log(`¡${user.userId} ha subido al nivel ${user.level}!`);

        const guild = await client.guilds.fetch(guildId);
        const member = await guild.members.fetch(user.userId);

        // Remueve el rol anterior
        if (user.level > 1) {
            const previousRoleId = roleIds[user.level - 2];
            const previousRole = guild.roles.cache.get(previousRoleId);
            if (previousRole) {
                await member.roles.remove(previousRole);
            }
        }

        // Asigna el nuevo rol
        const newRoleId = roleIds[user.level - 1];
        const newRole = guild.roles.cache.get(newRoleId);
        if (newRole) {
            await member.roles.add(newRole);
            
            // Usa el canal donde se envió el último mensaje
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Rank')
                .setDescription(`🧍•:arrow_up: <@${user.userId}> ha subido a nivel ${user.level} y ha obtenido el rol **${newRole.name}**!`)
                .setThumbnail(member.displayAvatarURL())
                .setTimestamp();

            try {
                await channel.send({ embeds: [embed] });
            } catch (error) {
                console.error('Error al enviar el mensaje:', error);
            }
        }

        await pool.execute('UPDATE discord_users SET level = ?, experience = ? WHERE userId = ?', [user.level, user.experience, user.userId]);
    }
}

module.exports = (client) => {
    client.on(Events.ClientReady, () => {
        console.log(`Logged in as ${client.user.tag}`);
    });

    // Evento de mensaje
    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot) return;
        if (!message.guild) return;

        // Añadir experiencia al usuario
        await addExperience(message.author.id, message.guild.id, 5, client, message.channel);
    });

    // Inicia el cliente
    client.login(process.env.DISCORD_TOKEN);
};
