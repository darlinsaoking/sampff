const { EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
require('dotenv').config();
const { GetPlayerSkin } = require('../../systems/user_get_skin');

const RANGO_DESCRIPCIONES = {
    0: "Ciudadano",
    1: "Ayudante",
    2: "Moderador",
    3: "Moderador Global",
    4: "Administrador"
};

module.exports = {
    name: 'sdarrango',
    description: 'Asigna un rango a un usuario.',
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
        const newRango = parseInt(args[1], 10);

        if (!userNameOrId || isNaN(newRango) || newRango < 0 || newRango > 5) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: `❌ Error SDARRANGO ${message.member.displayName}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('Modo de uso: !sdarrango nombre_apellido nivel.')
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
                        name: `❌ Error SDARRANGO ${message.member.displayName}`,
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
                        name: `❌ Error SDARRANGO ${message.member.displayName}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setDescription(`🧍‍♂️· **${usuario.name} (${usuario.id}RP)** debe estar **(OFF)** para recibir **⚖️${RANGO_DESCRIPCIONES[newRango]}**.`)
                    .setTimestamp()
                    .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() });
                await message.channel.send({ embeds: [embed] });
                await message.delete().catch(console.error);
                return;
            }

            // Actualizar el rango en la base de datos
            await connection.query('UPDATE player SET admin_level = ? WHERE id = ?', [newRango, usuario.id]);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({
                    name: `🔝 Comando SDARRANGO ${message.member.displayName}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription(`🕴️·**${usuario.name} (${usuario.id}RP)** ha recibido el rango **⚖️${RANGO_DESCRIPCIONES[newRango]}**.`)
                .setTimestamp()
                .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() });
            await message.channel.send({ embeds: [embed] });
            await message.delete().catch(console.error);

        } catch (error) {
            console.error('Error al actualizar el rango:', error);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: `❌ Error SDARRANGO ${message.member.displayName}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('Hubo un error al intentar actualizar el rango. Por favor, intenta más tarde.')
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