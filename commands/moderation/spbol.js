const { EmbedBuilder } = require('discord.js');
require('dotenv').config();
const { GetPlayerSkin } = require('../../systems/user_get_skin');

module.exports = {
    name: 'spbol',
    description: 'Muestra los bolsillos de un usuario específico.',
    async execute(message, args, pool) {
        const itemData = [];
        const totalSlots = 10;
        const roleId = '931910985202143252';
        
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
        const userId = user ? user.id : args[0];

        if (!userId) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Modo de uso: !spbol @usuario.');
            await message.delete().catch(console.error);
            return message.channel.send({ embeds: [embed] });
        }

        try {
            const [userResults] = await pool.query('SELECT * FROM player WHERE id_discord = ?', [userId]);
            if (userResults.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('No se encontró el usuario en la base de datos.');
                await message.channel.send({ embeds: [embed] });
                return;
            }

            const user = userResults[0];
            const [inventoryResults] = await pool.query('SELECT * FROM pinventory WHERE id_player = ?', [user.id]);

            const slots = Array(totalSlots).fill('Nada');

            if (inventoryResults.length > 0) {
                inventoryResults.forEach(item => {
                    const { slot, type, name } = item;

                    const itemName = name || itemData.find(i => i.type === type)?.name || 'Undefined';

                    if (slot < totalSlots) {
                        slots[slot] = itemName;
                    }
                });

                const UserSkin = await GetPlayerSkin(user.id);

                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle(`🟢 Bolsillos de ${user.name}`)
                    .setDescription(`
**🧍 • BOLSILLOS**
:billed_cap: • ${slots[0]}
🎒 • ${slots[1]}
:hand_splayed: • ${slots[2]}
:jeans: • ${slots[3]}
:jeans: • ${slots[4]}
:jeans: • ${slots[5]}
:jeans: • ${slots[6]}
:jeans: • ${slots[7]}
:jeans: • ${slots[8]}
:jeans: • ${slots[9]}
                    `)
                    .setThumbnail(UserSkin)
                    .setTimestamp()
                    .setFooter({
                        text: message.client.user.username,
                        iconURL: message.client.user.displayAvatarURL(),
                    });

                await message.channel.send({ embeds: [embed] });
            } else {
                await message.channel.send('el usuario no tiene un  inventario registrado.');
            }
        } catch (error) {
            console.error('Error al obtener los bolsillos:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: `❌ Error Bolsillos ${message.member.displayName}`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setDescription('Hubo un error al intentar obtener los bolsillos. Por favor, intenta más tarde.')
                .setTimestamp()
                .setFooter({
                    text: message.client.user.username,
                    iconURL: message.client.user.displayAvatarURL(),
                });

            await message.channel.send({ embeds: [errorEmbed] });
        }

        // Eliminar el mensaje de comando solo si el embed se envía correctamente
        await message.delete().catch(console.error);
    },
};