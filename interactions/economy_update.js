const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async (interaction, pool) => {
    if (!interaction.isButton()) return;

    const { customId } = interaction;

    if (customId === 'Economy_Update') {
        async function updateEmbeds() {
            const [results] = await pool.query(`
                SELECT 
                    SUM(cash) AS cash, 
                    SUM(bank_money) AS bank_money, 
                    SUM(coins) AS coins, 
                    COUNT(id) AS TotalPlayers 
                FROM player;
            `);

            const [properties] = await pool.query(`SELECT COUNT(id) AS total FROM properties;`);
            const [vehicles] = await pool.query(`SELECT COUNT(id) AS total FROM pvehicles;`);

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setAuthor({
                    name: `📈·Economia GamaMobile RolePlay Android📱|💻PC`,
                    iconURL: interaction.guild.iconURL()
                })
                .addFields(
                    { name: '💵•Dinero', value: `${results[0].cash.toLocaleString()}`, inline: true },
                    { name: ':bank:•Banco', value: `${results[0].bank_money.toLocaleString()}`, inline: true },
                    { name: ':moneybag:•Gamas', value: `${results[0].coins.toLocaleString()} :coin:`, inline: true },
                    { name: '🏠•Propiedades', value: `${properties[0].total}/2000 :house_with_garden:`, inline: true },
                    { name: '🚗•Vehículos', value: `${vehicles[0].total.toLocaleString()} :blue_car:`, inline: true },
                    { name: '👥•Ciudadanos', value: `${results[0].TotalPlayers.toLocaleString()}`, inline: true }
                )
                .setFooter({ text: `📊·Estado economia de GamaMobile`, iconURL: interaction.guild.iconURL() });
            return embed;
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('Economy_Update')
                    .setEmoji('📈')
                    .setLabel('ECONOMIA')
                    .setStyle(ButtonStyle.Secondary)
            );

        const embed = await updateEmbeds();

        await interaction.update({ content: '', embeds: [embed], components: [row] });
        await interaction.followUp({ content: '🔄• La tabla de 📊·ECONOMIA ha sido actualizada.', ephemeral: true });
    } else {
        async function updateEmbeds() {
            const [ResultCash] = await pool.query('SELECT id, name, level, cash FROM player ORDER BY cash DESC LIMIT 10');
            const [ResultCoins] = await pool.query('SELECT id, name, level, coins FROM player ORDER BY coins DESC LIMIT 10');

            const EmbedCash = new EmbedBuilder()
                .setColor('#0099ff')
                .setAuthor({ 
                    name: `💸·Top 10 millonarios GamaMobile RolePlay Android📱|💻PC`, 
                    iconURL: interaction.guild.iconURL() 
                })
                .setDescription(`**🕴Fortuna:** 💵DINERO || :hash:**ID:** 1\n${ResultCash.map((player, index) => 
                    `${index}️⃣ | ID:${player.id} | \`${player.name}\` 🎮 ${player.level} | 💸DINERO: ${player.cash.toLocaleString()}$`
                ).join('\n')}`)
                .setFooter({ text: `🤑•TOP millonarios de GamaMobile`, iconURL: interaction.guild.iconURL() });

            const EmbedCoins = new EmbedBuilder()
                .setColor('#FFA500')
                .setAuthor({ 
                    name: `💰·Top 10 millonarios GamaMobile RolePlay Android📱|💻PC`, 
                    iconURL: interaction.guild.iconURL() 
                })
                .setDescription(`**🕴Fortuna:** 🪙GAMAS || :hash:**ID:** 2\n${ResultCoins.map((player, index) => 
                    `${index}️⃣ | ID:${player.id} | \`${player.name}\` 🎮 ${player.level} | 💰GAMAS: ${player.coins.toLocaleString()}:coin:`
                ).join('\n')}`)
                .setFooter({ text: `🤑•TOP millonarios de GamaMobile`, iconURL: interaction.guild.iconURL() });

            return { EmbedCash, EmbedCoins };
        }

        const Cash_Row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('Update_Cash')
                    .setEmoji('💸')
                    .setLabel('MILLONARIOS')
                    .setStyle(ButtonStyle.Secondary)
            );

        const Coins_Row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('Update_Coins')
                    .setEmoji('💰')
                    .setLabel('MILLONARIOS')
                    .setStyle(ButtonStyle.Secondary)
            );

        if (customId === 'Update_Cash') {
            const { EmbedCash } = await updateEmbeds();
            await interaction.update({ embeds: [EmbedCash], components: [Cash_Row] });
            await interaction.followUp({ content: '🔄• La tabla de 💸·MILLONARIOS ha sido actualizada.', ephemeral: true });
        } else if (customId === 'Update_Coins') {
            const { EmbedCoins } = await updateEmbeds();
            await interaction.update({ embeds: [EmbedCoins], components: [Coins_Row] });
            await interaction.followUp({ content: '🔄• La tabla de 💰·MILLONARIOS ha sido actualizada.', ephemeral: true });
        }
    }
};
