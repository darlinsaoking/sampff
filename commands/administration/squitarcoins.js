const { EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
require('dotenv').config();
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'squitarcoins', // Comando para quitar coins
    description: 'Resta coins de la columna coins en la tabla player.',
    async execute(message, args, pool) {
        const roleId = '931910985202143252'; // Reemplaza con el ID de tu rol específico

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

        const user = message.mentions.users.first();
        const userNameOrId = user ? user.id : args[0];
        const amount = parseInt(args[1], 10);

        if (!userNameOrId || isNaN(amount)) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: `❌ Error SQUITARCOINS ${message.member.displayName}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('Modo de uso: !squitarcoins @usuario|nombre_apellido cantidad.')
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
                        name: `❌ Error SQUITARCOINS ${message.member.displayName}`,
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

            // Verificar si el usuario está desconectado
            if (usuario.connected !== 0) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({
                        name: `❌ Error SQUITARCOINS ${message.member.displayName}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setDescription(`🧍‍♂️· **${usuario.name} (${usuario.id}RP)** debe estar **(OFF)** para recibir **${amount > 0 ? '+coins' : '-coins'}${Math.abs(amount)}**.`)
                    .setTimestamp()
                    .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() });
                await message.channel.send({ embeds: [embed] });
                await message.delete().catch(console.error);
                return;
            }

            const nuevoCoins = usuario.coins - amount;  // Cambio de 'cash' a 'coins'

            // Actualizar la cantidad de coins
            await connection.query('UPDATE player SET coins = ? WHERE id = ?', [nuevoCoins, usuario.id]);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: `💰 Comando SQUITARCOINS ${message.member.displayName}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription(`🏦·**${usuario.name} (${usuario.id}RP)** ha perdido **🤑 ${amount} coins**.\n\n💰**Saldo actual:** ${nuevoCoins} coins`)
                .setTimestamp()
                .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() });
            await message.channel.send({ embeds: [embed] });
            await message.delete().catch(console.error);

        } catch (error) {
            console.error('Error al actualizar los coins:', error);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: `❌ Error SQUITARCOINS ${message.member.displayName}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('Hubo un error al intentar actualizar los coins. Por favor, intenta más tarde.')
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
