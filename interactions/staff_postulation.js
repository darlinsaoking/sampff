const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { GetPlayerSkin } = require('../systems/user_get_skin');

module.exports = async (interaction, pool) => {
    if (!interaction.isButton()) return;

    const { customId } = interaction;

    if (customId === 'postularse') {
        await interaction.deferReply({ ephemeral: true });

        /* Disabled
        const embed = new EmbedBuilder()
        .setColor(0x2373ff)
        .setDescription('Hola, las postulaciones estan cerradas, igual gracias por intentar, avisaremos para que puedas postular.');
        return interaction.followUp({ embeds: [embed], ephemeral: true });
        Disabled */

        const userId = interaction.user.id;
        const StaffApplyChannel = '1361518063031160904';
        let playerName;

        try {
            // Obtener información del usuario en el sistema de rank
            const [rankRows] = await pool.query('SELECT level FROM discord_users WHERE userId = ?', [userId]);
            if (rankRows.length === 0) {
                return interaction.followUp({ content: 'No tienes datos de nivel en el sistema de rank. Participa en el chat para ganar experiencia.', ephemeral: true });
            }

            const userRankLevel = rankRows[0].level;

            // Verificar si el usuario es nivel 20 o superior en el sistema de rank
            if (userRankLevel < 5) {
                return interaction.followUp({ content: 'Debes ser nivel 5 o superior en el discord para postularte.', ephemeral: true });
            }

            // Obtener información del jugador
            const [playerRows] = await pool.query('SELECT id, level, name, staff_postulation_date FROM player WHERE id_discord = ?', [userId]);
            if (playerRows.length === 0) {
                return interaction.followUp({ content: 'No se encontró tu información en la base de datos.', ephemeral: true });
            }

            const playerLevel = playerRows[0].level;
            const PlayerDBID = playerRows[0].id;

            if (playerLevel < 3) {
                return interaction.followUp({ content: 'Debes ser nivel 3 o superior de manera IC para postularte.', ephemeral: true });
            }

            playerName = playerRows[0].name;
            const lastApplicationDate = playerRows[0].staff_postulation_date;

            const SkinImage = await GetPlayerSkin(userId);

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

            const PostulationEmbed = new EmbedBuilder()
                .setTitle('Nueva postulación para la Administracion 🔩')
                .setDescription(`•**Usuario:** ${playerName}\n•**id:** ${PlayerDBID}`)
                .setThumbnail(`${SkinImage}`)
                .setColor(0x2373ff)
                .setTimestamp();

            const PostulationRows = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('Accept_Postulation')
                        .setLabel('Aceptar')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('Deny_Postulation')
                        .setLabel('Rechazar')
                        .setStyle(ButtonStyle.Danger)
                );

            const FormEmbed = new EmbedBuilder()
                .setTitle('Formulario 📄')
                .setDescription(`•**Usuario:** ${playerName}\n\nPuedes enviar un formulario a ${playerName}, el formulario se hace a través de google forms, tiene pruebas de rol basicas y algo sencillas para probar si el usuario esta capacitado, El formulario lo puede revisar unicamente <@1207868745184452640>.`)
                .setColor(0x2373ff)
                .setTimestamp();

            const FormRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('Send_Form')
                        .setLabel('Enviar Formulario')
                        .setStyle(ButtonStyle.Primary)
                );

            const applicationChannel = await interaction.client.channels.fetch(StaffApplyChannel);
            await applicationChannel.send({ embeds: [PostulationEmbed], components: [PostulationRows] });
            await applicationChannel.send({ embeds: [FormEmbed], components: [FormRow] });

            await interaction.followUp({ content: 'Tu postulación ha sido enviada.', ephemeral: true });

            const now = new Date();
            await pool.query('UPDATE player SET staff_postulation_date = ? WHERE id_discord = ?', [now, userId]);
        } catch (error) {
            console.error('Error al obtener la información de la base de datos:', error);
            await interaction.followUp({ content: 'Hubo un error al obtener tu información. Inténtalo de nuevo más tarde.', ephemeral: true });
        }
    } else if (customId === 'Accept_Postulation' || customId === 'Deny_Postulation' || customId === 'Send_Form') {
        //await interaction.deferReply({ ephemeral: true });
        
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
                return interaction.update({ content: '💥•No se pudo encontrar la descripción de la postulación.', components: [DisabledPostulationRows] });
            }

            const embedDescription = embed.description;
            const userNameMatch = embedDescription.match(/Usuario:\*\* (.+)/);
            if (!userNameMatch) {
                return interaction.update({ content: '💥•No se pudo encontrar el usuario en la descripción de la postulación.', components: [DisabledPostulationRows] });
            }

            const playerName = userNameMatch[1];

            const [playerRows] = await pool.query('SELECT id_discord FROM player WHERE name = ?', [playerName]);
            if (playerRows.length === 0) {
                return interaction.update({ content: '💥•No se encontró al usuario en la base de datos.', components: [DisabledPostulationRows] });
            }

            const userDiscordId = playerRows[0].id_discord;

            const user = await interaction.guild.members.fetch(userDiscordId).catch(() => null);

            if (!user) {
                return interaction.update({ content: '💥•No se pudo encontrar al usuario en el servidor.', components: [DisabledPostulationRows] });
            }

            const guild = interaction.guild;
            const dmEmbed = new EmbedBuilder()
                .setColor(0x2373ff)
                .setAuthor({ name: `📋·Postulaciones GamaMobile RolePlay Android📱|💻PC`, iconURL: guild.iconURL() })
                .setFooter({ text: `${guild.name}`, iconURL: guild.iconURL() });

            if (customId === 'Accept_Postulation') {
                await pool.query('UPDATE player SET admin_level = 1 WHERE id_discord = ?', [userDiscordId]);
                await user.setNickname(`Helper ' ${playerName}`);

                await user.roles.add('1288636152139612298'); // ID del rol a otorgar
                dmEmbed.setTitle('Postulación Aceptada')
                    .setDescription(`Felicidades, has sido *aceptado* como parte de la 👔administración de GamaMobile.`);
                await user.send({ embeds: [dmEmbed] });

                await interaction.update({ embeds: [], content: `*💻•Se ha aceptado a ${playerName} para ingresar al equipo administrativo.*`, components: [DisabledPostulationRows] });
            } else if (customId === 'Deny_Postulation') {
                dmEmbed.setTitle('Postulación Rechazada')
                    .setDescription(`Lamentablemente, has sido *rechazado*. **📝•Pórtate bien y ⌛vuelve a intentarlo más tarde.**`);
                await user.send({ embeds: [dmEmbed] });

                await interaction.update({ embeds: [], content: `*💥•Se ha rechazado a ${playerName} para ingresar al equipo administrativo.*`, components: [DisabledPostulationRows] });
            } else if (customId === 'Send_Form') {
                dmEmbed.setTitle('Formulario para postular')
                    .setDescription(`📝•Hola, el encargado de staff ha pedido que envies un **[formulario](https://forms.gle/Pvgo3NJtyMXUXS7E6)** para poder aplicar en el **staff**.`);
                await user.send({ embeds: [dmEmbed]});

                const DisabledFormRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('Send_Form')
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