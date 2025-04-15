const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActivityType } = require('discord.js');
const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

client.commands = new Collection();

// Definir restrictedChannels
const restrictedChannels = ['1330007698665771055', '1330007698665771055']; // Reemplaza con los IDs de los canales restringidos

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

let pool;

// Función para conectar a la base de datos
async function connectToDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
        console.log('Connected to MySQL');
        pool.on('error', (err) => {
            console.error('MySQL pool error:', err);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                connectToDatabase();
            } else {
                throw err;
            }
        });
    } catch (err) {
        console.error('Error connecting to MySQL:', err);
        setTimeout(connectToDatabase, 2000);
    }
}

// Cargar comandos
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
    const commandPath = `./commands/${folder}`;
    const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`${commandPath}/${file}`);
        client.commands.set(command.name, command);
    }
}

// Cargar eventos
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, pool));
    } else {
        client.on(event.name, (...args) => event.execute(...args, pool));
    }
}

// Cargar sistemas
require('./support_ticket/support_ticket_interaction')(client, pool);
require('./systems/suggestions')(client, pool);
require('./systems/rank')(client, pool);
require('./systems/discord_boost')(client, pool);
require('./systems/twitter')(client,pool);
require('./systems/process_tasks')(client);
const { GetPlayerSkin } = require('./systems/user_get_skin');

client.once('ready', async () => {
    await connectToDatabase();
    console.log(`${client.user.tag}`);

    client.user.setActivity('💻 DaptylDroid Roleplay', { type: ActivityType.Playing });
    client.user.setStatus('idle');
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (message.channel.type === 'DM') return;
    if (restrictedChannels.includes(message.channel.id)) return;
    if (!message.content.startsWith('!')) return;

    const args = message.content.slice(1).split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);

    if (!command) {
        const SkinImage = await GetPlayerSkin(message.author.id);
        const errorEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setAuthor({ 
                name: `⛔ Error comando ${message.member.displayName}`, 
                iconURL: message.author.displayAvatarURL()
            })
            .setDescription(`⌨️• El comando **!${commandName}** no existe.\nℹ️• Usa **!cmds** para ver los comandos disponibles.`)
            .setThumbnail(`${SkinImage}`)
            .setFooter({ text: `${message.author.username}`, iconURL: message.guild.iconURL() })
            .setTimestamp();

        await message.channel.send({ embeds: [errorEmbed] });
        await message.delete().catch(console.error);
        return;
    }

    try {
        await command.execute(message, args, pool);
    } catch (error) {
        console.error(error);
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setDescription('Hubo un error al ejecutar ese comando.');
        await message.channel.send({ embeds: [embed] });
        await message.delete().catch(console.error);
    }
});

const account_verify = require('./interactions/account_verify');
client.on('interactionCreate', async interaction => {
    await account_verify(interaction, pool);
});

const staff_postulation = require('./interactions/staff_postulation');
client.on('interactionCreate', async interaction => {
    await staff_postulation(interaction, pool);
});

const police_postulation = require('./interactions/police_postulation');
client.on('interactionCreate', async interaction => {
    await police_postulation(interaction, pool); 
});

const youtube_postulation = require('./interactions/youtube_postulation');
client.on('interactionCreate', async interaction => {  
    await youtube_postulation(interaction, pool);
});

const ip_button = require('./interactions/ip_button');
client.on('interactionCreate', async interaction => {  
    await ip_button(interaction);
});

const Economy_Update = require('./interactions/economy_update');
client.on('interactionCreate', async interaction => {  
    await Economy_Update(interaction, pool);
});

const welcome = require('./interactions/welcome');
client.on('guildMemberAdd', async member => {
    await welcome.execute(member);
});

client.login(process.env.DISCORD_TOKEN);
