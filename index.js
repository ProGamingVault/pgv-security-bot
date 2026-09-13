const { Client, GatewayIntentBits } = require('discord.js');
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
const CHANNEL_NAME_KEYWORD = 'pro gaming vault';

client.once('ready', () => {
    console.log(`PGV Automated Security Bot logged in as ${client.user.tag}!`);
});

// Localization Helper for Error / Guide Messages based on locale
function getLocalizedGuidance(locale = 'en') {
    if (locale.startsWith('id') || locale.startsWith('ms')) {
        return `❌ Verifikasi Gagal! Pastikan Anda subscribe channel resmi kami, nyalakan lonceng, dan kirim screenshot yang jelas.\n🔗 **Link Channel:** ${CHANNEL_URL}`;
    } else if (locale.startsWith('es')) {
        return `❌ ¡Verificación fallida! Asegúrate de suscribirte a nuestro canal oficial, activar la campana y enviar una captura clara.\n🔗 **Enlace del canal:** ${CHANNEL_URL}`;
    } else if (locale.startsWith('pt')) {
        return `❌ Falha na verificação! Certifique-se de se inscrever no nosso canal oficial, ativar o sininho e enviar uma captura de tela clara.\n🔗 **Link do canal:** ${CHANNEL_URL}`;
    } else {
        return `❌ Verification Failed! Please ensure you subscribe to our official channel, press the bell icon, and send a clear screenshot showing your subscription.\n🔗 **Channel Link:** ${CHANNEL_URL}`;
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

    // 2. Automated 24/7 OCR Screenshot Verification Gate
    if (message.channel.id === VERIFY_CHANNEL_ID) {
        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            
            const processingMsg = await message.reply('🔄 Scanning your screenshot via 24/7 AI Security... Please wait.');

            try {
                // Download and run OCR on the image
                const { data: { text } } = await Tesseract.recognize(attachment.url, 'eng', {
                    logger: m => {}
                });

                const lowerText = text.toLowerCase();
                
                // Strict validation: Must contain channel keyword and subscription indicator
                const hasChannel = lowerText.includes(CHANNEL_NAME_KEYWORD);
                const hasSubscribed = lowerText.includes('subscribe') || lowerText.includes('subscribed');

                if (hasChannel && hasSubscribed) {
                    const member = await message.guild.members.fetch(message.author.id);
                    await member.roles.add(VERIFIED_ROLE_ID);

                    await processingMsg.edit(`🎉 **Verification Successful!** Welcome to Pro Gaming Vault. You now have access to the script portal channels.\n🌐 Portal Access Unlocked!`);
                    
                    await member.send(`🎉 Your subscription screenshot for **Pro Gaming Vault** has been automatically verified! You can now access daily scripts through our portal.`).catch(() => {});
                } else {
                    const locale = message.member.guild.preferredLocale || 'en';
                    const errorText = getLocalizedGuidance(locale);
                    await processingMsg.edit(errorText);
                }

            } catch (err) {
                console.error('OCR Processing Error:', err);
                await processingMsg.edit(`❌ An error occurred while processing your image. Please ensure it's a clear image and try again.\n🔗 **Channel Link:** ${CHANNEL_URL}`);
            }
        }
    }
});

client.login(TOKEN);