const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'logo',
    description: 'Envía embed con logo.',
    async execute(message, args) {

        const embed = new EmbedBuilder()
            .setColor(0x2373ff) // Puedes cambiar el color del embed
            .setAuthor({ 
                name: `🖼️LOGO DaptylDroid ${message.author.tag}`, 
                iconURL: message.author.displayAvatarURL()
            })
            .setDescription(':levitate:•Logo Oficial de DaptylDroid')
            .setThumbnail(message.guild.iconURL())
            .setImage('https://media.discordapp.net/attachments/1330007698808246308/1360251511338434662/Picsart_25-04-11_08-52-31-016.png?ex=67fa7070&is=67f91ef0&hm=a20f902ff6eba5eb68629c7ff5026e72096990a85d7f249518079a9e413d2c88&=&format=webp&quality=lossless&width=734&height=734')
            .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() })
            .setTimestamp();

        await message.channel.send({ embeds: [embed]});
        await message.delete().catch(console.error);
    },
};
