const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { GetPlayerSkin } = require('../systems/user_get_skin');

module.exports = async (interaction, pool) => {
    if (!interaction.isButton()) return;

    const { customId } = interaction;

    if (customId === 'postularsee') {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.user.id;
        const applicationChannelId = '1361518072778723519';

        try {
            const [rankRows] = await pool.query('SELECT level FROM discord_users WHERE userId = ?', [userId]);

            if (rankRows.length === 0) {
                return interaction.followUp({ content: 'Debes ser nivel 5 o superior en el discord para postularte.', ephemeral: true });
            }

            const userRankLevel = rankRows[0].level;
            if (userRankLevel < 5) {
                return interaction.followUp({ content: 'Debes ser nivel 5 o superior en el discord para postularte.', ephemeral: true });
            }

            const [playerRows] = await pool.query('SELECT id, level, name, police_postulation_date FROM player WHERE id_discord = ?', [userId]);
            if (playerRows.length === 0) {
                return interaction.followUp({ content: 'No se encontró tu información en la base de datos.', ephemeral: true });
            }

            const playerDBID = playerRows[0].id;
            const playerName = playerRows[0].name;
            const playerLevel = playerRows[0].level;
            const lastApplicationDate = playerRows[0].police_postulation_date;

            const SkinImage = await GetPlayerSkin(userId);

            if (playerLevel < 5) {
                return interaction.followUp({ content: 'Debes ser nivel 5 o superior de manera IC para postularte.', ephemeral: true });
            }

            if (lastApplicationDate) {
                const lastDate = new Date(lastApplicationDate);
                const now = new Date();
                const diffTime = Math.abs(now - lastDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 30) {
                    const remainingDays = 30 - diffDays;
                    return interaction.followUp({ content: `Debes esperar ${remainingDays} días para volver a postularte.`, ephemeral: true });
                }
            }

            const embed = new EmbedBuilder()
                .setTitle('Nueva postulacion para Policía 👮‍♂️')
                .setDescription(`•**Usuario:** ${playerName}\n•**ID:** ${playerDBID}`)
                .setThumbnail(`${SkinImage}`)
                .setColor(0x2373ff)
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('police_postulation_accept')
                        .setLabel('Aceptar')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('police_postulation_deny')
                        .setLabel('Rechazar')
                        .setStyle(ButtonStyle.Danger),
                );

            const FormEmbed = new EmbedBuilder()
            .setTitle('Formulario 📄')
            .setDescription(`•**Usuario:** ${playerName}\n\nPuedes enviar un formulario a ${playerName}, el formulario se hace a través de google forms, tiene pruebas de rol basicas y algo sencillas relacionadas con el tema, para probar si el usuario esta capacitado, El formulario lo puede revisar unicamente <@1133213621221077113>.`)
            .setColor(0x2373ff)
            .setTimestamp();

            const FormRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('Police_Send_Form')
                        .setLabel('Enviar Formulario')
                        .setStyle(ButtonStyle.Primary)
                );

            const applicationChannel = await interaction.client.channels.fetch(applicationChannelId);
            await applicationChannel.send({ embeds: [embed], components: [row] });
            await applicationChannel.send({ embeds: [FormEmbed], components: [FormRow] });

            await interaction.followUp({ content: 'Tu postulación ha sido enviada.', ephemeral: true });

            const now = new Date();
            await pool.query('UPDATE player SET police_postulation_date = ? WHERE id_discord = ?', [now, userId]);
        } catch (error) {
            console.error('Error al obtener la información de la base de datos:', error);
            await interaction.followUp({ content: 'Hubo un error al obtener tu información. Inténtalo de nuevo más tarde.', ephemeral: true });
        }
    } else if (customId === 'police_postulation_accept' || customId === 'police_postulation_deny' || customId === 'Police_Send_Form') {
        try {
            const DisabledPostulationRows = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('Accept_Postulation')
                        .setLabel('Aceptar')
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('Deny_Postulation')
                            .setDisabled(true)
                        .setLabel('Rechazar')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true)
                );

            const embed = interaction.message.embeds[0];
            if (!embed || !embed.description) {
                return interaction.update({ content: 'No se pudo encontrar la descripción de la postulación.', components: [DisabledPostulationRows] });
            }

            const embedDescription = embed.description;
            const userNameMatch = embedDescription.match(/Usuario:\*\* (.+)/);
            if (!userNameMatch) {
                return interaction.update({ content: 'No se pudo encontrar el usuario en la descripción de la postulación.', components: [DisabledPostulationRows] });
            }

            const playerName = userNameMatch[1];

            const [playerRows] = await pool.query('SELECT id_discord FROM player WHERE name = ?', [playerName]);
            if (playerRows.length === 0) {
                return interaction.update({ content: 'No se encontró al usuario en la base de datos.', components: [DisabledPostulationRows] });
            }

            const userDiscordId = playerRows[0].id_discord;

            const user = await interaction.guild.members.fetch(userDiscordId).catch(() => null);

            if (!user) {
                return interaction.update({ content: 'No se pudo encontrar al usuario en el servidor.', components: [DisabledPostulationRows] });
            }

            const guild = interaction.guild;
            const dmEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({ name: `🗃️ Verificación ${guild.name}`, iconURL: guild.iconURL() })
                .setFooter({ text: `${guild.name}`, iconURL: guild.iconURL() });

            if (customId === 'police_postulation_accept') {
                await user.roles.add('1292628641209126922'); // ID del rol a otorgar
                await member.setNickname(`👮» ${playerName}`);

                dmEmbed.setTitle('Postulación Aceptada')
                    .setDescription(`Felicidades, has sido aceptado como Policía 👮‍♂️ en ${guild.name}.`);
                await user.send({ embeds: [dmEmbed] });

                await interaction.update({ embeds: [], content: `*🗃️•Se ha aceptado a ${playerName} para ingresar al cuerpo de policias.*`, components: [DisabledPostulationRows] });
            } else if (customId === 'police_postulation_deny') {
                dmEmbed.setTitle('Postulación Rechazada')
                    .setDescription(`Lamentablemente, has sido rechazado como Policía. **📝•Pórtate bien y ⌛vuelve a intentarlo más tarde.**`);
                await user.send({ embeds: [dmEmbed] });

                await interaction.update({ embeds: [], content: `*💥•Se ha rechazado a ${playerName} para ingresar al cuerpo de policias.*`, components: [DisabledPostulationRows] });
            } else if (customId === 'Police_Send_Form') {
                dmEmbed.setTitle('Formulario para postular')
                    .setDescription(`📝•Hola, el Comisario ha pedido que envies un **[formulario](https://forms.gle/7J4rnbxfLkzo2G9E8)** para entrar a la faccion.`);
                await user.send({ embeds: [dmEmbed]});

                const DisabledFormRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('Police_Send_Form')
                            .setLabel('Enviar Formulario')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true)
                    );
                await interaction.update({ embeds: [], content: `*📝•Se ha pedido a ${playerName} enviar un formulario.*`, components: [DisabledFormRow] });
            }

            await interaction.followUp({ embeds: [dmEmbed], ephemeral: true });
        } catch (error) {
            console.error('Error al procesar la interacción:', error);
            await interaction.followUp({ content: 'Hubo un error al procesar la interacción. Inténtalo de nuevo más tarde.', ephemeral: true });
        }
    }
};