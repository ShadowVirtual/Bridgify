const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { db } = require("../database");
const { translator } = require('../functions/translator');
const { errorCodes } = require("../functions/errorCodes");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("redeem")
        .setDescription("Redeem your premium code")
        .addStringOption(option => (
            option.setName("code")
            .setDescription("put a code in here so that the bot can put it in it's database!")
            .setRequired(true)
        ))

        .addStringOption(option => (
            option.setName("referral-code")
            .setDescription("put a referral code")
        )),

    async execute(interaction) {
        await interaction.deferReply({ephemeral: true})
        const language = await db.collection("guild-data").findOne({guildId: interaction.guild.id}).language
        const code = interaction.options.getString("code")
        const codeDB = await db.collection("codes").findOne({code: code})
        const referralCode = interaction.options.getString("referral-code")
        const referralCodeDB = await db.collection("R-codes").findOne({code: referralCode})


        if (!codeDB) {
            const embed = await errorCodes(9, interaction.guild.id)
            await interaction.editReply({ embeds: [embed] })
            return
        } 
        if (codeDB.redeemed == true) {
            const embed = await errorCodes(9, interaction.guild.id)
            await interaction.editReply({ embeds: [embed] })
            return
        } 
        if (Date.now() > codeDB.expiryDate) {
            const embed = await errorCodes(9, interaction.guild.id)
           await interaction.reply({ embeds: [embed] }) 
           return
        } 

        
        if (!referralCodeDB && referralCode) {
            const embed = await errorCodes(12, interaction.guild.id)
            await interaction.editReply({ embeds: [embed] })
            return
        }

        if (interaction.user.id == interaction.guild.ownerId || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const premiumDescription = await translator(
                `
            # ✨ Welcome to Bridgify Premium ✨
            Your gateway to advanced partnership management and server growth.
            
            \`\`\`ml
            '🎯 PREMIUM EXCLUSIVE COMMANDS'
            \`\`\`
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            
            ⚡ **/mass**  
            \`\`\`yml
            • Partner with 25+ servers simultaneously
            • Maximize server exposure effortlessly
            • Streamline partnership outreach
            \`\`\`
            
            📊 **/partner-category**
            \`\`\`yml
            • Target specific server categories
            • Fine-tune your partnership strategy
            • Connect with relevant communities
            \`\`\`
            
            ⚙️ **/settings premium**
            \`\`\`yml
            • Access advanced configuration
            • Customize growth strategies
            • Unlock premium-only modules
            \`\`\`
            
            \`\`\`ml
            '🌟 AUTOMATED FEATURES'
            \`\`\`
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            
            🔄 **Auto Bump**
            > Maintain top visibility with automated bumps
            > Set custom intervals
            > Never miss a bump opportunity
            
            🤝 **Auto Partner**
            > Intelligent partnership management
            > Custom response criteria
            > 24/7 automated handling
            
            🌐 **Auto Mass**
            > Continuous server outreach
            > Smart targeting system
            > Automated mass partnerships
            
            📢 **Auto Advertise**
            > Strategic server promotion
            > Targeted advertising
            > Maximum visibility
            
            ✅ **Auto Accept**
            > Smart partnership filtering
            > Instant request processing
            > Customizable acceptance criteria
            
            ⏰ **Bump Reminder System**
            \`\`\`yml
            • Personalized notification schedule
            • Custom reminder messages
            • Multi-channel support
            \`\`\`
            
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            *Unlock the full potential of your server with Bridgify Premium!*
                `,
                language || "English", "English"
            );
            
            const premiumMessage = new EmbedBuilder()
                .setColor("Blurple")
                .setTitle(await translator("Welcome New Premium Member!", language || "English", "English"))
                .setDescription(premiumDescription)
                .setTimestamp()
    
    
            
            if (!referralCode) {
                await interaction.user.send({embeds: [premiumMessage]})
    
                if (codeDB.duration == "Day") {
                    if (codeDB.type == "User") {
                        await db.collection("codes").updateOne({code: code}, {$set: {redeemed: true}})
                        await db.collection("user-data").updateOne({userId: interaction.user.id}, {$set: {"premium.expiryDate": Date.now() + (1000 * 60 * 60 * 24)}})
                        await interaction.editReply({content: await translator("Successfully redeemed premium for a day!", "English", language || "English"), ephemeral: true})
                        return
                    }
                    await db.collection("codes").updateOne({code: code}, {$set: {redeemed: true}})
                    await db.collection("guild-data").updateOne({guildId: interaction.guild.id}, {$set: {"premium.expiryDate": Date.now() + (1000 * 60 * 60 * 24)}})
                    await interaction.editReply({content: await translator("Successfully redeemed premium for a day!", "English", language || "English"), ephemeral: true})
                    return
                }
        
                if (codeDB.duration == "Week") {
                    if (codeDB.type == "User") {
                        await db.collection("codes").updateOne({code: code}, {$set: {redeemed: true}})
                        await db.collection("user-data").updateOne({userId: interaction.user.id}, {$set: {"premium.expiryDate": Date.now() + (1000 * 60 * 60 * 24 * 7)}})
                        await interaction.editReply({content: await translator("Successfully redeemed premium for a week!", "English", language || "English"), ephemeral: true})
                        return
                    }
                    await db.collection("codes").updateOne({code: code}, {$set: {redeemed: true}})
                    await db.collection("guild-data").updateOne({guildId: interaction.guild.id}, {$set: {"premium.expiryDate": Date.now() + (1000 * 60 * 60 * 24 * 7)}})
                    await interaction.editReply({content: await translator("Successfully redeemed premium for a week!", "English", language || "English"), ephemeral: true})
                    return
                }
                if (codeDB.duration == "Month") {
                    if (codeDB.type == "User") {
                        console.log("HI")
                        await db.collection("codes").updateOne({code: code}, {$set: {redeemed: true}})
                        await db.collection("user-data").updateOne({userId: interaction.user.id}, {$set: {"premium.expiryDate": Date.now() + (1000 * 60 * 60 * 24 * 30)}}, {upsert: true})
                        await db.collection("guild-data").updateOne({guildId: interaction.guild.id}, {$inc: {"premium.points": 3000}})
                        await interaction.editReply({content: await translator("Successfully redeemed premium for a month!", "English", language || "English"), ephemeral: true})
                        return
                    }
                    await db.collection("codes").updateOne({code: code}, {$set: {redeemed: true}})
                    await db.collection("guild-data").updateOne({guildId: interaction.guild.id}, {$set: {"premium.expiryDate": Date.now() + (1000 * 60 * 60 * 24 * 30)}})
                    await db.collection("guild-data").updateOne({guildId: interaction.guild.id}, {$inc: {"premium.points": 1000}})

                    await interaction.editReply({content: await translator("Successfully redeemed premium for a month!", "English", language || "English"), ephemeral: true})
                    return
                }
        
                if (codeDB.duration == "Year") {
                    if (codeDB.type == "User") {
                        await db.collection("codes").updateOne({code: code}, {$set: {redeemed: true}})
                        await db.collection("user-data").updateOne({userId: interaction.user.id}, {$set: {"premium.expiryDate": Date.now() + (1000 * 60 * 60 * 24 * 365)}}, {upsert: true})
                        await db.collection("guild-data").updateOne({guildId: interaction.guild.id}, {$inc: {"premium.points": 20000}})
                        await interaction.editReply({content: await translator("Successfully redeemed premium for a year!", "English", language || "English"), ephemeral: true})
                        return
                    }
                    await db.collection("codes").updateOne({code: code}, {$set: {redeemed: true}})
                    await db.collection("guild-data").updateOne({guildId: interaction.guild.id}, {$set: {"premium.expiryDate": Date.now() + (1000 * 60 * 60 * 24 * 365)}})
                    await db.collection("guild-data").updateOne({guildId: interaction.guild.id}, {$inc: {"premium.points": 17000}})

                    await interaction.editReply({content: await translator("Successfully redeemed premium for a year!", "English", language || "English"), ephemeral: true})
                    return
                }
        
                if (codeDB.duration == "Permanent") {
                    if (codeDB.type == "User") {
                        await db.collection("codes").updateOne({code: code}, {$set: {redeemed: true}})
                        await db.collection("user-data").updateOne({userId: interaction.user.id}, {$set: {"premium.expiryDate": Date.now() + (1000 * 60 * 60 * 24 * 365 * 100)}})
                        await interaction.editReply({content: await translator("Successfully redeemed premium for permanent!", "English", language || "English"), ephemeral: true})
                        return
                    }
                    await db.collection("codes").updateOne({code: code}, {$set: {redeemed: true}})
                    await db.collection("guild-data").updateOne({guildId: interaction.guild.id}, {$set: {"premium.expiryDate": Date.now() + (1000 * 60 * 60 * 24 * 365 * 100)}})
                    await interaction.editReply({content: await translator("Successfully redeemed premium for permanent!", "English", language || "English"), ephemeral: true})
                    return
                }
                return
            }
            
        return
        }
        else {
            await interaction.reply(errorCodes(0, interaction.guild.id))
        }
        }
   
}
