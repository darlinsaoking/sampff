const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'skin',
    execute(message, args) {
        const VALID_SKINS = Array.from({ length: 312 }, (_, i) => i);
        const BASE_URL = 'https://assets.open.mp/assets/images/skins';

        if (args.length === 0) {
            return message.channel.send('Por favor, proporciona un ID de skin.');
        }

        const skinId = parseInt(args[0]);

        if (isNaN(skinId) || !VALID_SKINS.includes(skinId)) {
            return message.channel.send('Por favor, proporciona un ID de skin válido (0-311).');
        }

        const skinImageUrl = `${BASE_URL}/${skinId}.png`;

        const embed = new EmbedBuilder()
            .setTitle(`Esta es la Skin ${skinId}`)
            .setImage(skinImageUrl)
            .setColor('#0099ff')
            .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        message.channel.send({ embeds: [embed] });
    }
};
