const { EmbedBuilder } = require('discord.js');
const crypto = require('crypto');
require('dotenv').config();

module.exports = async (interaction, pool) => {
    if (!interaction.isButton() || interaction.customId !== 'verify') return;

    const user = interaction.user;
    const guild = interaction.guild;
    const member = guild.members.cache.get(user.id);

    await interaction.deferReply({ ephemeral: true });

    if (!member) {
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setDescription('No pude encontrar tu información de miembro en el servidor. Por favor, intenta más tarde.')
            .setFooter({ text: `${guild.name}`, iconURL: guild.iconURL() });
        return interaction.followUp({ embeds: [embed], ephemeral: true });
    }

    const replyEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setAuthor({ name: `🗃️ ${guild.name}`, iconURL: guild.iconURL() })
        .setDescription(`<@${user.id}>, sigue las instrucciones enviadas por MD.`)
        .setFooter({ text: `${guild.name}`, iconURL: guild.iconURL() });
    await interaction.followUp({ embeds: [replyEmbed], ephemeral: true });

    try {
        const dmEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setAuthor({ name: `🗃️ Verificación ${guild.name}`, iconURL: guild.iconURL() })
            .setDescription(`¡Hola <@${user.id}>!, ingresa el Nombre_Apellido para localizar la cuenta.`)
            .setFooter({ text: `${guild.name}`, iconURL: guild.iconURL() });
        await user.send({ embeds: [dmEmbed] });

        const filter = m => m.author.id === user.id;
        const collector = user.dmChannel.createMessageCollector({ filter, max: 1, time: 60000 });

        collector.on('collect', async message => {
            const username = message.content;

            try {
                const [results] = await pool.query('SELECT * FROM player WHERE name = ?', [username]);
                if (results.length === 0) {
                    const noAccountEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setAuthor({ name: `❌ Error cuenta ${guild.name}`, iconURL: guild.iconURL() })
                        .setDescription('🗄️ Cuenta no encontrada, revisa el nombre brindado.')
                        .setTimestamp()
                        .setFooter({ text: `${guild.name}`, iconURL: guild.iconURL() });
                    return user.send({ embeds: [noAccountEmbed] });
                }
                
                const roleId = '1361515493176905900';
                const account = results[0];

                if (account.id_discord === user.id) {
                    if (member.roles.cache.has(roleId)) {
                        const alreadyLinkedEmbed = new EmbedBuilder()
                            .setColor('#ffb900')
                            .setAuthor({ name: `⚠️ Verificación ${guild.name}`, iconURL: guild.iconURL() })
                            .setDescription('🗄️ Tu cuenta ya esta vinculada a discord.')
                            .setTimestamp()
                            .setFooter({ text: `${guild.name}`, iconURL: guild.iconURL() });
                            
                        return user.send({ embeds: [alreadyLinkedEmbed] });
                    } else {
                        await member.roles.add(roleId);
                        if (member.id !== guild.ownerId) {
                            await member.setNickname(`👤» ${account.name}`);
                        }

                        const successEmbed = new EmbedBuilder()
                            .setColor(0x2373ff)
                            .setAuthor({ name: `✅ ${guild.name}`, iconURL: guild.iconURL() })
                            .setDescription(`🎉 <@${user.id}> Tu cuenta ha sido vinculada automaticamente correctamente.\n\n❓ ¿Necesitas soporte? Revisa <#1288636154085769390>`)
                            .setTimestamp()
                            .setFooter({ text: `${guild.name}`, iconURL: guild.iconURL() });

                        return user.send({ embeds: [successEmbed] });
                    }
                }

                if (account.id_discord) {
                    const alreadyLinkedEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setAuthor({ name: `❌ Error verificación ${guild.name}`, iconURL: guild.iconURL() })
                        .setDescription('🗄️ Esta cuenta ya está vinculada a un Discord.')
                        .setTimestamp()
                        .setFooter({ text: `${guild.name}`, iconURL: guild.iconURL() });
                    return user.send({ embeds: [alreadyLinkedEmbed] });
                }

                const [discordResults] = await pool.query('SELECT * FROM player WHERE id_discord = ?', [user.id]);
                if (discordResults.length > 0) {
                    const discordLinkedEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setAuthor({ name: `❌ Error verificación ${guild.name}`, iconURL: guild.iconURL() })
                        .setDescription('🗄️ Tu Discord ya está vinculado a una cuenta.')
                        .setTimestamp()
                        .setFooter({ text: `${guild.name}`, iconURL: guild.iconURL() });
                    return user.send({ embeds: [discordLinkedEmbed] });
                }

                const passwordEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setAuthor({ name: `📂 Cuenta encontrada ${guild.name}`, iconURL: guild.iconURL() })
                    .setDescription(`👤 <@${user.id}> hemos encontrado la cuenta, ahora ingresa la contraseña.`)
                    .setTimestamp()
                    .setFooter({ text: `${guild.name}`, iconURL: guild.iconURL() });
                await user.send({ embeds: [passwordEmbed] });

                const passwordCollector = user.dmChannel.createMessageCollector({ filter, max: 1, time: 60000 });

                passwordCollector.on('collect', async passwordMessage => {
                    const password = passwordMessage.content;

                    const hashedPassword = account.pass;
                    const salt = account.salt;

                    const hash = crypto.createHash('sha256');
                    hash.update(password + salt);
                    const hashPassword = hash.digest('hex');

                    if (hashPassword.toUpperCase() !== hashedPassword.toUpperCase()) {
                        const wrongPasswordEmbed = new EmbedBuilder()
                            .setColor('#FF0000')
                            .setAuthor({ name: `❌ Error verificación ${guild.name}`, iconURL: guild.iconURL() })
                            .setDescription('🔒 Contraseña incorrecta. Intenta de nuevo.')
                            .setTimestamp()
                            .setFooter({ text: `${guild.name}`, iconURL: guild.iconURL() });
                        return user.send({ embeds: [wrongPasswordEmbed] });
                    }

                    await pool.query('UPDATE player SET id_discord = ? WHERE name = ?', [user.id, username]);

                    if (member.id !== guild.ownerId) {
                        await member.setNickname(`👤» ${account.name}`);
                    }

                    await member.roles.add(roleId);

                    const successEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setAuthor({ name: `✅ ${guild.name}`, iconURL: guild.iconURL() })
                        .setDescription(`🎉 <@${user.id}> Tu cuenta ha sido vinculada correctamente.\n\n❓ ¿Necesitas soporte? Revisa <#1288636154085769390>`)
                        .setTimestamp()
                        .setFooter({ text: `${guild.name}`, iconURL: guild.iconURL() });
                    return user.send({ embeds: [successEmbed] });
                });

                passwordCollector.on('end', collected => {
                    if (collected.size === 0) {
                        const timeoutEmbed = new EmbedBuilder()
                            .setColor('#FF0000')
                            .setAuthor({ name: `❌ Error espera ${guild.name}`, iconURL: guild.iconURL() })
                            .setDescription('⏰ Tiempo de espera agotado, intenta nuevamente.')
                            .setTimestamp()
                            .setFooter({ text: `${guild.name}`, iconURL: guild.iconURL() });
                        user.send({ embeds: [timeoutEmbed] });
                    }
                });

            } catch (error) {
                console.error('Error al verificar el usuario:', error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({ name: `❌ Error verificación ${guild.name}`, iconURL: guild.iconURL() })
                    .setDescription('Hubo un error al verificar tu cuenta. Por favor, intenta más tarde.')
                    .setTimestamp()
                    .setFooter({ text: `${guild.name}`, iconURL: guild.iconURL() });
                user.send({ embeds: [errorEmbed] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({ name: `❌ Error espera ${guild.name}`, iconURL: guild.iconURL() })
                    .setDescription('⏰ Tiempo de espera agotado, intenta nuevamente.')
                    .setTimestamp()
                    .setFooter({ text: `${guild.name}`, iconURL: guild.iconURL() });
                user.send({ embeds: [timeoutEmbed] });
            }
        });

    } catch (error) {
        console.error('Error al enviar mensaje directo:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setAuthor({ name: `❌ Error verificación ${guild.name}`, iconURL: guild.iconURL() })
            .setDescription('Revisa tus ajustes de privacidad y mensajes directos.')
            .setTimestamp()
            .setFooter({ text: `${guild.name}`, iconURL: guild.iconURL() });
        interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    }
};