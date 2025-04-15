const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'support',
    description: 'Comando de soporte para enviar un mensaje de ayuda con botones interactivos',
    async execute(message) {
        const channelId = '1361518086037049425'; // ID del canal específico
        const roleId = '931910985202143252'; // ID del rol autorizado

        // Verificar si el comando se usa en el canal correcto
        if (message.channel.id !== channelId) {
            return;
        }


        const SkinImage = await GetPlayerSkin(message.author.id);
        if (!message.member.roles.cache.has(roleId)) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setAuthor({ 
                    name: `❌Acceso Denegado ${message.member.displayName}`, 
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription(':levitate:•! Permisos insuficientes')
                .setThumbnail(`${SkinImage}`)
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
            message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
            return;
        }

        // Crear el embed de soporte
        const soporteEmbed = new EmbedBuilder()
            .setColor(0x2373ff) // Cambiado el color a azul
            .setTitle('🔎·Selecciona una 🧾categoria:')
            .setAuthor({ 
                name: '📡·Soporte GamaMobile RolePlay Android📱|💻PC', 
                iconURL: message.guild.iconURL() // Usar el icono del servidor
            })

            .setDescription(
                `ℹ️ Dudas\n·:?:» Necesitas resolver tus dudas.\n\n` +
                `👥 Reportar usuario\n·:?:» Reporta a un usuario que no ha cumplido las reglas.\n\n` +
                `👔 Reportar staff\n·:?:» Reporta a un staff que no está haciendo lo correcto.\n\n` +
                `🔩 Reportar bug\n·:?:» Reporta errores.\n\n` +
                `🎮 Creador de Contenido\n·:?:» Reclama recompensas como creador de contenido.\n\n` +
                `📛 Apelar Ban\n·:?:» Baneado injustamente o segunda oportunidad?\n\n` +
                `🆘 Soporte General\n·:?:» Tienes un problema y necesitas ayuda.\n\n` +
                `⚖️ Solicitar migracion\n·:?:» Necesitas solicitar una migracion\n\n` +
                `💰 Comprar Gamas\n·:?:» Necesitas realizar una compra de Gamas\n\n` 
            )
            .setFooter({ text: '👨‍💻·Equipo de Soporte Administración GamaMobile'});

        // Crear los botones interactivos
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('dudas')
                .setEmoji('ℹ️')
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId('reportar_usuario')
                .setEmoji('👥')
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId('reportar_staff')
                .setEmoji('👔')
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId('reportar_bug')
                .setEmoji('🔩')
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId('creador_contenido')
                .setEmoji('🎮')
                .setStyle(ButtonStyle.Primary)
            );

        const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('apelar_ban')
            .setEmoji('📛')
            .setStyle(ButtonStyle.Primary),
            
        new ButtonBuilder()
            .setCustomId('soporte_general')
            .setEmoji('🆘')
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId('solicitar_migra')
            .setEmoji('⚖️')
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId('compras_gamas')
            .setEmoji('💰')
            .setStyle(ButtonStyle.Primary)
        );

        // Enviar el embed con los botones
        await message.channel.send({ embeds: [soporteEmbed], components: [row, row2] });

        // Eliminar el comando original
        await message.delete().catch(console.error);
    },
};