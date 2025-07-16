const fs = require('fs');
const path = require ('path');
require('dotenv').config();
const{ Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const pointsManager = require('./utils/pointsManager');

// Create new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.channel]
});

// Load commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file=>file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('HogBot is running');
    // Load point data for the idiots
    pointsManager.init(path.join(__dirname, 'data', 'points.json'));

    // Crank check!
    const crank = client.commands.get('crank');
    if (crank) crank.schedule(client);
});

client.on('messageCreate', async(msg) => {
    if (msg.author.bot || !msg.guild) return;

    // Hog Keyword Listener
    const hogCmd = client.commands.get('hog');
    if(hogCmd && hogCmd.check(msg)) return hogCmd.execute(msg);

    // Command Prefix
    const prefix = "!";
    if(!msg.content.startsWith(prefix)) return;
    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if(!command) return;
    try {
        await command.execute(msg, args);
    } catch (err) {
        console.error(err);
        msg.reply('Jack fucking sucks at programming kill him with rocks!');
    }
});

client.login(process.env.DISCORD_TOKEN);