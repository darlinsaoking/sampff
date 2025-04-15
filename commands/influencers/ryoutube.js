const { EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'ryoutube',
    description: 'Expulsar al jugador de el equipo de youtubers.',
    async execute(message, args) {
        const rolesPermitidos = [
            '1330007698283958289',
            '1330007698283958289',
        ];

        const SkinImage = await GetPlayerSkin(message.author.id);
        if (!message.member.roles.cache.some(role => rolesPermitidos.includes(role.id))) {
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

        const YoutubeRole = message.guild.roles.cache.get('1288636152139612295');

        const user = message.mentions.users.first();
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: `❌ Error mención ${message.member.displayName}`, iconURL: message.guild.iconURL() })
                .setDescription('Mencione a un usuario para expulsar de el equipo de youtubers.')
                .setThumbnail(`${SkinImage}`)
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
            return;
        }

		const member = message.guild.members.cache.get(user.id);
		if (!member) {
			const embed = new EmbedBuilder()
			.setColor('#FF0000')
			.setAuthor({ name: `❌ Error ${message.member.displayName}`, iconURL: message.guild.iconURL() })
			.setDescription('El usuario no está en el servidor.')
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
            const [results] = await connection.query('SELECT id, name FROM player WHERE id_discord = ?', [member.id]);

            if (results.length > 0) {
                const player = results[0];

                await member.setNickname(`👤» ${player.name}`);
                await connection.query('DELETE FROM referred_codes WHERE owner_id = ?', [player.id]);
            }
        } finally {
            if (connection) {
                connection.release();
            }
        }

        await member.roles.remove(YoutubeRole);

		const embed = new EmbedBuilder()
		.setColor(0x2373ff)
		.setAuthor({ name: `🎥• Youtube ${message.member.displayName}`, iconURL: message.guild.iconURL() })
		.setDescription(`»Se expulsado a **${user.displayName}** de el equipo de youtubers.`)
		.setTimestamp()
		.setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
		message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
    },
};