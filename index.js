// OCR Validation Logic ko update karein:
const hasSubscribed = lowerText.includes('subscribed');
const hasBellAll = lowerText.includes('all');

// Sirf Subscribed aur All ka hona kafi hai (Blur background ka masla khatam!)
if (hasSubscribed && hasBellAll) {
    const member = await message.guild.members.fetch(message.author.id);
    await member.roles.add(VERIFIED_ROLE_ID);

    await processingMsg.edit(`🎉 **Verification Successful!** Welcome to Pro Gaming Vault. Your portal access is now unlocked!\n\n🚀 Head over to the **#roblox-scripts** channel: ${ROBLOX_SCRIPTS_INVITE}`);
    await member.send(`🎉 Verified successfully! Access your scripts here: ${ROBLOX_SCRIPTS_INVITE}`).catch(() => {});
} else {
    await processingMsg.edit(`❌ Verification Failed! Please make sure your screenshot clearly shows the **Subscribed** button and the open **All** notification menu.`);
}
