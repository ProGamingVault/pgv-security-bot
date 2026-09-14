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

    // Auto-send Guidance Message in Verify Channel
    try {
        const verifyChannel = await client.channels.fetch(VERIFY_CHANNEL_ID);
        if (verifyChannel) {
            const guideEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🛡️ Pro Gaming Vault - Official Verification Guide')
                .setDescription(`Welcome to the server! To unlock the script portal channels and access our daily releases, you must verify your subscription to our official channel.\n\n**📋 Steps to Verify:**\n1. Go to our official channel: [Click Here to Open Channel](${CHANNEL_URL})\n2. Click **Subscribe**.\n3. Click the **Bell Icon** and select **"All"**.\n4. Take a clear screenshot showing the open **All** notification bell dropdown menu.\n5. Drop your screenshot right here in this channel!`)
                .setImage('https://cdn.discordapp.com/attachments/1537214914844688425/1548839495166861434/WhatsApp_Image_2026-09-13_at_4.30.08_PM.jpeg?ex=6aa884af&is=6aa7332f&hm=02a68f65eb1466d374e64d93a02e7d58c7c66c501c21fdcfbb4c16e7bf043a70') 
                .setFooter({ text: 'Our 24/7 AI Security Bot will automatically verify and grant your role within seconds!' });

            const sentMsg = await verifyChannel.send({ embeds: [guideEmbed] });
            await sentMsg.pin().catch(() => {});
            console.log('Verification guidance message sent and pinned successfully!');
        }
    } catch (error) {
        console.error('Failed to send auto-guidance message:', error);
    }
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

    // 2. Automated 24/7 OCR Screenshot Verification Gate (Optimized for mobile blur background)
    if (message.channel.id === VERIFY_CHANNEL_ID) {
        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            
            const processingMsg = await message.reply('🔄 Scanning your screenshot via 24/7 AI Security (Checking Subscribed & Bell All)... Please wait.');

            try {
                // Download and run OCR on the image
                const { data: { text } } = await Tesseract.recognize(attachment.url, 'eng', {
                    logger: m => {}
                });

                const lowerText = text.toLowerCase();
                
                // Flexible validation to handle mobile blurred background:
                // Checks only for 'subscribed' and 'all' keywords
                const hasSubscribed = lowerText.includes('subscribed');
                const hasBellAll = lowerText.includes('all');

                if (hasSubscribed && hasBellAll) {
                    const member = await message.guild.members.fetch(message.author.id);
                    await member.roles.add(VERIFIED_ROLE_ID);

                    await processingMsg.edit(`🎉 **Verification Successful!** Welcome to Pro Gaming Vault. Thank you for subscribing and setting notifications to All. Your portal access is now unlocked!\n\n🚀 Head over to the **#roblox-scripts** channel to get your daily working scripts: ${ROBLOX_SCRIPTS_INVITE}`);
                    
                    await member.send(`🎉 Your subscription and notification settings for **Pro Gaming Vault** have been automatically verified! You can now access daily scripts here: ${ROBLOX_SCRIPTS_INVITE}`).catch(() => {});
                } else {
                    await processingMsg.edit(`❌ Verification Failed! Please make sure your screenshot clearly shows the **Subscribed** status and the open **All** notification bell dropdown menu.\n🔗 **Channel Link:** ${CHANNEL_URL}`);
                }

            } catch (err) {
                console.error('OCR Processing Error:', err);
                await processingMsg.edit(`❌ An error occurred while processing your image. Please ensure it's a clear screenshot of your notification settings and try again.\n🔗 **Channel Link:** ${CHANNEL_URL}`);
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
