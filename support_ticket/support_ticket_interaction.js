const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const cooldowns = new Map(); // Mapa para rastrear los tiempos de cooldown
const closingChannels = new Set(); // Mapa para rastrear los canales en proceso de cierre

const categoryMap = {
  'dudas': '1361518001773346957', //categoria dudas
  'reportar_usuario': '1361518002444439614', //categoria reportes user
  'reportar_staff': '1361518003086299167',//categorias reporte staff
  'reportar_bug': '1361518003723829389',//categorias bugs
  'creador_contenido': '1361518004457963552',//categoria creador contenido
  'apelar_ban': '1361518006727086231',//categoria apelar ban
  'soporte_general': '1361518008232579203', //categoria soporte general
  'compras_gamas': '1361518009109319831',//categoria compras bitcoin
  'solicitar_migra': '1361518009818152990'
};

const emojiMap = {
  'dudas': 'ℹ️',
  'reportar_usuario': '👥',
  'reportar_staff': '👔',
  'reportar_bug': '🔩',
  'creador_contenido': '🎮',
  'apelar_ban': '📛',
  'soporte_general': '🆘',
  'compras_gamas': '💰',
  'solicitar_migra': '⚖️'
};

const roleVisibilityMap = {
  'dudas': ['1170438320711540816', '1170438320711540816', '1361515507521683466', '1361515504367566919'], // Fundador, Administrador, Moderador Global, Moderador, Ayudante
  'reportar_usuario': ['1170438320711540816', '1170438320711540816', '1361515507521683466', '1330007698283958286'], // Fundador, Administrador, Moderador Global, Moderador, Ayudante
  'reportar_staff': ['1170438320711540816', '1170438320711540816'], // Fundador, Administrador
  'reportar_bug': ['1170438320711540816', '1170438320711540816', '1361515507521683466', '1330007698283958286'], // Fundador, Administrador, Moderador Global, Moderador, Ayudante
  'creador_contenido': ['1170438320711540816', '1170438320711540816', '1361515507521683466', '1330007698283958286'],
  'apelar_ban': ['1170438320711540816', '1170438320711540816', '1361515507521683466', '1330007698283958286'],
  'soporte_general': ['1170438320711540816', '1170438320711540816', '1361515507521683466', '1330007698283958286'],
  'compras_gamas': ['1170438320711540816', '1170438320711540816', '1361515507521683466', '1330007698283958286'], 
  'solicitar_migra': ['1170438320711540816', '1170438320711540816']
};

const nonEmbedMessageMap = {
  'dudas': '·Explica tu duda para que el equipo administrativo pueda ayudarte.',
  'reportar_usuario': '**#Formato reporte de Usuario**\n\nNombre del usuario:\n\n·Motivo del reporte:\n\n·Pruebas',
  'reportar_staff': '**#Formato reporte de Staff**\n\nNombre del usuario:\n\n·Motivo del reporte:\n\n·Pruebas',
  'reportar_bug': '**#Formato para reportar un bug**\n\n·Descripción del bug:\n\n·Pasos para reproducir el bug:\n\n·Pruebas.',
  'creador_contenido': '·Describe tu problema.',  
  'apelar_ban': '**#Formato para apelar ban**\n\n·Nivel:\n\n·Razón:\n\n·Por qué deberíamos desbanearte:\n\n·Pruebas:',
  'soporte_general': '·Describe tu problema.',
  'compras_gamas': '**#Formato para comprar Gamas**\n\n·Nombre IC:\n\n·Cantidad:\n\n· Métodos de Pago:',
  'solicitar_migra': '**·Espera a que el equipo administrativo te responda para realizar el proceso de migracion.**'
};

