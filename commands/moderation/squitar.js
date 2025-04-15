const { EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
require('dotenv').config();
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'squitar',
    description: 'Desvincula la cuenta de juego de un usuario de Discord',
    async execute(message) {
        const roleId = '931910985202143252'; // Reemplaza con el ID de tu rol específico

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

        // Verificar si se mencionó a un usuario
        const user = message.mentions.users.first();
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: `❌ Error de mención`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('Debes mencionar a un usuario para desvincular su cuenta.')
                .setTimestamp()
                .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() });
            await message.channel.send({ embeds: [embed] });
            await message.delete().catch(console.error);
            return;
        }

		const member = message.guild.members.cache.get(user.id);
		if (!member) {
			const embed = new EmbedBuilder()
			.setColor('#FF0000')
			.setAuthor({ name: `❌ Error ${message.member.displayName}`, iconURL: message.guild.iconURL() })
			.setDescription('El usuario no está en el servidor.')
			.setTimestamp()
			.setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });
			message.channel.send({ embeds: [embed] }).then(() => message.delete().catch(console.error));
			return;
		}        

        let connection;
        try {
            connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });

            // Buscar el usuario en la base de datos
            const [results] = await connection.query('SELECT * FROM player WHERE id_discord = ?', [user.id]);
            if (results.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({
                        name: `❌ Error de cuenta`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setDescription('Este usuario no tiene una cuenta vinculada.')
                    .setTimestamp()
                    .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() });
                await message.channel.send({ embeds: [embed] });
                await message.delete().catch(console.error);
                return;
            }

            // Desvincular la cuenta
            await connection.query('UPDATE player SET id_discord = NULL WHERE id_discord = ?', [user.id]);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({
                    name: `🟢 Desvinculación exitosa`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription(`La cuenta de juego vinculada a <@${user.id}> ha sido desvinculada.`)
                .setTimestamp()
                .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() });
            await message.channel.send({ embeds: [embed] });
            await message.delete().catch(console.error);

            await member.setNickname(``);
            await member.roles.remove('1288636152126898273');
        } catch (error) {
            console.error('Error al desvincular la cuenta:', error);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: `❌ Error de desvinculación`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('Hubo un error al intentar desvincular la cuenta. Por favor, intenta más tarde.')
                .setTimestamp()
                .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() });
            await message.channel.send({ embeds: [embed] });
            await message.delete().catch(console.error);
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    }
};