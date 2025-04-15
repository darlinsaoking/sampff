const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'cmds',
	description: 'Envía un mensaje privado con la lista de comandos disponibles',
	async execute(message) {
		const embed = new EmbedBuilder()
			.setColor(0x2373ff)
			.setAuthor({  name: `⌨️•Comandos DISCORD ${message.guild.name}`, iconURL: message.guild.iconURL()}
		)

		.setDescription(
			':keyboard:• ·—————:computer:COMANDOS USUARIO ——————\n' +
			'**----------------------------------------------------------------------------**\n' +
			'**|»**:shield:DISCORD\n' +
			'· :blue_circle: !logo !fondo !rank\n' +
			'**|»**:file_cabinet:SERVIDOR\n' +
			'·🖥️ !ip !vehiculo !skin\n' +
			'**|»**🗄️GAMAMOBILE\n' +
			'·🟢 !sv !cuenta !est !exp !inv !veh\n' +
			'**|»**:speaking_head:ROLEPLAY\n' +
			'·:bust_in_silhouette: !me !b !do !i !g !s !t\n' +
			"**-----------------------ℹ️COMANDOS-----------------------------**"
		)

		.setThumbnail(message.author.displayAvatarURL())
		.setTimestamp()
		.setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });

		try {
			await message.author.send({ embeds: [embed] });
		} catch (error) {
			console.error('Error al enviar el mensaje privado:', error);
			await message.channel.send('No he podido enviarte un mensaje privado. Por favor, asegúrate de que tienes los mensajes directos habilitados.');
		}

		await message.delete().catch(console.error);
	},
};
