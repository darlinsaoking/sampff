const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = (client) => {
    const suggestionsChannelId = '1361518086510874776'; // ID del canal de sugerencias
    const reviewRoleId = '931678264878051409'; // ID del rol que puede aceptar/rechazar

    client.on('messageCreate', async (message) => {
        if (
            message.channel.id !== suggestionsChannelId ||
            message.author.bot
        ) return;

        try {
            const [results] = await pool.query('SELECT * FROM player WHERE id_discord = ?', [message.author.id]);

            if (results.length === 0) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({
                        name: `❌ Error ${message.member.displayName}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setDescription('⚠️ No tienes tu cuenta vinculada. Usa el sistema de verificación primero.')
                    .setTimestamp();

                return await message.author.send({ embeds: [errorEmbed] });
            }

            const usuario = results[0];
            const { name, skin } = usuario;
            const skinImage = `https://assets.open.mp/assets/images/skins/${skin}.png`;
            const currentDate = new Date().toLocaleDateString();

            const suggestionEmbed = new EmbedBuilder()
                .setColor('#00BFFF')
                .setAuthor({
                    name: `💡 Sugerencia de ${name}`,
                    iconURL: skinImage
                })
                .setDescription(`**@${name}** sugiere:\n${message.content}`)
                .setThumbnail(skinImage)
                .addFields({ name: '📩 Estado', value: 'Pendiente de revisión por la administración.' })
                .setFooter({
                    text: `🕒 ${message.author.tag} | ${currentDate}`,
                    iconURL: message.guild.iconURL()
                })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('acceptSuggestion')
                        .setEmoji('✅')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('rejectSuggestion')
                        .setEmoji('⛔')
                        .setStyle(ButtonStyle.Danger)
                );

            const msg = await message.channel.send({ embeds: [suggestionEmbed], components: [row] });

            await msg.react('👍');
            await msg.react('🤔');
            await msg.react('👎');

            await message.delete();
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Error al procesar sugerencia')
                .setDescription('Ocurrió un error al obtener tu información. Intenta nuevamente más tarde.')
                .setTimestamp();

            await message.author.send({ embeds: [errorEmbed] });
        }
    });

    // Manejo de botones
    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isButton()) return;

        const { customId, member, message } = interaction;

        if (!['acceptSuggestion', 'rejectSuggestion'].includes(customId)) return;

        if (!member.roles.cache.has(reviewRoleId)) {
            return interaction.reply({
                content: '❌ No tienes permiso para realizar esta acción.',
                ephemeral: true
            });
        }

        const embed = message.embeds[0];
        const newEmbed = EmbedBuilder.from(embed);

        const estado = customId === 'acceptSuggestion'
            ? `☑️ Esta sugerencia fue **aceptada** por <@${member.id}>.`
            : `❌ Esta sugerencia fue **rechazada** por <@${member.id}>.`;

        newEmbed.spliceFields(0, 1, {
            name: '📩 Estado',
            value: estado
        });

        newEmbed.setColor(customId === 'acceptSuggestion' ? '#00FF00' : '#FF0000');

        await interaction.update({
            embeds: [newEmbed],
            components: []
        });
    });
};
