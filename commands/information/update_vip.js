const mysql = require('mysql2/promise');
require('dotenv').config();

let interval;

module.exports = {
    name: 'vip3',
    description: 'Inicia la actualización automática de roles VIP cada 30 segundos.',
    async execute(message) {
        const vipRoleId = '1330007698283958289'; // Reemplaza con el ID del rol VIP
        const logChannelId = '1330007698929877030'; // Reemplaza con el ID del canal de log

        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (!logChannel) {
            return message.reply('El canal de registro no se encontró.');
        }

        if (interval) {
            return message.reply('La actualización automática ya está en marcha.');
        }

        interval = setInterval(async () => {
            let connection;
            try {
                connection = await mysql.createConnection({
                    host: process.env.DB_HOST,
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DB_NAME,
                });

                const guildMembers = message.guild.members.cache;
                let logMessage = '';

                for (const member of guildMembers.values()) {
                    let [results] = await connection.query('SELECT vip FROM player WHERE id_discord = ?', [member.id]);

                    if (results.length > 0 && results[0].vip) {
                        if (!member.roles.cache.has(vipRoleId)) {
                            await member.roles.add(vipRoleId);
                            logMessage += `Rol VIP asignado a ${member.user.tag}\n`;
                        }
                    } else {
                        if (member.roles.cache.has(vipRoleId)) {
                            await member.roles.remove(vipRoleId);
                            logMessage += `Rol VIP eliminado de ${member.user.tag}\n`;
                        }
                    }
                }

                if (logMessage) {
                    await logChannel.send(logMessage || 'No se realizaron cambios en los roles VIP.');
                }

            } catch (error) {
                console.error('Error al asignar roles VIP:', error);
                await logChannel.send('Hubo un error al intentar actualizar los roles VIP.');
            } finally {
                if (connection) {
                    await connection.end();
                }
            }
        }, 30000); // 30 segundos

        message.reply('En proceso 💡');
    },

    stop: async () => {
        clearInterval(interval);
        interval = null;
    }
};