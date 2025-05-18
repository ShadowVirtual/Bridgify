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
        .setName("direct-partner")
        .setDescription("[LEGACY] Partner with a specific server")
        .addStringOption(option => (
            option.setName("guild-id"),
            option.setDescription("The ID of the guild"),
            option.setRequired(true)
        )),

    async execute(interaction) {
        await interaction.deferReply();
        const guildData = db.collection("guild-data");
        const canSendDM = await isToggled(interaction.guildId);
        const guildId = interaction.options.getString("guild-id");
        var randomServerWithAd = await guildData.findOne({ guildId: guildId });
        var yourGuildData = await guildData.findOne({ guildId: interaction.guildId });

        if (await guildData.findOne({ guildId: interaction.guildId }).then(data => data?.lastGuildPartner) == guildId) {
            const embed = await errorCodes(8, interaction.guildId);
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        if (!randomServerWithAd?.advertisement?.message) {
            const embed = await errorCodes(1, interaction.guildId);
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        const [randomAd,] =
            await guildData.aggregate([
                { $match: { "advertisement.message": { $exists: true } } },
                { $match: { "premium.expiryDate": { $gt: Date.now() } } },
                { $sample: { size: 1 } }
            ]).toArray();


        if (!randomServerWithAd) {
            const embed = await errorCodes(4, interaction.guildId);
            await interaction.editReply({ embeds: [embed] });
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
                                    .setEmoji('🎉')
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
            .setTitle(await translator("Partner", "English", yourGuildData.language || "English"))
            .setDescription(await translator("Here's a server for you to partner with!", "English", yourGuildData.language || "English"))
            .setColor("Yellow")
            .addFields(
                { name: await translator("Server Name:", "English", yourGuildData.language || "English"), value: guildInfo.name },
                { name: await translator("Server ID:", "English", yourGuildData.language || "English"), value: guildInfo.id },
                { name: await translator("Member Count:", "English", yourGuildData.language || "English"), value: `${await getServerMemberCount(guildInfo.id, interaction.client)}` },
                { name: await translator("Server Category:", "English", yourGuildData.language || "English"), value: randomServerWithAd.category || "N/A" }
            );

        const acceptButton = new ButtonBuilder()
            .setLabel(await translator("Accept", "English", yourGuildData.language || "English"))
            .setStyle(ButtonStyle.Success)
            .setCustomId("acceptButton")
            .setEmoji(emojis.checkmark)
        const denyButton = new ButtonBuilder()
            .setLabel(await translator("Decline", "English", yourGuildData.language || "English"))
            .setStyle(ButtonStyle.Danger)
            .setCustomId("denyButton")
            .setEmoji(emojis.cross)



        const inviteBrigify = new ButtonBuilder()
            .setLabel("Invite")
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/api/oauth2/authorize?client_id=1193672589428654120&permissions=670014957584&scope=applications.commands%20bot`)
        const upvoteMe = new ButtonBuilder()
            .setLabel("Upvote")
            .setStyle(ButtonStyle.Link)
            .setURL(`https://top.gg/bot/1193672589428654120`)

        const row = new ActionRowBuilder()
            .addComponents(acceptButton, denyButton);
        const row2 = new ActionRowBuilder()
            .addComponents(inviteBrigify, upvoteMe)

        const message = await interaction.followUp({ embeds: [embedMessage], components: [row], ephemeral: true })
        try {
            const filter = i => i.user.id === interaction.member.user.id;
            var collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, filter, time: 600000 });
        } catch (error) {
            console.log(`[ERROR]  >>>  Error occurred in direct-partner.js:`, error);
            return
        }
        var guildOwner = interaction.user

        collector.on('collect', async interaction => {
            if (interaction.customId == "checkAd") {
                const embed = new EmbedBuilder()
                    .setTitle(await translator("Partner's Advertisement", "English", yourGuildData.language || "English"))
                    .setDescription(`${randomServerWithAd.advertisement.message}`)
                    .addFields({ name: "Invite Link", value: `${randomServerWithAd.advertisement.invite}` })
                    .setTimestamp()
                
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
            if (interaction.customId === 'acceptButton') {
                collector.stop()
                try {
                    await guildData.updateOne({ guildId: interaction.guild.id }, { $set: { "lastGuildPartner": randomServerWithAd.guildId } }, { upsert: true });
                    var reply = await interaction.reply({ content: await translator("Partner request sent!", "English", yourGuildData.language || "English"), components: [], embeds: [] });
                    var channel = await interaction.client.channels.fetch(randomServerWithAd.partnershipReviewChannel);
                } catch (error) {
                    return
                }

                const requestedEmbed = new EmbedBuilder()
                    .setTitle(await translator(`${emojis.checkmark} Partner Request`, "English", randomServerWithAd.language || "English"))
                    .setDescription(await translator(`${emojis.markdown} Guild:`, "English", randomServerWithAd.language || "English") + `**${interaction.guild.name}**` + "\n" + await translator(`\n ${emojis.markdown} ID:`, "English", randomServerWithAd.language || "English") + `**${interaction.guild.id}**` + "\n" + await translator(`\n ${emojis.markdown} Member Count:`, "English", randomServerWithAd.language || "English") + `**${interaction.guild.memberCount}**` + "\n" + await translator(`\n ${emojis.endingMarkdown} Category:`, "English", randomServerWithAd.language || "English") + `**${randomServerWithAd?.category || "N/A"}**`)
                    .setColor("Yellow")
                    .setTimestamp();
                const randomStringCode = Math.random().toString(36).substring(2, 15);


                const acceptButton2 = new ButtonBuilder()
                    .setLabel(await translator("Accept", "English", randomServerWithAd.language || "English"))
                    .setStyle(ButtonStyle.Success)
                    .setCustomId(`accept-${randomStringCode}-${interaction.guild.id}-${randomServerWithAd.guildId}-direct_partner`)
                    .setEmoji(emojis.checkmark)
                const checkAd = new ButtonBuilder()
                    .setLabel(await translator("Check Ad", "English", randomServerWithAd.language || "English"))
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId(`check_ad-${randomStringCode}-${interaction.guild.id}-${randomServerWithAd.guildId}-direct_partner`)
                    .setEmoji(emojis.glass)
                const denyButton2 = new ButtonBuilder()
                    .setLabel(await translator("Decline", "English", randomServerWithAd.language || "English"))
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId(`deny-${randomStringCode}-${interaction.guild.id}-${randomServerWithAd.guildId}-direct_partner`)
                    .setEmoji(emojis.cross)
                const blacklistButton = new ButtonBuilder()
                    .setLabel(await translator("Blacklist", "English", randomServerWithAd.language || "English"))
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId(`blacklist-${randomStringCode}-${interaction.guild.id}-${randomServerWithAd.guildId}-direct_partner`)
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
                            .setFooter({ text: "Used /direct-partner" })

                        const embedMessage2 = new EmbedBuilder()
                            .setTitle("Partner")
                            .setDescription(GuildData.advertisement.message)
                            .setImage(GuildData.advertisement?.banner2 || "https://cdn.discordapp.com/attachments/1197315922428432444/1291872189267705966/Banner.png?ex=6701ad3b&is=67005bbb&hm=29b5105bedb52716e1df149eb4324ac44277fa9eff086afecf468bea2c232536&")
                            .setColor(GuildData?.hexColor || "Yellow")
                            .setFooter({ text: "Used /direct-partner" })


                        const partnerID = PartnerData.guildId
                        const invite = PartnerData.advertisement.invite
                        const guildInvite = GuildData.advertisement.invite
                        const shards = await interaction.client.guilds.fetch(partnerID).then(guild => guild.shardId)
                        interaction.client.shard.broadcastEval(async (client, {

                            embedMessage,
                            row2,
                            embedMessage2,
                            partnerID,
                            invite,
                            guildInvite ,
                            id2 ,
                            PartnerData,
                            GuildData,
                        }) => {
                            const path = require("path");
                            const validationPath = path.resolve(__dirname, '../../../../src/functions/validateInvite');
                            const { validateInvite } = require(validationPath);
                            const channel1 = await client.channels.fetch(PartnerData.partnerChannel)
                            const channel2 = await client.channels.fetch(GuildData.partnerChannel)
                            try {
                                if (channel1) {
                                    await channel1.send({ embeds: [embedMessage2], components: [row2] }).catch(() => {});
                                    await channel1.send({ content: `${await validateInvite(client, guildInvite, id2)}` }).catch(() => {});
                                }
                                if (channel2) {
                                    await channel2.send({ embeds: [embedMessage], components: [row2] }).catch(() => {});
                                    await channel2.send({ content: `${await validateInvite(client, invite, partnerID)}` }).catch(() => {});
                                }
                            } catch (error) {
                                console.log(error);
                                return;
                            }
                        }, {
                            shard: shards,
                            context: {
                            embedMessage,
                            row2,
                            embedMessage2,
                            partnerID,
                            invite,
                            guildInvite,
                            id2,
                            PartnerData,
                            GuildData,
                            }

                        })
                      
                        const guild = await interaction.client.guilds.fetch(PartnerData.guildId)
                        const acceptedEmbed = new EmbedBuilder()
                            .setTitle(await translator(`${emojis.checkmark} Successful Partnership`, "English", randomServerWithAd.language || "English"))
                            .setDescription(await translator(`${emojis.markdown} Guild:`, "English", yourGuildData.language || "English") + `**${guild.name}**` + "\n" + await translator(`${emojis.markdown} ID:`, "English", yourGuildData.language || "English") + "\n" + `**${guild.id}**` + "\n" + await translator(`\n ${emojis.markdown} Member Count:`, "English", yourGuildData.language || "English") + `**${guild.memberCount}**` + "\n" + await translator(`\n ${emojis.endingMarkdown} Category:`, "English", yourGuildData.language || "English") + `**${randomServerWithAd.category || "N/A"}**`)
                            .setColor("Green")
                            .setTimestamp()
                            .setFooter({ text: "Bridgify EST. 2024" })
                        if (canSendDM === false) {
                            return
                        }
                        else {
                            await guildOwner.send({ embeds: [acceptedEmbed], components: [row2] }).catch(() => null)
                        }
                        return
                    }
                }

                const partnerShard = await interaction.client.guilds.fetch(guildId).then(guild => guild.shardId)
                interaction.client.shard.broadcastEval(async (client, {
                    requestedEmbed,
                    row3,
                    guildId
                }) => {
                    const path = require("path");
                    const translatorPath = path.resolve(__dirname, '../../../../src/functions/translator');
                    const dbPath = path.resolve(__dirname, '../../../../src/database');
                    const { translator } = require(translatorPath);
                    const { db } = require(dbPath);

                    const guildData = db.collection("guild-data");

                    var randomServerWithAd = await guildData.findOne({guildId: guildId});

                    const channel = await client.channels.fetch(randomServerWithAd.partnershipReviewChannel);

                    await channel.send({ embeds: [requestedEmbed], components: [row3] }).catch(async (error) => {
                        if (error.code == 50001) return await channel.send({ content: await translator("Partner Request Timed Out", "English", "English"), ephemeral: true })
                    })

                }, {
                    shard: partnerShard,
                    context: {
                        requestedEmbed,
                        id2,
                        row3,
                        guildId,
                    }
                })
               
            } else if (interaction.customId === 'denyButton') {
                await interaction.update({ content: await translator("I've declined the request! If you want to partner with a different server please use `/partner` again in 2 minutes", "English", yourGuildData.language || "English"), components: [], embeds: [] });
            }
        });
    }
};
