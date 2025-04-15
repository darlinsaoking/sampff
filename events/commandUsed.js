const { EmbedBuilder, Events } = require('discord.js');
require('dotenv').config();

const LOG_CHANNEL_ID = '1361518035717980592'; // ID del canal donde se enviarán los logs de comandos

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    // Ignorar mensajes enviados por el bot
    if (message.author.bot) return;

    // Verificar si el mensaje es un comando
    if (!message.content.startsWith('!')) return;

    const commandName = message.content.slice(1).split(/ +/).shift().toLowerCase();
    const userName = message.author.tag;
    const channelName = message.channel.name;

    const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) return;

    const logEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setAuthor({ name: `🗃️ Registro de comando ${message.guild.name}`, iconURL: message.author.displayAvatarURL() })
      .setDescription(`**Usuario:** ${userName}\n**Comando:** ${commandName}\n**Canal:** ${channelName}`)
      .setTimestamp()
      .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() });

    await logChannel.send({ embeds: [logEmbed] });
  },
};