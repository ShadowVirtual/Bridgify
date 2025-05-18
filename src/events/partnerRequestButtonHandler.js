const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType} = require("discord.js");
const { db } = require("../database.js");
const path = require("path");
const { randomNumber } = require("../functions/randomNumberGenerator.js");
const { isToggled } = require("../functions/dmtoggled.js");
const {isUserPremium} = require("../functions/isGuildPremium.js")
const { translator } = require("../functions/translator.js");
const { delay } = require("../functions/delay.js");
const { createProgressBar } = require("../functions/progressBar.js");
const { randomAd } = require("../functions/randomAd.js");
const { validateInvite } = require("../functions/validateInvite.js");
const { emojis } = require("../config.json");
const { errorCodes } = require("../functions/errorCodes.js");
const { name } = require("./memberTracker.js");




module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        

        if (!interaction.isButton()) return;

        // Extract button ID

        // GuildID = Sender's Guild
        // GuildID2 = Receiver's Guild
        const [action, randomStringCode, guildId, guildId2, Module] = interaction.customId.split('-');


        if (action !== 'accept' && action !== 'deny' && action !== 'check_ad' && action !== 'blacklist' ) return;

        const inviteBrigify = new ButtonBuilder()
            .setLabel("Invite")
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/api/oauth2/authorize?client_id=1193672589428654120&permissions=670014957584&scope=applications.commands%20bot`)

        const upvoteMe = new ButtonBuilder()
            .setLabel("Upvote")
            .setStyle(ButtonStyle.Link)
            .setURL(`https://top.gg/bot/1193672589428654120`)

        const adSpotForSale = new ButtonBuilder()
            .setLabel("Ad Spot For Sale")
            .setStyle(ButtonStyle.Link)
            .setEmoji('📎')
            .setURL(`https://discord.gg/TsXra96qqM`)
 
        const sentryBod = new ButtonBuilder()
        .setLabel('Sentry Bot')
            .setURL('https://discord.gg/xkGSm2vDsG')
            .setStyle(ButtonStyle.Link)
            .setEmoji('🔗')

        const row2 = new ActionRowBuilder()
        .addComponents(inviteBrigify, upvoteMe, adSpotForSale, sentryBot)



        const ModuleName = Module.replace("_", " ").replace(" ", "-")

        // Added null check for database responses
        const guildData2Response = await db.collection("guild-data").findOne({guildId: guildId2});
        const category = guildData2Response?.category || "N/A";
        const language = guildData2Response?.language || "English";


        const guildOwner = await interaction.client.guilds.fetch(guildId).then(guild => guild.ownerId);

        const canSendDM = await isToggled(guildId);
        const user = await interaction.client.users.fetch(guildOwner)


        // Global Vars ^^^

        if (action === 'accept' && randomStringCode ===  randomStringCode) {
            await interaction.update({ components: [] })
            const guildData = await db.collection("guild-data")
            const guild2Data = await db.collection("guild-data").findOne({guildId: guildId2})
            const yourGuildData = await db.collection("guild-data").findOne({guildId: guildId})

            // Add null checks here
            if (!guild2Data) {
                await interaction.followUp("Error: Could not find partner guild data.");
                return;
            }

            if (!yourGuildData) {
                await interaction.followUp("Error: Could not find your guild data.");
                return;
            }

            const PartnerData = guild2Data;
            const GuildData = yourGuildData;

            // Initialize leaderboard if it doesn't exist
            if (!guild2Data.leaderboard) {
                await db.collection("guild-data").updateOne(
                    { guildId: guildId2 }, 
                    { $set: { leaderboard: [] } }, 
                    { upsert: true }
                );
                guild2Data.leaderboard = [];
            }
        
            const userIndex = guild2Data.leaderboard.findIndex(user => user.userId === interaction.user.id);
        
            if (userIndex !== -1) {
                guild2Data.leaderboard[userIndex].points += 1;
            } else {
                guild2Data.leaderboard.push({ userId: interaction.user.id, points: 1 });
            }
        
            await db.collection("guild-data").updateOne(
                { guildId: guildId2 }, 
                { $set: { leaderboard: guild2Data.leaderboard } }, 
                { upsert: true }
            );
        
            // Initialize your guild's leaderboard if it doesn't exist
            if (!yourGuildData.leaderboard) {
                await db.collection("guild-data").updateOne(
                    { guildId: guildId }, 
                    { $set: { leaderboard: [] } }, 
                    { upsert: true }
                );
                yourGuildData.leaderboard = [];
            }
        
            const userIndex2 = yourGuildData.leaderboard.findIndex(user2 => user2.userId === guildOwner);
        
            if (userIndex2 !== -1) {
                yourGuildData.leaderboard[userIndex2].points += 1;
            } else {
                yourGuildData.leaderboard.push({ userId: guildOwner, points: 1 });
            }
        
            await db.collection("guild-data").updateOne(
                { guildId: guildId }, 
                { $set: { leaderboard: yourGuildData.leaderboard } }, 
                { upsert: true }
            );


            await guildData.updateOne({ guildId: guildId }, { $inc: { partnersSent: 1 } }, { upsert: true })
            await guildData.updateOne({ guildId: interaction.guild.id }, { $inc: { partnersSent: 1 } }, { upsert: true })

            try {
                const channel1 = await interaction.client.channels.fetch(PartnerData.partnerChannel)
                const guildsss = await interaction.client.guilds.fetch(guildId)
                const channel2 = await guildsss.channels.fetch(GuildData.partnerChannel)
                
                await guildData.updateOne({ guildId: interaction.guild.id }, { $inc: { "partnersAccepted": 1 } }, { upsert: true })

                const embedMessage = new EmbedBuilder()
                    .setTitle("Partner")
                    .setDescription(PartnerData.advertisement?.message || "No message provided")
                    .setImage(PartnerData.advertisement?.banner2 || "https://cdn.discordapp.com/attachments/1197315922428432444/1291872189267705966/Banner.png?ex=6701ad3b&is=67005bbb&hm=29b5105bedb52716e1df149eb4324ac44277fa9eff086afecf468bea2c232536&")
                    .setColor(PartnerData?.hexColor || "Yellow")
                    .setFooter({text: `Bridgify EST. 2024. Used ${ModuleName}`})

                const embedMessage2 = new EmbedBuilder()
                    .setTitle("Partner")
                    .setDescription(GuildData.advertisement?.message || "No message provided")
                    .setImage(GuildData.advertisement?.banner2 || "https://cdn.discordapp.com/attachments/1197315922428432444/1291872189267705966/Banner.png?ex=6701ad3b&is=67005bbb&hm=29b5105bedb52716e1df149eb4324ac44277fa9eff086afecf468bea2c232536&")
                    .setColor(GuildData?.hexColor || "Yellow")
                    .setFooter({text: `Bridgify EST. 2024. Used ${ModuleName}`})

                const acceptedEmbed = new EmbedBuilder()
                    .setTitle(await translator(`${emojis.checkmark} Successful Partnership`, "English", language || "English"))
                    .setDescription(await translator(`${emojis.markdown} Guild:` + interaction.guild.name + `\n ${emojis.markdown} ID: ` +  interaction.guild.id + `\n  ${emojis.markdown} Members: ` +  interaction.guild.memberCount + `\n ${emojis.endingMarkdown} Category: ` + category || "Not specified", "English", language || "English"))
                    .setColor("Green")
                    .setTimestamp()
                    .setFooter({text: `Bridgify EST. 2024. Used ${ModuleName}`})
                    
                let pingRole = PartnerData?.partnerPingRole ? `<@&${PartnerData.partnerPingRole}>` : "";
                let pingRole2 = yourGuildData?.partnerPingRole ? `<@&${yourGuildData.partnerPingRole}>` : "";
                
                // Added extra null checks for guild advertisements
                const guildInvite = GuildData.advertisement?.invite ? 
                    await validateInvite(interaction.client, GuildData.advertisement.invite, GuildData.guildId) : 
                    "No invite provided";
                    
                const partnerInvite = PartnerData.advertisement?.invite ? 
                    await validateInvite(interaction.client, PartnerData.advertisement.invite, PartnerData.guildId) : 
                    "No invite provided";

                await channel1.send({ content: `${pingRole}`, embeds: [embedMessage2], components: [row2] })
                await channel1.send({ content: guildInvite })
                await channel2.send({ content: `${pingRole2}`, embeds: [embedMessage], components: [row2] })
                await channel2.send({ content: partnerInvite })
            } catch (error) {
                console.log(error)
                await interaction.followUp("An error occurred while sending partnership messages. Please check channel permissions.")
                return
            }
            
            if (canSendDM) {
                await interaction.followUp(await translator("Done!", "English", language || "English"))
                await user.send({ embeds: [acceptedEmbed], components: [row2] }).catch(() => null)
                return
            } else {
                await interaction.followUp(await translator("Done!", "English", language || "English"))
                return
            }
        }

        if (action === 'deny' && randomStringCode ===  randomStringCode) {
            await interaction.update({ components: [] })
            const declineEmbed = new EmbedBuilder()
            .setTitle(await translator(`${emojis.cross} Unsuccessful Partnership`, "English", language || "English"))
            .setDescription(await translator(`${emojis.markdown} Guild:` + interaction.guild.name + `\n ${emojis.markdown} ID: ` +  interaction.guild.id + `\n  ${emojis.markdown} Members: ` +  interaction.guild.memberCount + `\n ${emojis.endingMarkdown} Category: ` + category || "Not specified", "English", language || "English"))
            .setColor("Red")
            .setTimestamp()
            .setFooter({text: `Bridgify EST. 2024. Used ${ModuleName}`})
            if (canSendDM) {
                await interaction.followUp({ content: await translator("Done!", "English", language || "English"), components: [] })
                await user.send({ embeds: [declineEmbed], components: [row2] }).catch(() => null)
                return
            } else {
                await interaction.followUp({ content: await translator("Done!", "English", language || "English"), components: [] })
                return
            }
        }

        if (action === 'check_ad' && randomStringCode ===  randomStringCode) {
            const guild2Data = await db.collection("guild-data").findOne({guildId: guildId})
            
            // Add null check
            if (!guild2Data || !guild2Data.advertisement) {
                await interaction.reply({ content: "Advertisement not found or incomplete" });
                return;
            }

            const embedMessage2 = new EmbedBuilder()
            .setTitle("Partner")
            .setDescription(guild2Data.advertisement.message || "No message provided")
            .setColor("Yellow")
            await interaction.reply({ embeds: [embedMessage2] })
        }

        if (action === 'blacklist' && randomStringCode ===  randomStringCode) {
            await interaction.update({ components: [] })
            const declineEmbed = new EmbedBuilder()
            .setTitle(await translator(`${emojis.cross} Unsuccessful Partnership`, "English", language || "English"))
            .setDescription(await translator(`${emojis.markdown} Guild:` + interaction.guild.name + `\n ${emojis.markdown} ID: ` +  interaction.guild.id + `\n  ${emojis.markdown} Members: ` +  interaction.guild.memberCount + `\n ${emojis.endingMarkdown} Category: ` + category || "Not specified", "English", language || "English"))
            .setColor("Red")
            .setTimestamp()
            .setFooter({text: `Bridgify EST. 2024. Used ${ModuleName}`})

            const guildData = await db.collection("guild-data")
            await guildData.updateOne({guildId: interaction.guildId}, {$push: {blacklisted: guildId}}, {upsert: true})
            await interaction.followUp({ content: await translator("Partner Declined", "English", language || "English"), })
            if (canSendDM) {
                await user.send({ embeds: [declineEmbed], components: [row2] }).catch(() => null)
                return
            }
        }
    }

}
