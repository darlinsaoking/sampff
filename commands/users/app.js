const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'app',
    description: 'Envía embed con logo.',
    async execute(message, args) {

        const embed = new EmbedBuilder()
            .setColor(0x2373ff) // Puedes cambiar el color del embed
            .setAuthor({ 
                name: `🖼️LOGO Daptyldroid ${message.author.tag}`, 
                iconURL: message.author.displayAvatarURL()
            })
            .setDescription(':levitate:•Mejor app para jugar GamaMobile')
            .setThumbnail(message.guild.iconURL())
            .setImage('https://play-lh.googleusercontent.com/S9iHZNrsP1od6ggCIGjQHV5Ex2bO20_jcDP-mfo6NtYB2MzAA3ANdQh8OQzp1tUGgfQ=w240-h480-rw')
            .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() })
            .setTimestamp();

        await message.channel.send({ embeds: [embed]});
        await message.delete().catch(console.error);
    },
};