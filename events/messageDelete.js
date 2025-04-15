const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const LOG_CHANNEL_ID = '1361518036506640456'; // ID del canal donde se enviarán los mensajes eliminados

module.exports = {
	name: 'messageDelete',
	async execute(message) {
		if (message.author.bot) return;

		if (message.partial) {
			try {
				await message.fetch();
			} catch (error) {
				console.error('Algo salió mal al buscar el mensaje:', error);
				return;
			}
		}

		const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
		if (!logChannel) return;

		const deleteEmbed = new EmbedBuilder()
			.setColor('#FF0000')
			.setAuthor({ name: `🚮 Registro de mensaje eliminado ${message.guild.name}`, iconURL: message.author.displayAvatarURL() })
			.setDescription(`**El mensaje de ${message.author.tag} en ${message.channel} ha sido eliminado:**\n${message.content || '*Sin contenido*'}`)
			.setTimestamp()
			.setFooter({ text: `${message.author.username}`, iconURL: message.guild.iconURL() });

		if (message.attachments.size > 0) {
			message.attachments.forEach((attachment) => {
				deleteEmbed.setImage(attachment.url);
			});
		}

		await logChannel.send({ embeds: [deleteEmbed] });
	},
};
