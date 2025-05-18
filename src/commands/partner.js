const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ActionRow, ButtonBuilder, ButtonStyle, ComponentType, PermissionsBitField } = require("discord.js");
const { db } = require('../database')
const { isToggled } = require("../functions/dmtoggled.js");
const { translator } = require('../functions/translator');
const { validateInvite } = require("../functions/validateInvite.js");
const { emojis } = require("../config.json");
const { errorCodes } = require("../functions/errorCodes.js");
const { getServerMemberCount } = require("../functions/getServerMemberCount.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("partner")
        .setDescription("Partner with a random guild"),

    async execute(interaction) {
        await interaction.deferReply();
        const canSendDM = await isToggled(interaction.guildId);

        const guildData = db.collection("guild-data");
        const interactionGuild = await db.collection("guild-data").findOne({ guildId: interaction.guildId });
        const language = interactionGuild.language;
        const [randomServerWithAd, randomAd, yourGuildData] = await Promise.all([
            guildData.aggregate([
                { $match: { guildId: { $ne: interaction.guildId }, "advertisement.message": { $exists: true }, "allowPartners": true } },
                { $match: { "blacklisted": { $nin: [interaction.guildId] } } },
                { $match: { "lastGuildPartner": {$nin: [await guildData.findOne({guildId: interaction.guildId}).lastGuildPartner || await guildData.updateOne({guildId: interaction.guildId}, {$set: {lastGuildPartner: 0}}, {upsert: true})] } } },
                { $match: { 
                    $or: [
                        { "requirement.memberRequirement": { $exists: false } }, // Field is missing
                        { "requirement.memberRequirement": null },               // Field is null
                        { "requirement.memberRequirement": 0 },                  // Field is set to 0
                        { "requirement.memberRequirement": { $lte: interaction.guild.memberCount } } // Field meets member count
                    ]
                } },
                { $sample: { size: 1 } }
            ]).next(),
            guildData.aggregate([
                { $match: { "advertisement.message": { $exists: true } } },
                { $match: {"premium.expiryDate": {$gt: Date.now()}}},
                { $sample: { size: 1 } }
            ]).next(),
            guildData.findOne({ guildId: interaction.guildId })
        ]);



        if (!randomServerWithAd) {
            await interaction.editReply(await translator("There are no servers that are under that category.", "English", language || "English"));
            return;
        }

        if (!yourGuildData?.advertisement?.message) {
            const embed = await errorCodes(1, interaction.guildId);
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        if (!yourGuildData?.partnerChannel) {
            const embed = await errorCodes(1, interaction.guildId);
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        const roleId = yourGuildData.partnerRoleId;
        const userIsAuthorized = interaction.user.id === interaction.guild.ownerId || yourGuildData.managers?.includes(interaction.user.id) || interaction.member.roles.cache.has(roleId) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);
        if (!userIsAuthorized) {
            const embed = await errorCodes(0, interaction.guildId);
            await interaction.editReply({ embeds: [embed] });
            return;

        }

        if (randomAd) {
            try {


                const randonAdServerInfo = interaction.client.guilds.cache.get(`${randomAd.guildId}`);


                const spotlightEmbed = new EmbedBuilder()
                    .setColor('#FF6B6B')  // Attractive warm color
                    .setAuthor({ 
                        name: 'Featured Server Spotlight ✨', 
                        iconURL: randonAdServerInfo.iconURL()
                    })
                    .setTitle('📣 Premium Server Advertisement')
                    .setThumbnail(randonAdServerInfo.iconURL())
                    .setDescription(randomAd.advertisement.message)
                    .addFields([
                        {
                            name: '🔗 Quick Join',
                            value: `[Click to Join Server](${randomAd.advertisement.invite})`,
                            inline: true
                        },
                        {
                            name: '👥 Member Count',
                            value: `${randonAdServerInfo.memberCount.toLocaleString()} Members`,
                            inline: true
                        }
                    ])
                    .setImage(randonAdServerInfo.bannerURL({ size: 4096 })) // Server banner if available
                    .setTimestamp()
                    .setFooter({ 
                        text: '✨ Premium Server Advertisement • Brought to you by Bridgify',
                        iconURL: interaction.client.user.displayAvatarURL() 
                    });
        
                await interaction.editReply({ 
                    embeds: [spotlightEmbed],
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setStyle(ButtonStyle.Link)
                                    .setLabel('Join Server')
                                    .setURL(randomAd.advertisement.invite)
                                    .setEmoji('🎉'),

                                    
                                new ButtonBuilder()
                                .setLabel(`Support Server`)
                                .setURL('https://discord.gg/TsXra96qqM')
                                .setStyle(ButtonStyle.Link)
                                .setEmoji('🔗'),
            
                                new ButtonBuilder()
                                .setLabel(`Ad Spot for Sale`)
                                .setURL('https://discord.gg/TsXra96qqM')
                                .setStyle(ButtonStyle.Link)
                                .setEmoji('🔗')
                                    
                            )
                    ]
                });
        
                // Delete after 30 seconds instead of 10 for better visibility
                setTimeout(() => interaction.deleteReply().catch(() => {}), 30000);
        
            } catch (error) {
                console.error(`[ERROR] [Spotlight] Failed to display ad:`, error);
                await interaction.editReply({ 
                    content: 'Failed to load server spotlight. Please try again later.',
                    ephemeral: true 
                }).catch(() => {});
            }
        }

        const guildInfo = await interaction.client.guilds.fetch(randomServerWithAd.guildId).catch(() => {
            return
        });
        const id2 = interaction.guild.id
        const embedMessage = new EmbedBuilder()
            .setTitle(await translator("Partner", "English", language || "English"))
            .setDescription(await translator("Here's a server for you to partner with!", "English", language || "English"))
            .setColor("Yellow")
            .addFields(
                { name: await translator("Server Name", "English", language || "English"), value: guildInfo.name },
                { name: await translator("Server ID", "English", language || "English"), value: guildInfo.id },
                { name: await translator("Member Count", "English", language || "English"), value: `${await getServerMemberCount(randomServerWithAd.guildId, interaction.client)}` },
                { name: await translator("Server Category", "English", language || "English"), value: randomServerWithAd.category || "N/A" }
            );

        const acceptButton = new ButtonBuilder()
            .setLabel(await translator("Accept", "English", language || "English"))
            .setStyle(ButtonStyle.Success)
            .setCustomId("acceptButton")
            .setEmoji(emojis.checkmark);

        const denyButton = new ButtonBuilder()
            .setLabel(await translator("Decline", "English", language || "English"))
            .setStyle(ButtonStyle.Danger)
            .setCustomId("denyButton")
            .setEmoji(emojis.cross);

        const checkAd = new ButtonBuilder() 
            .setLabel(await translator("Check Ad", "English", language || "English"))
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("buttonChecKAd")
            .setEmoji(emojis.glass);


        const inviteBrigify = new ButtonBuilder()
            .setLabel("Invite")
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/api/oauth2/authorize?client_id=1193672589428654120&permissions=670014957584&scope=applications.commands%20bot`)
        const upvoteMe = new ButtonBuilder()
            .setLabel("Upvote")
            .setStyle(ButtonStyle.Link)
            .setURL(`https://top.gg/bot/1193672589428654120`)

        const row = new ActionRowBuilder()
            .addComponents(acceptButton, denyButton, checkAd);
        const row2 = new ActionRowBuilder()
            .addComponents(inviteBrigify, upvoteMe)
        
        const message = await interaction.followUp({ embeds: [embedMessage], components: [row], ephemeral: true })

        const filter = i => i.user.id === interaction.member.user.id;
        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, filter, time: 600000 });
        var guildOwner = interaction.user

        collector.on('collect', async interaction => {
            if (interaction.customId == "buttonChecKAd") {
                const embed = new EmbedBuilder()
                    .setTitle(await translator("Partner's Advertisement", "English", language || "English"))
                    .setDescription(`${randomServerWithAd.advertisement.message}`)
                    .addFields({ name: await translator("Invite Link", "English", language || "English"), value: `${randomServerWithAd.advertisement.invite}` })
                    .setTimestamp()
                
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
            if (interaction.customId === 'acceptButton') {
                collector.stop()
                await guildData.updateOne({ guildId: id2}, { $set: { "lastGuildPartner": randomServerWithAd.guildId } }, { upsert: true });
                const reply = await interaction.reply({ content: await translator("Partner request sent!", "English", language || "English"), components: [], embeds: [] });
                const channel = randomServerWithAd.partnershipReviewChannel


                
                const randomStringCode = Math.random().toString(36).substring(2, 15);


                const requestedEmbed = new EmbedBuilder()
                .setTitle(`${emojis.checkmark} Partner Request`)
                .setDescription(await translator(`${emojis.markdown} Guild: ` + interaction.guild.name + `\n ${emojis.markdown} ID:` + interaction.guild.id + `\n ${emojis.markdown} Members: ` + interaction.guild.memberCount + `\n ${emojis.endingMarkdown} Category:`  + await guildData.findOne({ guildId: interaction.guild.id }).then(x => x.category) || "Did Not Specified", "English", randomServerWithAd.language || "English"))
                .setColor("Yellow")
                .setTimestamp();
                
                const acceptButton2 = new ButtonBuilder()
                    .setLabel(await translator("Accept", "English", randomServerWithAd.language || "English"))
                    .setStyle(ButtonStyle.Success)
                    .setCustomId(`accept-${randomStringCode}-${interaction.guild.id}-${randomServerWithAd.guildId}-partner`)
                    .setEmoji(emojis.checkmark)
                const checkAd = new ButtonBuilder()
                    .setLabel(await translator("Check Ad", "English", randomServerWithAd.language || "English"))
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId(`check_ad-${randomStringCode}-${interaction.guild.id}-${randomServerWithAd.guildId}-partner`)
                    .setEmoji(emojis.glass)
                const denyButton2 = new ButtonBuilder()
                    .setLabel(await translator("Decline", "English", randomServerWithAd.language || "English"))
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId(`deny-${randomStringCode}-${interaction.guild.id}-${randomServerWithAd.guildId}-partner`)
                    .setEmoji(emojis.cross)
                const blacklistButton = new ButtonBuilder()
                    .setLabel(await translator("Blacklist", "English", randomServerWithAd.language || "English"))
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId(`blacklist-${randomStringCode}-${interaction.guild.id}-${randomServerWithAd.guildId}-partner`)
                    .setEmoji(emojis.banHammer)

                let row3 = new ActionRowBuilder()
                    .addComponents(acceptButton2, denyButton2, blacklistButton, checkAd)



                const PartnerData = await guildData.findOne({ guildId: randomServerWithAd.guildId });
                const GuildData = await guildData.findOne({ guildId: interaction.guild.id });

                if (PartnerData && PartnerData?.premium?.expiryDate > Date.now()) {
                    
                
                    if (PartnerData && PartnerData?.auto_accept) {
                        await guildData.updateOne({ guildId: id2 }, { $inc: { partnersSent: 1 } }, { upsert: true })
                        await guildData.updateOne({ guildId: PartnerData.guildId }, { $inc: { partnersSent: 1 } }, { upsert: true })

                        const embedMessage = new EmbedBuilder()
                            .setTitle("Partner")
                            .setDescription(PartnerData.advertisement.message)
                            .setImage(PartnerData.advertisement?.banner2 || "https://cdn.discordapp.com/attachments/1197315922428432444/1291872189267705966/Banner.png?ex=6701ad3b&is=67005bbb&hm=29b5105bedb52716e1df149eb4324ac44277fa9eff086afecf468bea2c232536&")
                            .setColor(PartnerData?.hexColor || "Yellow")
                            .setFooter({text: "Bridgify EST. 2024. Used /partner"})

                        const embedMessage2 = new EmbedBuilder()
                            .setTitle("Partner")
                            .setDescription(GuildData.advertisement.message)
                            .setImage(GuildData.advertisement?.banner2 || "https://cdn.discordapp.com/attachments/1197315922428432444/1291872189267705966/Banner.png?ex=6701ad3b&is=67005bbb&hm=29b5105bedb52716e1df149eb4324ac44277fa9eff086afecf468bea2c232536&")
                            .setColor(GuildData?.hexColor || "Yellow")
                            .setFooter({text: "Bridgify EST. 2024. Used /partner"})

                        const inviteForPartner = await validateInvite(interaction.client, GuildData.advertisement.invite, GuildData.guildId)
                        const inviteForPartner2 = await validateInvite(interaction.client, PartnerData.advertisement.invite, PartnerData.guildId)
                        const shards = await interaction.client.guilds.fetch(PartnerData.guildId).then(x => x.shardId);
                        interaction.client.shard.broadcastEval(async (client, { PartnerData, GuildData, embedMessage, embedMessage2, row2, inviteForPartner, inviteForPartner2 }) => {
                                try {
                                    const channel1 = await client.channels.fetch(PartnerData.partnerChannel);
                                    const channel2 = await client.channels.fetch(GuildData.partnerChannel);
                            
                                    if (channel1 && channel2) {
                                        // Send messages to the first channel
                                        await channel1.send({ embeds: [embedMessage2], components: [row2] }).catch(() => { return; });
                                        await channel1.send({ content: `${inviteForPartner}` }).catch(() => { return; });
                            
                                        // Send messages to the second channel
                                        await channel2.send({ embeds: [embedMessage], components: [row2] }).catch(() => { return; });
                                        await channel2.send({ content: `${inviteForPartner2}` }).catch(() => { return; });
                                    }
                                } catch (error) {
                                    console.error(error);
                                }
                            }, {
                                shard: shards,
                                context: {
                                    PartnerData,
                                    GuildData,
                                    embedMessage,
                                    embedMessage2,
                                    row2,
                                    inviteForPartner,
                                    inviteForPartner2
                                }
                            });

                        const guild = await interaction.client.guilds.fetch(PartnerData.guildId)
                        const acceptedEmbed = new EmbedBuilder()
                        .setTitle(await translator(`${emojis.checkmark} Successful Partnership`, "English", language || "English"))
                        .setDescription(await translator(`${emojis.markdown} Guild:` + guild.name + `\n ${emojis.markdown} ID: ` +  guild.id + `\n  ${emojis.markdown} Members: ` +  guild.memberCount + `\n ${emojis.endingMarkdown} Category: ` + randomServerWithAd.category || "Not specified", "English", language || "English"))
                        .setColor("Green")
                        .setTimestamp()
                        .setFooter({text: "Bridgify EST. 2024"})

                        if (canSendDM) {
                            await guildOwner.send({ embeds: [acceptedEmbed], components: [row2] }).catch(() => null) 
                            return
                        }
                        return
                    }}

                    try {
                      
                        
                    
                        await interaction.client.shard.broadcastEval(async (client, { 
                            
                            partnerRequestChannel, requestedEmbed, row3,

                              
                        }) => {
     
                            try {

                                
                                const path = require("path");



                                const channels = await client.channels.fetch(partnerRequestChannel);
                                if (!channels) return;
                                
                                await channels.send({ 
                                    embeds: [requestedEmbed], 
                                    components: [row3] 
                                });

                        


                            } catch (error) {
                                console.error(error);
                            }
                        }, {
                            context: {
                                partnerRequestChannel: channel,
                                requestedEmbed,
                                row3,
                            }
                        });
                    } catch (error) {
                        if (error.code === 50001) {
                            return await reply.edit({ content: await translator("Partner Request timed out!", "English", language || "English"), ephemeral: true });
                        }
                        return;
                    }

            } else if (interaction.customId === 'denyButton') {
                await interaction.update({ content: await translator("I've declined the request! If you want to partner with a different server please use `/partner` again in 2 minutes", "English", language || "English"), components: [], embeds: [] });
            }
        });
}
};
