const { EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
	name: 'spolicia',
	description: 'Dar el rol de policía a un usuario',
	async execute(message) {
		const rolesAllowed = ['1330007698283958284']; // Solo el rol de "Comisario" puede ejecutar este comando
		// Verificar si el usuario tiene el rol permitido
		const SkinImage = await GetPlayerSkin(message.author.id);
		if (!message.member.roles.cache.some(role => rolesAllowed.includes(role.id))) {
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
		if (!user) {
			const embed = new EmbedBuilder()
			.setColor('#FF0000')
			.setAuthor({ name: `❌ Error ${message.member.displayName}`, iconURL: message.guild.iconURL() })
			.setDescription('Mencione a un usuario para darle el rol de policía.')
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
			.setTimestamp()
			.setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
			message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
			return;
		}

		// Dar el rol de policía al usuario mencionado
		const policeRole = message.guild.roles.cache.get('1330316226865664042');
		if (!policeRole) {
			const embed = new EmbedBuilder()
			.setColor('#FF0000')
			.setAuthor({ name: `❌ Error ${message.member.displayName}`, iconURL: message.guild.iconURL() })
			.setDescription('El rol de policía no existe.')
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
			const [results] = await connection.query('SELECT name FROM player WHERE id_discord = ?', [member.id]);

			if (results.length > 0) {
				const player = results[0];
				await member.setNickname(`👮» ${player.name}`);
			}
		} finally {
			if (connection) {
				connection.release();
			}
		}

		await member.roles.add(policeRole);

		const embed = new EmbedBuilder()
		.setColor('#00FF00')
		.setAuthor({ name: `👮• Comisario ${message.member.displayName}`, iconURL: message.guild.iconURL() })
		.setDescription(`»Se ha dado el rol de policía a **${user.displayName}**.`)
		.setTimestamp()
		.setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
		message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
	},
};