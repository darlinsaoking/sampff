const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: 'exp',
    description: 'Muestra las estadísticas de experiencia del usuario.',
    async execute(message, args, pool) {
        const usuarioId = message.author.id;

        // Definir íconos para los trabajos (sin Minero y Ninguno)
        const workIcons = {
            'Conductor': ':oncoming_taxi:',
            'Camionero': ':truck:',
            'Mecanico': ':wrench:',
            'Cosechador': ':tractor:',
            'Basurero': ':recycle:',
            'Leñador': ':deciduous_tree:',
            'Agricultor': ':farmer:',
            'Policia': ':police_officer:',
            'Pizzero': ':pizza:',
            'Medico': ':ambulance:',
        };

        const trabajosLista = Object.keys(workIcons); // Lista de trabajos disponibles

        try {
            // Buscar el usuario en la base de datos
            const [results] = await pool.query('SELECT * FROM player WHERE id_discord = ?', [usuarioId]);
            if (results.length > 0) {
                const usuario = results[0];

                // Obtener la skin del usuario
                const skinImage = `https://assets.open.mp/assets/images/skins/${usuario.skin}.png`;

                // Obtener los trabajos activos del usuario
                const [workResults] = await pool.query(`
                    SELECT w.name, pw.set AS level, pw.level AS experience 
                    FROM pworks pw 
                    JOIN works w ON pw.id_work = w.id 
                    WHERE pw.id_player = ?
                `, [usuario.id]);

                // Crear un objeto para almacenar la experiencia y nivel por trabajo
                const experiencia = {};
                workResults.forEach(row => {
                    experiencia[row.name] = {
                        level: row.level || 0,
                        experience: row.experience || 0
                    };
                });

                // Crear la descripción de trabajos
                const trabajos = trabajosLista.map(trabajo => {
                    const { level = 0, experience = 0 } = experiencia[trabajo] || {};
                    return `**${workIcons[trabajo]} ${trabajo} Nivel:${level} EXP:${experience}**`;
                }).join('\n');

                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({
                        name: `🟢 Experiencia de ${usuario.name}`, // Título del autor
                        iconURL: skinImage // Usar la imagen de la skin como el icono del autor
                    })
                    .setDescription(`**:man_construction_worker: • EXPERIENCIA**\n${trabajos}`)
                    .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() })
                    .setThumbnail(skinImage) // Agregar la imagen de la skin
                    .setTimestamp();

                await message.channel.send({ embeds: [embed] });
            } else {
                await message.channel.send(`Error: no se encontró la cuenta de usuario.`);
            }
        } catch (err) {
            console.error('Error al obtener la información de la cuenta:', err);
            await message.channel.send('Hubo un error al intentar obtener la información de la cuenta. Por favor, intenta más tarde.');
        }

        // Eliminar el mensaje de comando solo si el embed se envía correctamente
        await message.delete().catch(console.error);
    },
};
