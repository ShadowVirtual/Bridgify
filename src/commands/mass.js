const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType} = require("discord.js");
const { db } = require("../database.js");
const { randomNumber } = require("../functions/randomNumberGenerator.js");
const { isToggled } = require("../functions/dmtoggled.js");
const { isGuildPremium } = require("../functions/isGuildPremium.js");
const {isUserPremium} = require("../functions/isGuildPremium.js")
const { translator } = require("../functions/translator.js");
const { delay } = require("../functions/delay.js");
const { randomFact } = require("../functions/randomFact.js");
const { createProgressBar } = require("../functions/progressBar.js");
const { randomAd } = require("../functions/randomAd.js");
const { validateInvite } = require("../functions/validateInvite.js");
const { emojis } = require("../config.json");
const { errorCodes } = require("../functions/errorCodes.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mass")
        .setDescription("[PREMIUM] Partner with all guilds"),


    async execute(interaction) {
        await interaction.deferReply()
        var id = interaction.guild.id
        var id2 = interaction.guild.id
        const canSendDM = await isToggled(interaction.guild.id)
        const guildData = db.collection("guild-data")
        const yourGuildData = await guildData.findOne({guildId: interaction.guild.id})
        const randomServer = await guildData.aggregate([
            { $match: {"advertisement.message": { $exists: true } } },
            { $match: { guildId: { $ne: interaction.guild.id } } },
            { $match: {"allowPartners": true} },
            { $match: {"blacklisted": {$nin: [interaction.guildId]}}},
            { $match: { 
                $or: [
                    { "requirement.memberRequirement": { $exists: false } }, // Field is missing
                    { "requirement.memberRequirement": null },               // Field is null
                    { "requirement.memberRequirement": 0 },                  // Field is set to 0
                    { "requirement.memberRequirement": { $lte: interaction.guild.memberCount } } // Field meets member count
                ]
            } },
            { $sample: { size: randomNumber(20, 25) } }
        ]).toArray()

        const guildAd = await db.collection("guild-data").findOne({guildId: interaction.guild.id}).then(data => data.advertisement.message)
        const missingPermissions = await db.collection("guild-data").findOne({guildId: interaction.guild.id}).then(data => data.managers)

        const requestee_id = interaction.guild.id
        if (!(await isGuildPremium(interaction.guildId) || await isUserPremium(interaction.user.id, interaction.client, interaction.guildId))) {
            await interaction.editReply({embeds: [await errorCodes(2, interaction.guildId)]});
            return
        }
        if (!guildAd) {
            const embed = await errorCodes(1, interaction.guildId)
            await interaction.editReply({ embeds: [embed] })
            return
        }
        const guildPartnerChannel2 = await db.collection("guild-data").findOne({guildId: interaction.guildId}).then(data => data.partnerChannel)

        if (!guildPartnerChannel2) {
            const embed = await errorCodes(1, interaction.guildId)
            await interaction.editReply({ embeds: [embed] })
            return
        }
        const roleId = yourGuildData.partnerManagerRole
        const userIsAuthorized = interaction.user.id === interaction.guild.ownerId || yourGuildData.managers?.includes(interaction.user.id) || interaction.member.roles.cache.has(roleId);
        if (!userIsAuthorized) {
            const embed = await errorCodes(0, interaction.guildId)
            await interaction.editReply({ embeds: [embed] })
            return
        }


        const estimatedTime = randomServer.length * 40 / 90; // This will give you the time in minutes
        const totalServers = randomServer.length;
        let currentServersBumped = 0
        let reply
        let bumpProcess

        await interaction.editReply({content: "Successfully executed Command!"})

        const updateProgressBar = async (currentServersBumped) => {
            const bumpProgress = createProgressBar(currentServersBumped, totalServers)
            
            bumpProcess = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle(await translator("**Partner-All-Guilds Processing!** <a:DiscordLoading:1244009948883456146>", "English", yourGuildData.language || "English"))
            .setDescription(await translator("- Kindly bear with us as the distribution to all servers is in progress. This might take a while due to Discord’s rate limit constraints <a:alarme_bleu94:1244014038036516957>", "English", yourGuildData.language || "English"))
            .setFields(
                {
                    name: await translator("<a:timer8:1244014040213098507> **How long will it take?**", "English", yourGuildData.language || "English"),
                    value: `- **${Math.round(estimatedTime)} minutes**`,
                    inline: true
                },
                {
                    name: await translator("<a:CatJAM:1244009652002361374> **How many servers will get your ad?**", "English", yourGuildData.language || "English"),
                    value: `- **${randomServer.length}**`,
                    inline: true
                },
                {
                    name: await translator("<a:Pepethinking:1244014039214850199> **Did you know that?**", "English", yourGuildData.language || "English"),
                    value: `- ${randomFact()}`,
                    inline: false
                },
                {
                    name: await translator("<a:Sharkpajamas:1249013510965428236> **Advertisements:**", "English", yourGuildData.language || "English"),
                    value: `${randomAd()}`,
                    inline: false
                },
                {
                    name: await translator("<:joewaiting:1223458445110280222> **Advertisement Progress**", "English", yourGuildData.language || "English"),
                    value: `\`${bumpProgress}\``,
                    inline: false
                }
            )
            .setTimestamp()

            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setLabel(`Support Server`)
                .setURL('https://discord.gg/TsXra96qqM')
                .setStyle(ButtonStyle.Link)
                .setEmoji('🔗'),

                new ButtonBuilder()
                .setLabel(`Ad Spot for Sale`)
                .setURL('https://discord.gg/TsXra96qqM')
                .setStyle(ButtonStyle.Link)
                .setEmoji('🔗'),

                new ButtonBuilder()
                .setLabel('Sentry Bot')
                .setURL('https://discord.gg/xkGSm2vDsG')
                .setStyle(ButtonStyle.Link)
                .setEmoji('🔗')
            )

            if (!reply) {
                reply = await interaction.channel.send({embeds: [bumpProcess], components: [row]})
            }
            else {
                await reply.edit({embeds: [bumpProcess], components: [row]})
            }
        }
        await updateProgressBar(currentServersBumped);
        
        const bumpInterval = setInterval(async () => {
            if (currentServersBumped >= totalServers) {
                clearInterval(bumpInterval); 
            } else {
                currentServersBumped++;
                await updateProgressBar(currentServersBumped)
            }
        }, 40000); 

        try {
        for (const guild of randomServer) {
            try {
            await delay(20000)
            var guildDB = await guildData.findOne({guildId: guild.guildId})

            const guildOwner = interaction.user;

            const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Wanna Upvote Bridgify?")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://top.gg/bot/1193672589428654120"),
                new ButtonBuilder()
                    .setLabel("Invite Bridgify")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://discord.com/api/oauth2/authorize?client_id=1193672589428654120&permissions=18456&scope=applications.commands%20bot")
            );



            const randomStringCode = Math.random().toString(36).substring(2, 15);


            const acceptButton2 = new ButtonBuilder()
                .setLabel(await translator("Accept", "English", guild.language || "English"))
                .setStyle(ButtonStyle.Success)
                .setCustomId(`accept-${randomStringCode}-${interaction.guild.id}-${guild.guildId}-mass`)
                .setEmoji(emojis.checkmark)
            const checkAd = new ButtonBuilder()
                .setLabel(await translator("Check Ad", "English", guild.language || "English"))
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`check_ad-${randomStringCode}-${interaction.guild.id}-${guild.guildId}-mass`)
                .setEmoji(emojis.glass)
            const denyButton2 = new ButtonBuilder()
                .setLabel(await translator("Decline", "English", guild.language || "English"))
                .setStyle(ButtonStyle.Danger)
                .setCustomId(`deny-${randomStringCode}-${interaction.guild.id}-${guild.guildId}-mass`)
                .setEmoji(emojis.cross)
            const blacklistButton = new ButtonBuilder()
                .setLabel(await translator("Blacklist", "English", guild.language || "English"))
                .setStyle(ButtonStyle.Danger)
                .setCustomId(`blacklist-${randomStringCode}-${interaction.guild.id}-${guild.guildId}-mass`)
                .setEmoji(emojis.banHammer)


            const row2 = new ActionRowBuilder().addComponents(acceptButton2, checkAd, denyButton2, blacklistButton);
            
            const categorySearch = await guildData.findOne({ guildId: guildDB.guildId }).then(data => data.category) || `\`None.\``;
            const categorySearch2 = await guildData.findOne({ guildId: id }).then(data => data.category) || `\`None.\``;

            const requestedEmbed = new EmbedBuilder()
                .setTitle(await translator(`${emojis.checkmark} Partner Request`, "English", guild.language || "English"))
                .setDescription(await translator(`${emojis.markdown} Guild: **${await interaction.client.guilds.fetch(id).then(x => x.name)}**\n ${emojis.markdown} Guild ID: **${await interaction.client.guilds.fetch(id).then(x => x.id)}** \n ${emojis.markdown} Member Count: **${await interaction.client.guilds.fetch(id).then(x => x.memberCount)}** \n ${emojis.endingMarkdown} Category: **${categorySearch2 || "N/A"}**`, "English", guild.language || "English"))
                .setColor("Yellow")
                .setTimestamp()
                .setFooter({text: "Bridgify EST. 2024"})

            if (await db.collection("guild-data").findOne({guildId: guildDB.guildId}).then(data => data?.premium?.expiryDate) > Date.now()) {
                
            
            if (await db.collection("guild-data").findOne({guildId: guildDB.guildId}).then(data => data.auto_accept) === true) {
                try {
                // requested guild
                await guildData.findOneAndUpdate(
                    { guildId: guild.guildId },
                    { $inc: {
                        partnersSent: 1
                    } },
                    { upsert: true }
                );
                // requesting guild
                await guildData.findOneAndUpdate(
                    { guildId: interaction.guild.id },
                    { $inc: {
                        partnersSent: 1
                    } },
                    { upsert: true }
                );

                const userChannel = await guildData.findOne({guildId: guildDB.guildId}).then(data => data.partnerChannel)
                const userAd = await guildData.findOne({guildId: guildDB.guildId}).then(data => data.advertisement.message)
                const guildChannel = await guildData.findOne({guildId: id}).then(data => data.partnerChannel)
                const guildAd = await guildData.findOne({guildId: id}).then(data => data.advertisement.message)
                const invite = await guildData.findOne({guildId: id}).then(data => data.advertisement.invite)
                const invite2 = await guildData.findOne({guildId: guildDB.guildId}).then(data => data.advertisement.invite)
                const banner = await guildData.findOne({guildId: id})
                const banner2 = await guildData.findOne({guildId: guildDB.guildId})



                var ad1 = new EmbedBuilder()
                .setTitle("Partner")
                .setDescription(guildAd)
                .setImage(banner.advertisement?.banner2 || "https://cdn.discordapp.com/attachments/1197315922428432444/1291872189267705966/Banner.png?ex=6701ad3b&is=67005bbb&hm=29b5105bedb52716e1df149eb4324ac44277fa9eff086afecf468bea2c232536&")
                .setColor( banner?.hexColor || "Yellow")
                .setFooter({text: "Bridgify EST. 2024. Used /mass"})

                var ad2 = new EmbedBuilder()
                .setTitle("Partner")
                .setDescription(userAd)
                .setImage(banner2.advertisement?.banner2 || "https://cdn.discordapp.com/attachments/1197315922428432444/1291872189267705966/Banner.png?ex=6701ad3b&is=67005bbb&hm=29b5105bedb52716e1df149eb4324ac44277fa9eff086afecf468bea2c232536&")
                .setColor( banner2?.hexColor || "Yellow")
                .setFooter({text: "Bridgify EST. 2024. Used /mass"})

                try {
                    var guild3 = await interaction.client.guilds.fetch(guildDB.guildId);


                    const partnerServerID = guildDB.guildId
                    const shardId = await interaction.client.guilds.fetch(guildDB.guildId).then(x => x.shardId)

                    interaction.client.shard.broadcastEval(async (client, {userChannel, guildChannel, ad1, row1, ad2, invite, invite2,  id, partnerServerID }) => {
                        const guildss = await client.guilds.fetch(id)
                        const channel1 = await  client.channels.fetch(userChannel)

                        const channel2 = await guildss.channels.fetch(guildChannel)


                        const path = require("path");
                        const validationPath = path.resolve(__dirname, '../../../../src/functions/validateInvite');


                        const {validateInvite} = require(validationPath);

                        await channel1.send({
                            embeds: [ad1],
                            components: [row1]
                        }).catch(() => null)
                        await channel1.send({
                            content: `${await validateInvite(client, invite, id)}`
                        }).catch(() => null)
                        await channel2.send({
                            embeds: [ad2],
                            components: [row1]
                        }).catch(() => null)
                        await channel2.send({
                            content: `${await validateInvite(client, invite2, partnerServerID)}`
                        }).catch(() => null)
                    }, {
                        shard: shardId,
                        context: {
                            userChannel,
                            guildChannel,
                            ad1,
                            row1,
                            ad2,
                            invite,
                            invite2,
                            id,
                            partnerServerID
                        }
                    })
                 
                } catch (error) {
                    console.error(`[ERROR]  >>>  Error in partner all (sending embeds): ${error}`);
                }
                
                const acceptedEmbed = new EmbedBuilder()
                        .setColor("Green")
                        .setTitle(await translator(`${emojis.checkmark} Successful Partnerships`, "English", yourGuildData.language || "English"))
                        .setDescription(await translator(`${emojis.markdown} Guild: **${guild3.name}**\n ${emojis.markdown} Guild ID: **${guild3.id}** \n ${emojis.markdown} Member Count: **${guild3.memberCount}** \n ${emojis.endingMarkdown} Category: **${categorySearch}**`, "English", yourGuildData.language || "English"))
                        .setTimestamp()
                        .setFooter({text: "Bridgify EST. 2024"})

                    if (canSendDM) {
                        await guildOwner.send({
                            embeds: [acceptedEmbed],
                            components: [row1]
                        }).catch(() => null)
                        continue
                    }
                    continue
                } catch (err) {
                    console.log(err)
                    continue
                }}}
                    
                    const partnerShardId = await interaction.client.guilds.fetch(guildDB.guildId).then(data => data.shardId)

                    try {
                    interaction.client.shard.broadcastEval(async (client, {
                        row2, 
                        requestedEmbed,
                        guild
                    }) => {
                        try {

                        const path = require("path");
                        const dbPath = path.resolve(__dirname, '../../../../src/database');

                        const { db } = require(dbPath);
    
                        const guildData = db.collection("guild-data");

                        const guildDB = await guildData.findOne({guildId: guild.guildId})

                        const requestChannel = await client.channels.fetch(guildDB.partnerRequestsChannel)

                        await requestChannel.send({
                            embeds: [requestedEmbed],
                            components: [row2]
                        })

    
                    } catch (error) {
                        console.error(`[ERROR]  >>>  Error in partner all (collecting buttons): ${error} \n ${error.stack} \n ${error.message} \n ${error.name} \n ${error.code} \n ${error.stackTrace}`);
                    }
                    }, {
                        shard: partnerShardId,
                        context: {
                            row2, 
                            requestedEmbed,
                            guild,
                        }
                    }
                    )} catch (error) {
                        console.error(`[ERROR]  >>>  Error in partner all (buttons): ${error}`);
                        continue
                    }
                } catch (error) {
                    console.error(`[ERROR]  >>>  Error in partner all: ${error}`);
                    continue
                }


            

        }
        } catch (error) {
            console.error(`[ERROR]  >>>  Error in partner all: ${error}`);
        }

        const serverBumpRank = await db.collection("guild-data")
        .find()
        .sort({ partnersSent: -1 })
        .toArray()
        .then(guilds => {
          const rank = guilds.findIndex(g => g.guildId === interaction.guild.id) + 1;
          return rank; 
        });        
        const cooldown = 2 * 60 * 60 * 1000
        
        const nextBumpTimestamp = Date.now() + cooldown; 
        const message3 = new EmbedBuilder()
        .setColor("Blurple")
        .setTitle(await translator(`Successful Mass!`, "English", yourGuildData.language || "English"))
        .addFields(
            { name: await translator('Estimated Time for Completion', "English", yourGuildData.language || "English"), value: `${Math.round(estimatedTime)} minutes`, inline: false },
            { name: await translator('Servers Reached', "English", yourGuildData.language || "English"), value: `${randomServer.length}`, inline: false },
            { name: await translator(`Available again in: `, "English", yourGuildData.language || "English"), value: `<t:${Math.floor(nextBumpTimestamp / 1000)}:R>`, inline: false },
            { name: await translator('Server Partnership Rank', "English", yourGuildData.language || "English"), value: `#${serverBumpRank}`, inline: false }
        )
        .setThumbnail('https://cdn.discordapp.com/attachments/1197315922428432444/1288629955626008666/Icon.png?ex=66f5e1ab&is=66f4902b&hm=ea45ba5f0b520e7caade877d0795c5e1974e38dba25ea6e69f7e40926163bc5a&') 
        .setImage('https://cdn.discordapp.com/attachments/1197315922428432444/1288629980955283496/Banner.png?ex=66f5e1b1&is=66f49031&hm=cf859c83e8f575ab910d2dec8a4743a8f4e00ae35daeed18fbaad473a3d304b9&')
        .setFooter({text: await translator("Bridgify EST. 2024", "English", yourGuildData.language || "English")})
        .setTimestamp()

        await reply.edit({embeds: [message3]}) 
    }
}
