const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Render/Railway ke environment variable ya fallback token ke liye
const TOKEN = process.env.DISCORD_TOKEN;

client.once('clientReady', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const restrictedContent = message.content.toLowerCase();
    if (restrictedContent.includes('bypass') || restrictedContent.includes('crack-script')) {
        try {
            await message.member.timeout(10 * 60 * 1000, 'Attempting to bypass security/ad-wall');
            await message.reply('⚠️ Warning: Unauthorized bypass attempts are prohibited in this server!');
        } catch (error) {
            console.error('Failed to moderate member:', error);
        }
    }
});

client.login(TOKEN);