module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;

        const userId = interaction.user.id;
        const customId = interaction.customId;

        if (customId.startsWith(`cerrar_`)) {
            const channel = interaction.channel;
            const ticketOwnerId = customId.split('_')[1]; // Obtén el ID del dueño del ticket

            if (closingChannels.has(channel.id)) {
                await interaction.reply({ content: `El ticket <#${channel.id}> ya está en proceso de cierre.`, ephemeral: true });
                return;
            }

            const confirmEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ 
                    name: `🔒 Cierre de ticket ${interaction.guild.name}`, 
                    iconURL: interaction.guild.iconURL() 
                })
                .setDescription(`🔒 <@${interaction.user.id}>, ¿estás segur@ de cerrar este ticket?`)
                .setTimestamp()
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });

            const confirmRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`confirmar_cierre_${ticketOwnerId}`)
                    .setEmoji('✅')
                    .setLabel('Confirmar')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId('cancelar_cierre')
                    .setEmoji('❌')
                    .setLabel('Cancelar')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.reply({ embeds: [confirmEmbed], components: [confirmRow] });
        } else if (customId.startsWith('confirmar_cierre_')) {
            const channel = interaction.channel;
            const ticketOwnerId = customId.split('_')[2]; // Obtener el ID del dueño del ticket

            if (closingChannels.has(channel.id)) {
                await interaction.reply({ content: `El ticket <#${channel.id}> ya está en proceso de cierre.`, ephemeral: true });
                return;
            }

            closingChannels.add(channel.id);

            const closingEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ 
                    name: `🔒 Ticket cerrado ${interaction.guild.name}`, 
                    iconURL: interaction.guild.iconURL() 
                })
                .setDescription(`<@${interaction.user.id}>, si necesitas nuevamente ayuda puedes volver a abrir un ticket.`)
                .setTimestamp()
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });

            await interaction.reply({ embeds: [closingEmbed] });

            // Embed para el canal y mensaje directo al dueño del ticket
            const logEmbed = new EmbedBuilder()
                .setColor('#0000FF')
                .setAuthor({ name: `📝 Registro de cierre ${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
                .setDescription(`**${channel.name} ha sido 📝CERRADO por <@${interaction.user.id}>**`)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });

            const logChannel = client.channels.cache.get('1311648963857743902');
            if (logChannel) {
                await logChannel.send({ embeds: [logEmbed] });
            }

            try {
                const ticketOwner = await client.users.fetch(ticketOwnerId); // Obtener el usuario
                await ticketOwner.send({ embeds: [logEmbed] }); // Enviar el mensaje directo al dueño del ticket
            } catch (error) {
                console.error('Error sending DM to user:', error);
            }

            setTimeout(async () => {
                await channel.delete().catch(console.error);
                closingChannels.delete(channel.id);
            }, 10000);
        } else if (customId === 'cancelar_cierre') {
            await interaction.message.delete().catch(console.error);
        } else {
            if (!categoryMap[customId]) return;

            // Verificar si el usuario está en cooldown
            if (cooldowns.has(userId)) {
                const remainingTime = ((cooldowns.get(userId) - Date.now()) / 1000 / 60).toFixed(1);
                return interaction.reply({ content: `Debes esperar ${remainingTime} minutos antes de abrir otro ticket.`, ephemeral: true });
            }

            const categoryId = categoryMap[customId];
            const visibleRoles = roleVisibilityMap[customId];
            const nonEmbedMessage = nonEmbedMessageMap[customId];
            const perms = ['AddReactions', 'AttachFiles', 'EmbedLinks', 'ReadMessageHistory', 
                'UseExternalEmojis', 'UseExternalStickers', 'ViewChannel', 'SendMessages'];

            try {
                const channel = await interaction.guild.channels.create({
                    name: `${emojiMap[customId]}-ticket-${interaction.member.displayName}`,
                    type: ChannelType.GuildText,
                    parent: categoryId,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: ['ViewChannel'],
                        },
                        {
                            id: interaction.user.id,
                            allow: perms,
                        },
                        ...visibleRoles.map(roleId => ({
                            id: roleId,
                            allow: perms,
                        })),
                    ],
                });

                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setAuthor({ 
                        name: `🎫 Solicitud de soporte ${interaction.member.displayName}`, 
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setDescription(`🎫 <@${interaction.user.id}> has creado un ticket en <#${channel.id}>.`)
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setFooter({ text: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('🔗 Ir al Ticket')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`${channel.url}`)
                );

                await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

                // Establecer el cooldown de 25 minutos (25 * 60 * 1000 ms)
                cooldowns.set(userId, Date.now() + 25 * 60 * 1000);

                // Eliminar el cooldown después de 25 minutos
                setTimeout(() => cooldowns.delete(userId), 25 * 60 * 1000);

                // Mencionar a la persona que abrió el ticket y a los roles autorizados
                await channel.send(`||<@${interaction.user.id}> ${visibleRoles.map(roleId => `<@&${roleId}>`).join(', ')}||`);

                // Enviar un mensaje al canal creado con el mensaje inicial
                const welcomeEmbed = new EmbedBuilder()
                    .setColor(0x2373ff)
                    .setAuthor({ name: `📡·Soporte GamaMobile RolePlay Android📱|💻PC`, iconURL: interaction.guild.iconURL() })
                    .setDescription(`💬 **${interaction.member.displayName}**, rellena el formato con los datos solicitados y espera pacientemente a un miembro de la administración.\n\n⚠️ Por favor, no menciones a ningún miembro del equipo de soporte innecesariamente.\n\n📝 Rellena los formatos para una mejor atención.`)
                    .setTimestamp();

                const closeButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`cerrar_${userId}`) // Usa el ID del usuario que abrió el ticket
                            .setLabel('🔒 Cerrar')
                            .setStyle(ButtonStyle.Danger)
                    );

                await channel.send({ embeds: [welcomeEmbed], components: [closeButton] });

                // Enviar un mensaje adicional sin embed debajo del embed
                await channel.send(nonEmbedMessage);
            } catch (error) {
                console.error('Error handling interaction:', error);
                try {
                    await interaction.reply({ content: 'Hubo un error al manejar la interacción.', ephemeral: true });
                } catch (replyError) {
                    console.error('Error sending interaction reply:', replyError);
                }
            }
        }
    });
};