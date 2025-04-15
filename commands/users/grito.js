const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'g',
  description: 'Realiza un grito en el chat y lo convierte en un embed.',
  async execute(message, args) {
    if (args.length < 1) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setAuthor({ name: `❌ Error en la acción ${message.member.displayName}`, iconURL: message.author.displayAvatarURL() })
        .setDescription('Debes proporcionar un mensaje para gritar.')
        .setTimestamp()
        .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });

      await message.channel.send({ embeds: [errorEmbed] });
      await message.delete().catch(console.error);
      return;
    }

    const action = args.join(' ');

    if (action.length > 2000) { // Verificación de longitud de mensaje
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setAuthor({ name: `❌ Error en la acción ${message.member.displayName}`, iconURL: message.author.displayAvatarURL() })
        .setDescription('El mensaje es demasiado largo. Por favor, usa un mensaje más corto.')
        .setTimestamp()
        .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });

      await message.channel.send({ embeds: [errorEmbed] });
      await message.delete().catch(console.error);
      return;
    }

    const actionEmbed = new EmbedBuilder()
      .setColor('#808080')
      .setAuthor({ name: `🗣️ Grito • ${message.member.displayName}`, iconURL: message.author.displayAvatarURL() })
      .setDescription(`😱 • *<@${message.author.id}> [Grita]: ¡${action}!*`)
      .setThumbnail(message.author.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });

    await message.channel.send({ embeds: [actionEmbed] });
    await message.delete().catch(console.error);
  },
};
