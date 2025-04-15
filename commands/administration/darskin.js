const { EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
require('dotenv').config();

module.exports = {
    name: 'daraccesorio', // Comando para dar un accesorio
    description: 'Añade un accesorio al inventario del jugador (pinventory).',
    async execute(message, args, pool) {
        const roleId = '1330007698283958289'; // Reemplaza con el ID de tu rol específico

        const user = message.mentions.users.first();
        const userNameOrId = user ? user.id : args[0];
        const accesorioId = args[1]; // ID del accesorio (puede ser alas, totem, etc.)
        const cantidad = parseInt(args[2], 10); // Cantidad de ese accesorio que se desea agregar

        // Lista de tipos de accesorios
        const accesoriosTipos = {
            60: 'Alas',
            52: 'Totem',
            // Puedes agregar más tipos aquí, por ejemplo:
            // 61: 'Espada',
            // 62: 'Capa',
        };

        if (!userNameOrId || !accesorioId || isNaN(cantidad) || !accesoriosTipos[accesorioId]) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: `❌ Error DARACCESORIO ${message.member.displayName}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('Modo de uso: !daraccesorio @usuario|nombre_apellido accesorio_id cantidad.')
                .setTimestamp()
                .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() });
            await message.channel.send({ embeds: [embed] });
            await message.delete().catch(console.error);
            return;
        }

        // Conectar a la base de datos
        let connection;
        try {
            connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });

            let [results] = await connection.query('SELECT * FROM player WHERE id_discord = ? OR name = ?', [user ? user.id : userNameOrId, userNameOrId]);

            if (results.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({
                        name: `❌ Error DARACCESORIO ${message.member.displayName}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setDescription('No se encontró ninguna cuenta del usuario.')
                    .setTimestamp()
                    .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() });
                await message.channel.send({ embeds: [embed] });
                await message.delete().catch(console.error);
                return;
            }

            const usuario = results[0];

            // Verificar si el jugador está desconectado (si es necesario)
            if (usuario.connected !== 0) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({
                        name: `❌ Error DARACCESORIO ${message.member.displayName}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setDescription(`🧍‍♂️· **${usuario.name}** debe estar desconectado para recibir el accesorio.`)
                    .setTimestamp()
                    .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() });
                await message.channel.send({ embeds: [embed] });
                await message.delete().catch(console.error);
                return;
            }

            // Buscar el inventario de accesorios del jugador
            let [inventory] = await connection.query('SELECT * FROM pinventory WHERE player = ?', [usuario.id]);

            // Si no existe inventario, crear uno
            if (inventory.length === 0) {
                await connection.query('INSERT INTO pinventory (player, slot, type, name, extra) VALUES (?, ?, ?, ?, ?)', [usuario.id, 1, accesorioId, accesoriosTipos[accesorioId], '']);
                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setAuthor({
                        name: `💎 Comando DARACCESORIO ${message.member.displayName}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setDescription(`🎉· **${usuario.name}** ha recibido el accesorio **${accesoriosTipos[accesorioId]}** y ha sido añadida a su inventario.`)
                    .setTimestamp()
                    .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() });
                await message.channel.send({ embeds: [embed] });
                await message.delete().catch(console.error);
                return;
            }

            // Si el inventario existe, actualizamos el accesorio
            let nextSlot = inventory.length + 1; // El siguiente slot para añadir el accesorio

            for (let i = 0; i < cantidad; i++) {
                await connection.query('INSERT INTO pinventory (player, slot, type, name, extra) VALUES (?, ?, ?, ?, ?)', [usuario.id, nextSlot + i, accesorioId, accesoriosTipos[accesorioId], '']);
            }

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({
                    name: `💎 Comando DARACCESORIO ${message.member.displayName}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription(`🎉· **${usuario.name}** ha recibido **${cantidad}** veces el accesorio **${accesoriosTipos[accesorioId]}** y ha sido añadido a su inventario.`)
                .setTimestamp()
                .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() });
            await message.channel.send({ embeds: [embed] });
            await message.delete().catch(console.error);

        } catch (error) {
            console.error('Error al actualizar el inventario de accesorios:', error);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: `❌ Error DARACCESORIO ${message.member.displayName}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('Hubo un error al intentar añadir el accesorio. Por favor, intenta más tarde.')
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
