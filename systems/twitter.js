const { EmbedBuilder } = require('discord.js');
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = (client) => {
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;

        if (message.channel.id === '1361518081737752606') {
            const ventaMessage = message.content;

            if (ventaMessage.trim().length === 0) {
                return message.channel.send('Por favor, escribe el mensaje después del comando.');
            }

            try {
                const [results] = await pool.query('SELECT * FROM player WHERE id_discord = ?', [message.author.id]);

                if (results.length > 0) {
                    const usuario = results[0];
                    const { name, skin } = usuario;
                    const skinImage = `https://assets.open.mp/assets/images/skins/${skin}.png`;
                    const currentDate = new Date().toLocaleDateString();

                    const embed = new EmbedBuilder()
                        .setColor('#00BFFF')
                        .setAuthor({
                            name: `🐳Twitter • ${name}`,
                            iconURL: skinImage
                        })
                        .setDescription(`
                            **@•Twitter #** <@${message.author.id}> : ${ventaMessage}
                        `)
                        .setThumbnail(skinImage)
                        .setTimestamp()
                        .setFooter({
                            text: `🎃 ${message.author.tag} | Fecha: ${currentDate}`,
                            iconURL: message.guild.iconURL()
                        });

                    const embedMessage = await message.channel.send({ embeds: [embed] });

                    await embedMessage.react('💬');
                    await embedMessage.react('#️⃣');
                    await embedMessage.react('♥️');
                } else {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setAuthor({
                            name: `🔴 Error ${message.member.displayName}`,
                            iconURL: message.author.displayAvatarURL()
                        })
                        .setDescription(`🗃️ Tu cuenta no está vinculada. Vincula tu cuenta primero.`)
                        .setTimestamp()
                        .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });

                    await message.author.send({ embeds: [errorEmbed] });
                }

            } catch (err) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({
                        name: `❌ Error ${message.member.displayName}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setDescription('Hubo un error al intentar obtener la información. Por favor, intenta más tarde.')
                    .setTimestamp()
                    .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });

                await message.author.send({ embeds: [errorEmbed] });
            }

            await message.delete().catch(console.error);
        }
    });
};