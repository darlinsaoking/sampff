const { EmbedBuilder } = require('discord.js');
require('dotenv').config();
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'ls',
    description: 'Teletransporta a un usuario a Los Santos.',
    async execute(message, args, pool) {
        const roleId = '931910985202143252';

        // Verifica permisos
        if (!message.member.roles.cache.has(roleId)) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: `⛔ Acceso Denegado - ${message.member.displayName}`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setDescription('No tienes permisos para usar este comando.')
                .setTimestamp()
                .setFooter({ text: message.author.tag, iconURL: message.guild.iconURL() });

            await message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(() => {}));
            return;
        }

        // Obtener usuario objetivo
        const user = message.mentions.users.first();
        const userId = user ? user.id : args[0];

        if (!userId) {
            return message.channel.send('Uso correcto: `!ls @usuario` o `!ls <id_discord>`');
        }

        try {
            const [results] = await pool.query('SELECT * FROM player WHERE id_discord = ?', [userId]);

            if (results.length === 0) {
                return message.channel.send('Usuario no encontrado en la base de datos.');
            }

            const player = results[0];
            const posX = 1552.50;
            const posY = -1675.60;
            const posZ = 16.19;

            const discordMessage = `Fuiste enviado a Los Santos por ${message.member.displayName} desde Discord.`;

            // Actualizar datos del jugador en la DB
            await pool.query(
                'UPDATE player SET pos_x = ?, pos_y = ?, pos_z = ?, discord_notice = ? WHERE id_discord = ?',
                [posX, posY, posZ, discordMessage, userId]
            );

            // Obtener skin del autor del comando
            const skinImage = await GetPlayerSkin(message.author.id);

            // Embed de confirmación
            const embed = new EmbedBuilder()
                .setColor('#808080') // Plomo
                .setAuthor({
                    name: `${player.name} fue enviado a Los Santos`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription(`**${player.name}** fue enviado a **Los Santos** por **${message.member.displayName}** desde Discord.`)
                .setThumbnail(skinImage)
                .setTimestamp()
                .setFooter({
                    text: message.client.user.username,
                    iconURL: message.client.user.displayAvatarURL(),
                });

            await message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('[LS DEBUG] Error en !ls:', error);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('❌ Ocurrió un error al intentar teletransportar al jugador.')
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });
        }

        await message.delete().catch(() => {});
    },
};
