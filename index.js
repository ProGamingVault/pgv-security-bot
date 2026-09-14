const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const Tesseract = require('tesseract.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Configured IDs & Channel Link
const VERIFY_CHANNEL_ID = '1548470100263436328';
const LOG_CHANNEL_ID = '1548472408044867634';
const VERIFIED_ROLE_ID = '1548468211807162488';
const CHANNEL_URL = 'https://www.youtube.com/@ProGamingVault-e2k';

// Roblox Scripts Channel Invite Link
const ROBLOX_SCRIPTS_INVITE = 'https://discord.gg/g73GzpTJQj';

client.on('clientReady', async () => {
    console.log(`PGV Automated Security Bot logged in as ${client.user.tag}!`);

    // (Optional) Aap yahan apna manual pinned message bhi code ke zariye bhejwa sakte hain 
    // ya phir channel par khud manually pin kar sakte hain.
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // 1. Security Moderation (Keywords Check)
    const restrictedContent = message.content.toLowerCase();
    if (restrictedContent.includes('bypass') || restrictedContent.includes('crack-script')) {
        try {
            await message.member.timeout(10 * 60 * 1000, 'Attempting to bypass security/ad-wall');
            await message.reply('⚠️ Warning: Unauthorized bypass attempts are prohibited in this server!');
        } catch (error) {
            console.error('Failed to moderate member:', error);
        }
    }

    // 2. Automated 24/7 OCR Screenshot Verification (Handle + Subscribed)
    if (message.channel.id === VERIFY_CHANNEL_ID) {
        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            
            const processingMsg = await message.reply('🔄 Scanning your screenshot... Please wait.');

            try {
                // Download and run OCR on the image
                const { data: { text } } = await Tesseract.recognize(attachment.url, 'eng', {
                    logger: m => {}
                });

                const lowerText = text.toLowerCase();
                
                // Check for channel handle AND "subscribed" status
                const isValidChannel = lowerText.includes('progamingvault') || lowerText.includes('e2k') || (lowerText.includes('progaming') && lowerText.includes('vault'));
                const isSubscribed = lowerText.includes('subscribed') || lowerText.includes('subbed');

                if (isValidChannel && isSubscribed) {
                    const member = await message.guild.members.fetch(message.author.id);
                    await member.roles.add(VERIFIED_ROLE_ID);

                    await processingMsg.edit(`🎉 **Verification Successful!** Welcome to Pro Gaming Vault. Your portal access is now unlocked!\n\n🚀 Head over to the **#roblox-scripts** channel to get your daily working scripts: ${ROBLOX_SCRIPTS_INVITE}`);
                    
                    await member.send(`🎉 Your subscription to **Pro Gaming Vault** has been verified! Access your scripts here: ${ROBLOX_SCRIPTS_INVITE}`).catch(() => {});
                } else {
                    // Clean and precise error message focusing purely on channel subscription
                    await processingMsg.edit(`❌ **Verification Failed!** Please make sure you are subscribed to our official channel and your screenshot clearly shows the **Subscribed** button along with our handle (**@ProGamingVault-e2k**).\n\n🔗 **Channel Link:** ${CHANNEL_URL}`);
                }

            } catch (err) {
                console.error('OCR Processing Error:', err);
                await processingMsg.edit(`❌ An error occurred while processing your image. Please ensure it's a clear screenshot and try again.\n🔗 **Channel Link:** ${CHANNEL_URL}`);
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
