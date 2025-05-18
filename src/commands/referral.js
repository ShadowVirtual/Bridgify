const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { db } = require("../database");
const { translator } = require('../functions/translator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("referral")
        .setDescription("Shows more information about referrals"),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        if (interaction.user.id !== interaction.guild.ownerId) {
            return interaction.editReply({ content: "You must be the owner of the server to use this command." });
        }
        const data = await db.collection('guild-data').findOne({ guildId: interaction.guild.id });
        const referralData = await db.collection('R-codes').findOne({ userId: interaction.user.id });

        const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle(await translator("Referral Program", data.language || "English", "English"))
            .setDescription(await translator(
                "Join our Referral Program and Earn Rewards!\n\n" +
                "**How It Works**\n" +
                "1. **Refer Your Friends:** Share your unique referral code with friends, community members, or anyone who could benefit from using our Discord bot.\n" +
                "2. **Earn Points:** When someone uses your referral code to purchase a premium subscription from Bridgify, you will earn 10 referral points for each successful referral.\n" +
                "3. **Redeem Points for Premium:** Accumulate referral points and redeem them for premium access without spending any money!\n\n" +
                "**Benefits of the Referral Program**\n" +
                "- **Free Premium Access:** For every friend who buys premium using your referral code, you earn 10 points. Collect enough points and you can enjoy premium features for free!\n" +
                "- **Help Your Community:** By sharing our bot, you’re helping others discover a powerful tool that makes partnerships easier and more efficient.\n" +
                "- **Exclusive Rewards:** As you earn more points, you can unlock special rewards and perks available only to our top referrers.\n\n" +
                "**How to Get Started**\n" +
                "1. **Find Your Referral code:** Press the button below!\n",
                data.language || "English", "English"
            ))

            .setFields(
                {name: "Your Referral Code", value: `**${referralData?.code || "N/A"}**`},
                {name: "Your Referral Uses:", value: `**${referralData?.uses || "N/A"}**`},
                {name: "Your Referral Points:", value: `**${referralData?.points || "N/A"}**`}
            )

        




        const button = new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel(await translator("Generate Referral Code", data.language || "English", "English"))
            .setCustomId("generate-referral-code");

        const button2 = new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel(await translator("Buy 1 Month Premium (100 points)", data.language || "English", "English"))
            .setCustomId("1month-premium");

        const button3 = new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel(await translator("Buy 1 Year Premium (4000 points)", data.language || "English", "English"))
            .setCustomId("1year-premium");

        const row = new ActionRowBuilder()
            .addComponents(button, button2, button3);
            

        const message = await interaction.editReply({ embeds: [embed], components: [row] });

        const filter = i => i.user.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({ filter, time: 150000 });

        collector.on('collect', async (i) => {
            try {
            if (i.customId == 'generate-referral-code') {
                const existingReferralData = await db.collection('R-codes').findOne({ userId: interaction.user.id });

                if (existingReferralData) {
                    await i.reply("You already have a referral code!")
                    return
                }

                else {
                    const randomLetterCode = Math.random().toString(36).slice(-8)
                    const code = randomLetterCode

                    await db.collection('R-codes').insertOne({ userId: interaction.user.id}, { code: code })
                    await db.collection('R-codes').updateOne({ userId: interaction.user.id }, { $set: { code: code, guildId: interaction.guildId } }, { upsert: true })

                    await i.reply(`Your referral code is : ${code}`)
                    return
                }
            }

            if (i.customId == '1month-premium') {
                if (!referralData) {
                    await i.reply(`You don't have a referral code!`)
                    return
                }
                if (referralData.points >= 100) {
                    referralData.points -= 100

                    await db.collection('R-codes').updateOne({ userId: interaction.user.id }, { $set: { points: referralData.points } }, { upsert: true })

                    await db.collection('guild-data').updateOne({ guildId: interaction.guildId }, { $set: { "premium.expiryDate": Date.now() + (1000 * 60 * 60 * 24 * 30) } }, { upsert: true })

                    await i.reply(`You have bought 1 month premium for 100 points`)
                    return
                }
                else {
                    await i.reply(`You don't have enough points!`)
                    return
                }
            }
            if (i.customId == '1year-premium') {
                if (!referralData) {
                    await i.reply(`You don't have a referral code!`)
                    return
                }
                if (referralData.points >= 4000) {
                    referralData.points -= 4000

                    await db.collection('R-codes').updateOne({ userId: interaction.user.id }, { $set: { points: referralData.points } }, { upsert: true })

                    await db.collection('guild-data').updateOne({ guildId: interaction.guildId }, { $set: { "premium.expiryDate": Date.now() + (1000 * 60 * 60 * 24 * 365) } }, { upsert: true })
                    await i.reply(`You have bought 1 year premium for 4000 points`)
                    return
                }
                else {
                    await i.reply(`You don't have enough points!`)
                    return
                }
            }

        }
        
        catch (error) {
            console.error(`[ERROR]  >>>  Error occurred in referral.js:`, error);
        }})
    }
};