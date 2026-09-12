const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const TOKEN = process.env.DISCORD_TOKEN;

// Apne channels aur roles ki IDs yahan replace kar dein (apni server ki IDs daalni hain)
const VERIFY_CHANNEL_ID = '1548470100263436328'; // Jahan user screenshot bhejega (#verify-here)
const LOG_CHANNEL_ID = '1548472408044867634';       // Jahan admin/mod approve karega (#mod-verify-logs)
const VERIFIED_ROLE_ID = '1548468211807162488';   // Jo role dena hai

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // 1. Security Moderation (Keywords check)
    const restrictedContent = message.content.toLowerCase();
    if (restrictedContent.includes('bypass') || restrictedContent.includes('crack-script')) {
        try {
            await message.member.timeout(10 * 60 * 1000, 'Attempting to bypass security/ad-wall');
            await message.reply('⚠️ Warning: Unauthorized bypass attempts are prohibited in this server!');
        } catch (error) {
            console.error('Failed to moderate member:', error);
        }
    }

    // 2. Screenshot Verification Gate
    if (message.channel.id === VERIFY_CHANNEL_ID) {
        // Check if user attached an image
        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            
            const logChannel = await message.guild.channels.fetch(LOG_CHANNEL_ID);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('New Subscription Verification')
                .setDescription(`User: ${message.author} (${message.author.tag}) has submitted a screenshot for verification.`)
                .setImage(attachment.url)
                .setColor(0x00FF00)
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`approve_${message.author.id}`)
                    .setLabel('Approve & Verify')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`reject_${message.author.id}`)
                    .setLabel('Reject')
                    .setStyle(ButtonStyle.Danger)
            );

            await logChannel.send({ embeds: [embed], components: [row] });
            await message.reply('✅ Your verification screenshot has been submitted! Please wait for a moderator to approve it.');
        }
    }
});

// Button Interaction Handler (Approval / Rejection)
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const [action, userId] = interaction.customId.split('_');
    const guild = interaction.guild;
    const member = await guild.members.fetch(userId).catch(() => null);

    if (!member) {
        return interaction.reply({ content: '❌ User not found in the server!', ephemeral: true });
    }

    if (action === 'approve') {
        try {
            await member.roles.add(VERIFIED_ROLE_ID);
            await interaction.update({ content: `✅ Successfully verified ${member.user.tag} by ${interaction.user.tag}`, components: [] });
            
            // Optionally send a DM to the user
            await member.send('🎉 Your YouTube subscription screenshot has been approved! You now have access to the script portal channels.').catch(() => {});
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: '❌ Failed to assign role. Check bot permissions!', ephemeral: true });
        }
    } else if (action === 'reject') {
        await interaction.update({ content: `❌ Verification rejected for ${member.user.tag} by ${interaction.user.tag}`, components: [] });
        await member.send('❌ Your subscription screenshot was rejected. Please make sure you fully subscribed and send a clear screenshot.').catch(() => {});
    }
});

client.login(TOKEN);