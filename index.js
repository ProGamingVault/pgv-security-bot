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

const TOKEN = process.env.DISCORD_TOKEN;

// Configured IDs & Channel Link
const VERIFY_CHANNEL_ID = '1548470100263436328';
const LOG_CHANNEL_ID = '1548472408044867634';
const VERIFIED_ROLE_ID = '1548468211807162488';
const CHANNEL_URL = 'https://www.youtube.com/@ProGamingVault-e2k';

// Roblox Scripts Channel Invite Link
const ROBLOX_SCRIPTS_INVITE = 'https://discord.gg/g73GzpTJQj';

// Strict unique identifier for your channel (Handle only)
const CHANNEL_HANDLE = 'progamingvault-e2k';

client.once('ready', async () => {
    console.log(`PGV Automated Security Bot logged in as ${client.user.tag}!`);

    // Auto-send & Pin Guidance Message in Verify Channel
    try {
        const verifyChannel = await client.channels.fetch(VERIFY_CHANNEL_ID);
        if (verifyChannel) {
            // Check if guidance message already exists to avoid spamming on restart
            const messages = await verifyChannel.messages.fetch({ limit: 10 });
            const existingGuide = messages.find(m => m.author.id === client.user.id && m.embeds.length > 0);

            if (!existingGuide) {
                const guideEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('🛡️ Pro Gaming Vault - Official Verification Guide')
                    .setDescription(`Welcome to the server! To unlock the script portal channels and access our daily releases, you must verify your subscription to our official channel.\n\n**📋 Steps to Verify:**\n1. Go to our official channel: [Click Here to Open Channel](${CHANNEL_URL})\n2. Click **Subscribe**.\n3. Click the **Bell Icon** and select **"All"** (as shown in the example below).\n4. Take a clear screenshot showing your handle (\`@progamingvault-e2k\`), **Subscribed** status, and the **All** dropdown menu.\n5. Drop your screenshot right here in this channel!`)
                    .setImage('https://cdn.discordapp.com/attachments/1537214914844688425/1548839495166861434/WhatsApp_Image_2026-09-13_at_4.30.08_PM.jpeg?ex=6aa884af&is=6aa7332f&hm=02a68f65eb1466d374e64d93a02e7d58c7c66c501c21fdcfbb4c16e7bf043a70') 
                    .setFooter({ text: 'Our 24/7 AI Security Bot will automatically verify and grant your role within seconds!' });

                const sentMsg = await verifyChannel.send({ embeds: [guideEmbed] });
                await sentMsg.pin().catch(() => {});
                console.log('Verification guidance message sent and pinned successfully!');
            }
        }
    } catch (error) {
        console.error('Failed to send auto-guidance message:', error);
    }
});

// Localization Helper for Error / Guide Messages based on locale
function getLocalizedGuidance(locale = 'en') {
    if (locale.startsWith('id') || locale.startsWith('ms')) {
        return `❌ Verifikasi Gagal! Pastikan screenshot Anda menampilkan handle resmi kami, status Subscribed, dan menu lonceng diatur ke **All**.\n🔗 **Link Channel:** ${CHANNEL_URL}`;
    } else if (locale.startsWith('es')) {
        return `❌ ¡Verificación fallida! Asegúrate de que tu captura muestre nuestro enlace oficial, el estado Subscribed y la campanita en **All**.\n🔗 **Enlace del canal:** ${CHANNEL_URL}`;
    } else if (locale.startsWith('pt')) {
        return `❌ Falha na verificação! Certifique-se de que sua captura exiba nosso canal oficial, o status Subscribed e o sininho em **All**.\n🔗 **Link do canal:** ${CHANNEL_URL}`;
    } else {
        return `❌ Verification Failed! Please make sure your screenshot clearly shows our channel handle (\`@progamingvault-e2k\`), **Subscribed** status, and the notification bell dropdown set to **All**.\n🔗 **Channel Link:** ${CHANNEL_URL}`;
    }
}

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

    // 2. Automated 24/7 Strict OCR Screenshot Verification Gate
    if (message.channel.id === VERIFY_CHANNEL_ID) {
        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            
            const processingMsg = await message.reply('🔄 Scanning your screenshot via strict 24/7 AI Security (Checking Handle, Subscribed & Bell All)... Please wait.');

            try {
                // Download and run OCR on the image
                const { data: { text } } = await Tesseract.recognize(attachment.url, 'eng', {
                    logger: m => {}
                });

                const lowerText = text.toLowerCase();
                
                // ULTIMATE MASTER VALIDATION:
                // 1. Must contain the exact handle (@progamingvault-e2k)
                // 2. Must contain 'subscribed'
                // 3. Must contain 'all' (ensuring the notification bell dropdown menu is open and set to All)
                const hasCorrectHandle = lowerText.includes(CHANNEL_HANDLE);
                const hasSubscribed = lowerText.includes('subscribed');
                const hasBellAll = lowerText.includes('all');

                if (hasCorrectHandle && hasSubscribed && hasBellAll) {
                    const member = await message.guild.members.fetch(message.author.id);
                    await member.roles.add(VERIFIED_ROLE_ID);

                    await processingMsg.edit(`🎉 **Verification Successful!** Welcome to Pro Gaming Vault. Thank you for subscribing and setting notifications to All. Your portal access is now unlocked!\n\n🚀 Head over to the **#roblox-scripts** channel to get your daily working scripts: ${ROBLOX_SCRIPTS_INVITE}`);
                    
                    await member.send(`🎉 Your subscription and notification settings for **Pro Gaming Vault** have been automatically verified! You can now access daily scripts here: ${ROBLOX_SCRIPTS_INVITE}`).catch(() => {});
                } else {
                    const locale = message.member.guild.preferredLocale || 'en';
                    const errorText = getLocalizedGuidance(locale);
                    await processingMsg.edit(errorText);
                }

            } catch (err) {
                console.error('OCR Processing Error:', err);
                await processingMsg.edit(`❌ An error occurred while processing your image. Please ensure it's a clear image showing your subscription and bell icon menu, and try again.\n🔗 **Channel Link:** ${CHANNEL_URL}`);
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
