const { EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
require('dotenv').config();
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'sls',
    description: 'Muestra la información del jugador y lo manda a LS.',
    async execute(message, args, pool) {
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
        const userNameOrId = user ? user.id : args[0];

        if (!userNameOrId) {
            const embedUsage = new EmbedBuilder()
                .setTitle(":blue_heart: Gama RolePlay")
                .setDescription("**Modo de uso: $sls @usuario o $sls nombre.**")
                .setColor(0x00ff00)
                .setFooter({ text: "@Gama Roleplay", iconURL: "https://cdn.discordapp.com/attachments/1265847206087233599/1292201050459340893/240_sin_titulo_20241005210526.png" })
                .setThumbnail("https://cdn.discordapp.com/attachments/1265847206087233599/1292201050459340893/240_sin_titulo_20241005210526.png");
            return message.channel.send({ embeds: [embedUsage] });
        }

        let connection;
        try {
            connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });

            // Comprobar conexión
            await connection.query('SELECT 1');

            // Obtener datos del jugador basado en el ID de Discord o nombre
            let [playerResults] = await connection.query('SELECT * FROM player WHERE id_discord = ? OR name = ?', [userNameOrId, userNameOrId]);

            if (playerResults.length === 0) {
                return message.channel.send("**No se encontró información para el usuario especificado.**");
            }

            const { id, name, skin } = playerResults[0];
            const skinImage = `https://assets.open.mp/assets/images/skins/${skin}.png`;

            // Mandar al usuario a Los Santos
            await connection.query(`UPDATE player SET pos_x = 1555.400390, pos_y = -1675.611694, pos_z = 16.195312, angle = 0 WHERE id = ?`, [id]);

            const embedSuccess = new EmbedBuilder()
                .setTitle(":blue_heart: Gama RolePlay")
                .setDescription(`**${name} (ID: ${id}) ha sido enviado a Los Santos.**`)
                .addFields({ name: 'Skin Actual:', value: `![Skin](${skinImage})`, inline: true })
                .setColor(0x00ff00)
                .setFooter({ text: "@Gama Roleplay", iconURL: "https://cdn.discordapp.com/attachments/1265847206087233599/1292201050459340893/240_sin_titulo_20241005210526.png" })
                .setThumbnail(skinImage);

            await message.channel.send({ embeds: [embedSuccess] });
        } catch (error) {
            console.error("Error al conectar a la base de datos:", error);
            message.channel.send("**Ocurrió un error al acceder a la base de datos.**");
        } finally {
            if (connection) {
                await connection.end();
            }
        }

        // Eliminar el mensaje de comando solo si el embed se envía correctamente
        await message.delete().catch(console.error);
    },
};