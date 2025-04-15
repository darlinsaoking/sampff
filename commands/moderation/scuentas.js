const { EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
require('dotenv').config();
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'scuentas',
    description: 'Obtiene las cuentas asociadas.',
    async execute(message, args) {
        const roleId = '931910985202143252';
        
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
        const userNameOrId = user ? user.username : args[0];

        if (!userNameOrId) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: `❌ Error scuentas ${message.member.displayName}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('Modo de uso: !scuentas nombre_apellido o @usuario.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            await message.channel.send({ embeds: [embed] });
            await message.delete().catch(console.error);
            return;
        }

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
                        name: `❌ Error scuentas ${message.member.displayName}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setDescription('No se encontró ninguna cuenta del usuario.')
                    .setTimestamp()
                    .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
                await message.channel.send({ embeds: [embed] });
                await message.delete().catch(console.error);
                return;
            }

            const ip = results[0].ip;

            const [associatedAccounts] = await connection.query(
                'SELECT id, name, level, skin FROM player WHERE ip = ? LIMIT 20', 
                [ip]
            );

            if (associatedAccounts.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({
                        name: `❌ Error Scuentas ${message.member.displayName}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setDescription(`No se encontraron cuentas asociadas a la IP de **${userNameOrId}**.`)
                    .setTimestamp()
                    .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
                await message.channel.send({ embeds: [embed] });
                await message.delete().catch(console.error);
                return;
            }

            const formattedResults = associatedAccounts.map(player => {
                return `ID:${player.id}| ${player.name} NIVEL:${player.level}`;
            }).join('\n');

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({
                    name: `🧥 cuentas asociadas a ${userNameOrId}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription(formattedResults)
                .addFields(
                    { name: 'Cuentas encontradas', value: `Se han obtenido **${associatedAccounts.length}** cuenta${associatedAccounts.length > 1 ? 's' : ''}.`, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });

            // Agregar la miniatura de la skin en el embed
            if (results[0].skin) {
                const skinImage = `https://assets.open.mp/assets/images/skins/${results[0].skin}.png`;
                embed.setThumbnail(skinImage);
            }

            await message.channel.send({ embeds: [embed] });

            await message.delete().catch(console.error);

        } catch (error) {
            console.error('Error al obtener las cuentas:', error);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: `❌ Error SDARACCOUNTS ${message.member.displayName}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('Hubo un error al intentar obtener las cuentas. Por favor, intenta más tarde.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            await message.channel.send({ embeds: [embed] });
            await message.delete().catch(console.error);
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    }
};