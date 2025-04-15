const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: 'est',
    description: 'Muestra las estadísticas del usuario.',
    async execute(message, args, pool) {
        const usuarioId = message.author.id;

        // Definir íconos para los trabajos
        const workIcons = {
            2: ':truck: Camionero',
            3: ':wrench: Mecanico',
            8: ':police_officer: Policía',
            10: ':hospital: Medico',
            9: ':pizza: Pizzero',
            1: ':oncoming_taxi: Conductor',
            7: ':farmer: Agricultor',
            4: ':tractor: Cosechador',
            5: ':wastebasket: Basurero',
            6: ':wood: Leñador'
        };

        try {
            // Buscar el usuario en la base de datos
            const [results] = await pool.query('SELECT * FROM player WHERE id_discord = ?', [usuarioId]);
            if (results.length > 0) {
                const usuario = results[0];

                // Obtener trabajos activos del usuario
                const [workResults] = await pool.query('SELECT w.id, w.name FROM pworks pw JOIN works w ON pw.id_work = w.id WHERE pw.id_player = ? AND pw.set = 1', [usuario.id]);

                // Depuración: Mostrar resultados de trabajos
                console.log('Work Results:', workResults);

                // Verificar si el usuario tiene trabajos
                let trabajos = '';
                if (workResults.length > 0) {
                    trabajos = workResults.map(row => workIcons[row.id] || row.name).join(', ');
                }

                // Obtener el nombre de la banda
                let banda = 'Ninguna';
                if (usuario.crew) {
                    const [crewResults] = await pool.query('SELECT name FROM crews WHERE id = ?', [usuario.crew]);
                    if (crewResults.length > 0) {
                        banda = crewResults[0].name.replace(/{[^}]+}/g, '').trim();
                    }
                }

                // Obtener la skin del usuario y crear la URL de la imagen
                const { skin } = usuario;
                const skinImage = `https://assets.open.mp/assets/images/skins/${skin}.png`;

                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({
                        name: `🔴 ${usuario.name}`,
                        iconURL: skinImage
                    })
                    .setDescription(`
                        **:necktie: • ID:${usuario.id}RP
:bust_in_silhouette: ${usuario.name}
${trabajos}
${Math.floor(usuario.hungry)} • :tropical_drink:|:fork_and_knife: • ${Math.floor(usuario.thirst)}
${usuario.health} • :heart_exclamation:|:coconut: • ${Math.floor(usuario.armour)}
💰${usuario.coins} DAPTYLS
💵DINERO ${usuario.cash}$
🏦BANCO ${usuario.bank_money}$**
                    `)
                    .setThumbnail(skinImage)
                    .setTimestamp()
                    .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });

                await message.channel.send({ embeds: [embed] });
            } else {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({
                        name: `🔴 Error ${message.member.displayName}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setDescription(`🗃️ ${message.member.displayName} puedes 🔗vincular tu cuenta desde <#> ${message.guild.name}.`)
                    .setTimestamp()
                    .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });

                await message.channel.send({ embeds: [errorEmbed] });
            }
        } catch (err) {
            console.error('Error al obtener la información de la cuenta:', err);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: `❌ Error ${message.member.displayName}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription('Hubo un error al intentar obtener la información de la cuenta. Por favor, intenta más tarde.')
                .setTimestamp()
                .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });

            await message.channel.send({ embeds: [errorEmbed] });
        }

        // Eliminar el mensaje de comando solo si el embed se envía correctamente
        await message.delete().catch(console.error);
    },
};