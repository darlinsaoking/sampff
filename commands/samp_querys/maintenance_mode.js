const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle  } = require('discord.js');
require('dotenv').config();
const mysql = require('mysql2/promise');
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'smantenimiento',
    description: 'Realiza una tarea de mantenimiento e inserta en la base de datos.',
    async execute(message) {
        const roleId = '1330007698283958289'; // Reemplaza con el ID del rol necesario
        const Announce_Channel = '1330007699047452720';

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

        try {
            const pool = mysql.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });

            let connection;
            try {
                connection = await pool.getConnection();
                await connection.query('INSERT INTO discord_tasks (type) VALUES (2)');
            } finally {
                if (connection) {
                    connection.release();
                }
            }

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({
                    name: `✅ Tarea de Mantenimiento Ejecutada`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('La tarea de mantenimiento ha sido **insertada con éxito** en la base de datos.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });

            const announce_channel = message.guild.channels.cache.get(Announce_Channel);
            const MaintenanceEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setAuthor({
                    name: `🔧·Mantenimiento Daptyldroid RolePlay Android📱|💻PC`,
                    iconURL: message.guild.iconURL()
                })
                .setDescription('🔧 **Daptyldroid está en mantenimiento.**\n⏳ ¡No te vayas! Volveremos pronto con todo funcionando mejor que nunca. 🙌')
                .setImage('https://media.discordapp.net/attachments/1330007698808246308/1360254143134175462/Picsart_25-04-11_09-01-02-101.jpg?ex=67fa72e4&is=67f92164&hm=fc28b69add2b2da2965f85817a409babcde8ec15d9a041d34cbba2a6aa1279e1&=&format=webp&width=1042&height=651')
                .setTimestamp()
                .setFooter({ text: `⚙️·El servidor GamaMobile se encuentra en mantenimiento.`, iconURL: message.guild.iconURL() });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ip_button')
                        .setLabel('199.127.60.172:7777')
                        .setEmoji('🔩')
                        .setStyle(ButtonStyle.Secondary)
                );

            await announce_channel.send({ embeds: [MaintenanceEmbed], components: [row] });
            await announce_channel.send('**:clock1:·¡¡ No te vayas !!, Volvemos en un rato a estar en línea.**');
            await message.channel.send({ embeds: [embed] });
        } catch (err) {
            console.error('Error al ejecutar el comando de mantenimiento:', err);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: `❌ Error ${message.member.displayName}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('Hubo un error al intentar ejecutar la tarea de mantenimiento. Por favor, intenta más tarde.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });

            await message.channel.send({ embeds: [errorEmbed] });
        }

        await message.delete().catch(console.error);
    },
};