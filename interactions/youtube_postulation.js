const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { GetPlayerSkin } = require('../systems/user_get_skin');

module.exports = async (interaction, pool) => {
    if (!interaction.isButton()) return;

    const { customId } = interaction;

    if (customId === 'postularse_youtuber') {
        const userId = interaction.user.id;
        const applicationChannelId = '1330007698808246307';

        await interaction.deferReply({ ephemeral: true });

        try {
            const [rankRows] = await pool.query('SELECT level FROM discord_users WHERE userId = ?', [userId]);
            if (rankRows.length === 0) {
                return interaction.followUp({ content: 'No tienes datos de nivel en el sistema de rank. Participa en el chat para ganar experiencia.', ephemeral: true });
            }

            const userRankLevel = rankRows[0].level;

            if (userRankLevel < 2) {
                return interaction.followUp({ content: 'Debes ser nivel 2 o superior en el Discord para postularte como YouTuber.', ephemeral: true });
            }

            const [playerRows] = await pool.query('SELECT id, level, name, youtube_postulation_date FROM player WHERE id_discord = ?', [userId]);
            if (playerRows.length === 0) {
                return interaction.followUp({ content: 'No se encontró tu información en la base de datos.', ephemeral: true });
            }

            const playerDBID = playerRows[0].id;
            const playerName = playerRows[0].name;
            const playerLevel = playerRows[0].level;
            const lastApplicationDate = playerRows[0].youtube_postulation_date;

            const SkinImage = await GetPlayerSkin(userId);

            if (playerLevel < 3) {
                return interaction.followUp({ content: 'Debes ser nivel 3 o superior ic para postularte como YouTuber.', ephemeral: true });
            }

            if (lastApplicationDate) {
                const lastDate = new Date(lastApplicationDate);
                const now = new Date();
                const diffTime = Math.abs(now - lastDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 10) {
                    const remainingDays = 10 - diffDays;
                    return interaction.followUp({ content: `Debes esperar ${remainingDays} días para volver a postularte como YouTuber.`, ephemeral: true });
                }
            }

            const embed = new EmbedBuilder()
                .setTitle('Nueva Postulación para YouTuber 🎥')
                .setDescription(`**Usuario:** ${playerName}\n**ID:** ${playerDBID}`)
                .setThumbnail(`${SkinImage}`)
                .setColor(0x2373ff)
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('Accept_Youtube_Postulation')
                        .setLabel('Aceptar')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('Deny_Youtube_Postulation')
                        .setLabel('Rechazar')
                        .setStyle(ButtonStyle.Danger),
                );

            const applicationChannel = await interaction.client.channels.fetch(applicationChannelId);
            await applicationChannel.send({ embeds: [embed], components: [row] });

            await interaction.followUp({ content: 'Tu postulación como YouTuber ha sido enviada.', ephemeral: true });

            const now = new Date();
            await pool.query('UPDATE player SET youtube_postulation_date = ? WHERE id_discord = ?', [now, userId]);

        } catch (error) {
            console.error('Error al obtener la información de la base de datos:', error);
            await interaction.followUp({ content: 'Hubo un error al obtener tu información. Inténtalo de nuevo más tarde.', ephemeral: true });
        }
    } else if (customId === 'Accept_Youtube_Postulation' || customId === 'Deny_Youtube_Postulation') {
        try {
            const DisabledRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('Accept_Youtube_Postulation')
                        .setLabel('Aceptar')
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('Deny_Youtube_Postulation')
                        .setLabel('Rechazar')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true)
                );

            const embed = interaction.message.embeds[0];
            if (!embed || !embed.description) {
                return interaction.update({ content: 'No se pudo encontrar la descripción de la postulación.', components: [DisabledRow] });
            }

            const embedDescription = embed.description;
            const userNameMatch = embedDescription.match(/Usuario:\*\* (.+)/);
            if (!userNameMatch) {
                return interaction.update({ content: 'No se pudo encontrar el usuario en la descripción de la postulación.', components: [DisabledRow] });
            }

            const playerName = userNameMatch[1];

            const [playerRows] = await pool.query('SELECT id_discord, id, name FROM player WHERE name = ?', [playerName]);
            if (playerRows.length === 0) {
                return interaction.update({ content: 'No se encontró al usuario en la base de datos.', components: [DisabledRow] });
            }

            const playerId = playerRows[0].id;
            const playerDbName = playerRows[0].name;
            const userDiscordId = playerRows[0].id_discord;

            const user = await interaction.guild.members.fetch(userDiscordId).catch(() => null);

            if (!user) {
                return interaction.update({ content: 'No se pudo encontrar al usuario en el servidor.', components: [DisabledRow] });
            }

            const guild = interaction.guild;
            const dmEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setAuthor({ name: `🎥 Verificación YouTuber ${guild.name}`, iconURL: guild.iconURL() })
                .setFooter({ text: `${guild.name}`, iconURL: guild.iconURL() });

            if (customId === 'Accept_Youtube_Postulation') {
                dmEmbed.setTitle('Postulación Aceptada')
                    .setDescription(`Felicidades, has sido aceptado como YouTuber 🎥 en ${guild.name}.\n\n**Escribe tu código de referido para completar el proceso, recuerda solo tiones 2 días para poner tu código**`);

                await user.send({ embeds: [dmEmbed] });

                const filter = response => response.author.id === userDiscordId;
                const collector = user.dmChannel.createMessageCollector({ filter, time: 172800000 });

                collector.on('collect', async message => {
                    const referralCode = message.content.trim();

                    if (!referralCode) {
                        return message.reply('Por favor, proporciona un código de referido válido.');
                    }

                    try {
                        await pool.query('INSERT INTO referred_codes (name, owner_id) VALUES (?, ?)', [referralCode, playerId]);
                        await pool.query('INSERT INTO discord_tasks (type) VALUES (1)');

                        message.reply(`Tu código de referido **${referralCode}** ha sido registrado correctamente.`);
                        collector.stop();
                    } catch (error) {
                        console.error('Error al insertar el código de referido:', error);
                        message.reply('Hubo un error al registrar tu código de referido. Inténtalo de nuevo más tarde.');
                    }
                });

                collector.on('end', (collected, reason) => {
                    if (reason === 'time') {
                        user.send('El tiempo para ingresar el código de referido ha expirado.');
                    }
                });

                const role = await interaction.guild.roles.fetch('1288636152139612295');
                await user.roles.add(role);
                await user.setNickname(`🎥» ${playerDbName}`);

                await interaction.update({ embeds: [], content: `*🎥•Se ha aceptado a ${playerName} para ingresar al equipo de youtubers.*`, components: [DisabledRow] });
            } else if (customId === 'Deny_Youtube_Postulation') {
                dmEmbed.setTitle('Postulación Rechazada')
                    .setDescription(`Lamentablemente, has sido rechazado como YouTuber. **📝•Pórtate bien y ⌛vuelve a intentarlo más tarde.**`);
                await user.send({ embeds: [dmEmbed] });

                await interaction.update({ embeds: [], content: `*💥•Se ha rechazado a ${playerName} para ingresar al equipo de youtubers.*`, components: [DisabledRow] });
            }

            await interaction.followUp({ embeds: [dmEmbed], ephemeral: true });
        } catch (error) {
            console.error('Error al procesar la interacción:', error);
            await interaction.followUp({ content: 'Hubo un error al procesar la interacción. Inténtalo de nuevo más tarde.', ephemeral: true });
        }
    }
};