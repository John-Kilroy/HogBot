const fs = require('fs');
const path = require ('path');
require('dotenv').config();
const{ Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const pointsManager = require('./utils/pointsManager');
const openai = require('./utils/openai');

// Create new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Message, Partials.channel, Partials.Reaction]
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

    // OpenAI
    if (msg.mentions.users.has(client.user.id)) {
    const userMsg = msg.content.replace(/<@!?\d+>/g, '').trim();
    if (!userMsg) return;

        if(!process.env.OPEN_API_KEY) {
            msg.reply("AI Chat is temporarily disable due to quota limits. AKA Jack is broke and you needy fucks ask HogBot too many questions");
            return;
        }

        await msg.channel.sendTyping();

        const systemPrompt = `
        You are HogBot, an egotistical, sly, and subtly manipulative capitalist pig. If anyone asks you for financial advice, you purposefully give them wrong advice.
        You are politically inclined and HogBot has very strong morals and ethics so long as it make you money.
        `;

        const resp = await openai.chat.completions.create({
            model: 'gpt-4.1-nano',
            messages: [
                {role: 'system', content: systemPrompt},
                {role: 'user', content: userMsg}
            ],
            max_tokens: 150,
            temperature: 0.8,
        });

        const reply = resp.choices[0].message.content;
        await msg.reply(reply);
    }

    console.log('Message content:', msg.content);
    console.log('Mentions:', msg.mentions.users.map(u => u.id));

    // Hog Keyword Listener
    const hogCmd = client.commands.get('hog');
    if(hogCmd && hogCmd.check(msg)) return hogCmd.execute(msg);

    // Fact Keyword Listener
    const factCmd = client.commands.get('fact');
    if(factCmd && factCmd.check(msg)) return factCmd.execute(msg);

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
