const { EmbedBuilder } = require('discord.js');
const sampQuery = require('samp-query');

module.exports = {
    name: 'sv',
    description: '🎮 Muestra el estado del servidor de SA:MP.',
    async execute(message, args) {
        const options = {
            host: '209.222.97.93', // Dirección IP del servidor
            port: 7777 // Puerto del servidor
        };

        const MAX_RETRIES = 5; // Número máximo de reintentos
        let retries = 0;

        // Función para realizar la consulta al servidor
        const queryServer = () => {
            sampQuery(options, async (error, response) => {
                if (error) {
                    console.error(error);

                    // Si se alcanza el número máximo de reintentos, enviar error
                    if (retries < MAX_RETRIES) {
                        retries++;
                        console.log(`Reintentando... (${retries}/${MAX_RETRIES})`);
                        return setTimeout(queryServer, 5000); // Reintentar después de 5 segundos
                    }

                    // Si se alcanzan los máximos reintentos, enviar mensaje de error
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setAuthor({ name: `❌ Error al conectar`, iconURL: message.author.displayAvatarURL() })
                        .setDescription('❌ No se pudo conectar al servidor de SA:MP.')
                        .setTimestamp()
                        .setFooter({ text: `${message.author.tag}`, iconURL: message.guild.iconURL() });

                    return message.channel.send({ embeds: [embed] });
                }

                // Si la consulta es exitosa, mostrar la información del servidor
                const embed = new EmbedBuilder()
                    .setColor(0x2373ff)
                    .setAuthor({ name: 'Daptyldroid', iconURL: message.guild.iconURL() })
                    .setDescription(`**•:signal_strength: SA-MP :calling: MOBILE | :computer: PC**\n🖥️ **• HostName**: :small_blue_diamond: Daptyldroid\n:busts_in_silhouette: **• Conectados**: ${response.online || 0}/${response.maxplayers || 0}\n:computer: **• Estado**: :white_check_mark: Activo\n:arrow_right: **• IP**: ${options.host}\n:file_cabinet: **• Puerto**: ${options.port}\n🖱️ **• Mode**: RolePlay\n:globe_with_meridians: **• Language**: :flag_es: Es | Español`)
                    .setTimestamp()
                    .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

                message.channel.send({ embeds: [embed] });
            });
        };

        // Iniciar la consulta al servidor
        queryServer();

        // Eliminar el mensaje de comando solo si el embed se envía correctamente
        await message.delete().catch(console.error);
    },
};