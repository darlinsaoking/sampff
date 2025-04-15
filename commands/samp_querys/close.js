const { EmbedBuilder } = require('discord.js');
require('dotenv').config();
const mysql = require('mysql2/promise');
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'close',
    description: 'Realiza una tarea para cerrar el servidor.',
    async execute(message) {
        const roleId = '1330007698283958289'; // Reemplaza con el ID del rol necesario

        const SkinImage = await GetPlayerSkin(message.author.id);
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

        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        let connection;
        try {
            connection = await pool.getConnection();
            await connection.query('INSERT INTO discord_tasks (type) VALUES (3)');
        } finally {
            if (connection) {
                connection.release();
            }
        }

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setAuthor({
                name: `✅ Tarea exit Ejecutada`,
                iconURL: message.author.displayAvatarURL()
            })
            .setDescription('La tarea exit ha sido **insertada con éxito** en la base de datos.')
            .setTimestamp()
            .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });

        await message.channel.send({ embeds: [embed] });
        await message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
    },
};