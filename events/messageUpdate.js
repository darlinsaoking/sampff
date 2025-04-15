const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const LOG_CHANNEL_ID = '1327506560435355648'; // ID del canal donde se enviarán los mensajes editados

module.exports = {
name: 'messageUpdate',
async execute(oldMessage, newMessage) {
		if (oldMessage.author.bot) return;
		
		if (oldMessage.partial) {
			try {
				await oldMessage.fetch();
				await newMessage.fetch();
			} catch (error) {
				console.error('Algo salió mal al buscar el mensaje:', error);
				return;
			}
		}

		if (oldMessage.content === newMessage.content) return;

		const logChannel = oldMessage.guild.channels.cache.get(LOG_CHANNEL_ID);
		if (!logChannel) return;

		const updateEmbed = new EmbedBuilder()
			.setColor('#FFA500')
			.setAuthor({ name: `🗃️ Registro de mensaje editado ${oldMessage.guild.name}`, iconURL: oldMessage.author.displayAvatarURL() })
			.setDescription(`**Mensaje de ${oldMessage.author.tag} en ${oldMessage.channel} editado:**\n\n**Mensaje original:**\n${oldMessage.content || '*Sin contenido*'}\n\n**Mensaje nuevo:**\n${newMessage.content || '*Sin contenido*'}`)
			.setTimestamp()
			.setFooter({ text: `${oldMessage.author.username}`, iconURL: oldMessage.guild.iconURL() });

		await logChannel.send({ embeds: [updateEmbed] });
	},
};
