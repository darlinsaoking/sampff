const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'me',
  description: 'Realiza una acción en el chat y la convierte en un embed.',
  async execute(message, args) {
    if (args.length < 1) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setAuthor({ name: `❌ Error en la acción ${message.member.displayName}`, iconURL: message.author.displayAvatarURL() })
        .setDescription('Debes proporcionar una acción a realizar.')
        .setTimestamp()
        .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });

      await message.channel.send({ embeds: [errorEmbed] });
      await message.delete().catch(console.error);
      return;
    }

    const action = args.join(' ');

    const actionEmbed = new EmbedBuilder()
      .setColor(0x2373ff)
      .setAuthor({ name: `🧍Rolea una acción ${message.member.displayName}`, iconURL: message.author.displayAvatarURL() })
      .setDescription(`🧍•[Acción] *<@${message.author.id}> ${action}`)
      .setThumbnail(message.author.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });

    await message.channel.send({ embeds: [actionEmbed] });
    await message.delete().catch(console.error);
  },
};
