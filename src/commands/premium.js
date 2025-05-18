const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { db } = require('../database')
const { translator } = require('../functions/translator')

function getTierInfo(points) {
    if (points >= 200000) return `⭐️ **Immortal Tier**\n*You've reached the highest tier!*`;
    if (points >= 120000) return `🌟 **MYTHIC**\n*Next tier: ${200000 - points} more points needed*`;
    if (points >= 40000) return `🎭 **LEGENDARY**\n*Next tier: ${120000 - points} more points needed*`;
    if (points >= 20000) return `💎 **DIAMOND**\n*Next tier: ${40000 - points} more points needed*`;
    if (points >= 10000) return `🥈 **SILVER**\n*Next tier: ${20000 - points} more points needed*`;
    if (points >= 5000) return `🥉 **BRONZE**\n*Next tier: ${10000 - points} more points needed*`;
    return `🌱 **STARTER**\n*Next tier: ${5000 - points} points needed*`;
}

function getProgressBar(points) {
    const maxPoints = 40000;
    const progress = Math.min(points / maxPoints * 15, 15);
    const filledBlocks = "█".repeat(Math.floor(progress));
    const emptyBlocks = "□".repeat(15 - Math.floor(progress));
    const percentage = Math.min((points / maxPoints * 100), 100).toFixed(1);
    
    return `\`${filledBlocks}${emptyBlocks}\` ${percentage}%`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("premium")
        .setDescription("Shows information about premium"),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true })
        const data = db.collection('guild-data')
        const guildData = await data.findOne({guildId: interaction.guildId})



        const initialEmbed = new EmbedBuilder()
        .setTitle("✨ Bridgify Premium Hub")
        .setColor("#FFD700")
        .setDescription("Select an option below to learn more about Bridgify Premium features and rewards!")
        .addFields({
            name: "💫 Your Status",
            value: guildData?.premium?.expiryDate ? 
                `Premium Active • Expires ${new Date(guildData?.premium?.expiryDate).toLocaleDateString()}` :
                "No Active Premium • Upgrade Today!"
        })

        const aboutPremiumButton = new ButtonBuilder()
        .setCustomId("premium")
        .setLabel("About Premium")
        .setStyle(ButtonStyle.Primary)

        const premiumRewardsButton = new ButtonBuilder()
        .setCustomId("points")
        .setLabel("Premium Rewards")
        .setStyle(ButtonStyle.Primary)

        const row = new ActionRowBuilder()
        .addComponents(aboutPremiumButton, premiumRewardsButton)

        const message = await interaction.editReply({ embeds: [initialEmbed], components: [row] })
        const filiter = i => i.user.id === interaction.user.id
        const collector = message.createMessageComponentCollector({ time: 500000, filter: filiter })

        collector.on('collect', async (i) => {

            if (i.customId === "premium") {
                
                const description = await translator(
                    "Experience the full power of Bridgify with our Premium features. Supercharge your partnerships and take your server to the next level!", 
                    "English", 
                    guildData.language || "English"
                )
                
                const embed = new EmbedBuilder()
                    .setTitle("⭐ Bridgify Premium")
                    .setColor("#FFD700")
                    .setDescription(`${description}`)
                    .addFields(
                        {
                            name: "💎 Premium Features",
                            value: "```ml\n" +
                                "• Reduced Cooldowns for All Commands\n" +
                                "• Advanced /partner-category System\n" +
                                "• Powerful /mass Command\n" +
                                "• Complete Premium Settings Module\n" +
                                "• Auto Partner System\n" +
                                "• Auto Bump Technology\n" +
                                "• Auto Mass System\n" +
                                "• Automated Advertising\n" +
                                "• Priority Support Access\n" +
                                "• Exclusive Commands & Features" +
                                "```"
                        },
                        {
                            name: "💰 Pricing Plans (Premium)",
                            value: "```yml\n" +
                                "Monthly: $3 USD\n" +
                                "Bi-Yearly: $18 USD (Save 15%!)\n" +
                                "Yearly: $30 USD (Save 15%!)" +
                                "```"
                        },
                        {
                            name: "💰 Pricing Plans (Premium+)",
                            value: "```yml\n" +
                                "Monthly: $5 USD\n" +
                                "Bi-Yearly: $29 USD (Save 10%!)\n" +
                                "Yearly: $45 USD (Save 15%!)\n" +
                                "```\n" +
                                "**Premium+ allows you to have premium for multiple servers that you manage!**" 
                        },
                        {
                            name: "🎮 How to Get Started",
                            value: "Join our support server and create a ticket to get Premium activated for your server instantly!"
                        },
                        {
                            name: "📊 Your Premium Status",
                            value: guildData?.premium?.expiryDate ? 
                                `Active until: ${new Date(guildData?.premium?.expiryDate).toLocaleDateString()}` :
                                "No active subscription"
                        }
                    )
                    .setFooter({ text: "Upgrade today and transform your server's partnership experience!" })
                    .setTimestamp()
                
                await i.update({ embeds: [embed] })
            
            await interaction.editReply({ embeds: [embed] })
            }

            else if (i.customId === "points") {

                if (i.user.id !== i.guild.ownerId) {
                    return i.reply({ content: "You must be the owner of the server to use this command.", ephemeral: true })
                }
                const embed = new EmbedBuilder()
                    .setTitle("🌟 Bridgify Rewards Program")
                    .setColor("#FFD700")
                    .setDescription([
                        "**Welcome to the Bridgify Rewards Program!**",
                        "Earn points through active usage and premium subscriptions.",
                        "Convert your dedication into amazing rewards! 🎁\n",
                        `**Current Balance:** ${guildData?.premium?.points || 0} Points`
                    ].join('\n'))
                    .addFields(
                        {
                            name: "📈 Earning Points",
                            value: [
                                "```ml",
                                "'Daily Usage'",
                                "• +15 Points per Command Use (Free Commands Only)",
                                "",
                                "'Premium Subscriptions'",
                                "• Monthly: +1,000 Points",
                                "• Yearly: +14,000 Points (Bonus: +3,000!)",
                                "",
                                "'Premium Connect Subscriptions'",
                                "• Monthly: +3,000 Points",
                                "• Yearly: +20,000 Points (Bonus: +5,000!)",
                                "```"
                            ].join('\n')
                        },
                        {
                            name: "🎁 Reward Tiers",
                            value: [
                                "```ml",
                                "'Silver Tier - 5,000 Points'",
                                "• Exclusive Role in Support Server",
                                "",
                                "'Gold Tier - 10,000 Points'",
                                "• Priority Support Access",
                                "",
                                "'Diamond Tier - 20,000 Points'",
                                "• Free Month of Premium",
                                "• Exclusive Bot Commands",
                                "",
                                "'Legendary Tier - 80,000 Points'",
                                "• Free Year of Premium",
                                "• Exclusive Bot Commands",
                                "• Your very own POJ Channel within the Support Server for 1 week",
                                "",
                                "'Mythic Tier - 120,000 Points'",
                                "• Free Month of Premium Connect",
                                "• Premium User Spot on Website (Coming Soon)",
                                "• Free Ad Spot on /bump and /advertise embeds for up to 3 weeks",
                                "",
                                "'Immortal Tier - 200,000 Points'",
                                "• Free Year of Premium Connect",
                                "• Ultimate Premium User Spot on Website (Coming Soon)",
                                "• Free Ad Spot on Website for up to 1.5 Months (Coming Soon)",
                                "• VIP Server Status on Website (Coming Soon)",
                                "```"
                            ].join('\n')
                        },
                        {
                            name: "👑 Your Progress",
                            value: `${getTierInfo(guildData?.premium?.points || 0)}\n${getProgressBar(guildData?.premium?.points || 0)}`
                        }
                    )
                    .setFooter({ 
                        text: "Points accumulate automatically • Keep using Bridgify to earn more rewards!" 
                    })
                    .setTimestamp()
            
            const oneMonthButton = new ButtonBuilder()
            .setCustomId("one-month")
            .setLabel("Get 1 Month of Premium")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("📅")

            const oneYearButton = new ButtonBuilder()
            .setCustomId("one-year")
            .setLabel("Get 1 Year of Premium")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("📅")

            const row = new ActionRowBuilder()
            .addComponents(oneMonthButton, oneYearButton)
                

            let message 

            if (guildData?.premium?.points >= 20000 && guildData?.premium?.points >= 40000) {
                message = await interaction.editReply({ embeds: [embed], components: [row] })
            }

            else if (guildData?.premium?.points >= 20000) {
                const newRow = new ActionRowBuilder().addComponents(row.components[0])

                message = await interaction.editReply({ embeds: [embed], components: [newRow] })
            }
            else if (guildData?.premium?.points >= 80000) {
                const newRow2 = new ActionRowBuilder().addComponents(row.components[1])
                message = await interaction.editReply({ embeds: [embed], components: [newRow2] })
            }

            else {
                message = await interaction.editReply({ embeds: [embed] })
            }

            const filter = i => i.user.id === interaction.user.id;
            const collector = await message.createMessageComponentCollector({ filter, time: 500000 });

            collector.on('collect', async (j) => {
                if (j.customId === "one-month") {
                    await j.deferUpdate();

                    await db.collection("guild-data").updateOne({ guildId: interaction.guild.id }, { $inc: { "premium.points": -20000 } })
                    await db.collection("guild-data").updateOne({ guildId: interaction.guild.id }, { $set: { "premium.expiryDate": Date.now() + 1000 * 60 * 60 * 24 * 30 } })
                    await j.editReply({context: "Done!", components: []})
                }

                else if (j.customId === "one-year") {
                    await j.deferUpdate();

                    await db.collection("guild-data").updateOne({ guildId: interaction.guild.id }, { $inc: { "premium.points": -40000 } })
                    await db.collection("guild-data").updateOne({ guildId: interaction.guild.id }, { $set: { "premium.expiryDate": Date.now() + 1000 * 60 * 60 * 24 * 365 } })
                    await j.editReply({context: "Done!", components: []})

                }
            })
        }
    })
    }
}
