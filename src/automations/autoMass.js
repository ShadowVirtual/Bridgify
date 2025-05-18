const { db } = require('../database')
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType } = require('discord.js')
const { isToggled } = require('../functions/dmtoggled.js')
const { translator } = require('../functions/translator')
const { validateInvite } = require('../functions/validateInvite.js')
const { emojis } = require('../config.json')

function wait(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds)
    })
}

class AutoMass {
    constructor(client) {
        /** @type {import("discord.js").Client<true>} */
        this.client = client
    }
}

async function autoMass(client) {
    const currentAutopartneringGuilds = await db
        .collection('guild-data')
        .aggregate([{ $match: { allowPartners: true } }, { $match: { autoMass: true } }, { $sample: { size: 4 } }])
        .toArray()

    try {
        for (const guildIds of currentAutopartneringGuilds) {
            try {
                var guildId = guildIds.guildId

                const guildData = db.collection('guild-data')
                const guildDataPremium = await guildData.findOne({ guildId: guildId })

                const hasServerPremium = guildDataPremium?.premium?.expiryDate > Date.now()

                let hasUserPremium = false
                if (!hasServerPremium) {
                    const guild = await client.guilds.fetch(guildId).catch(() => null)
                    if (!guild) {
                        console.warn(`Guild ${guildId} not found or inaccessible.`)
                        continue
                    }

                    const userData = await db.collection('user-data').findOne({
                        userId: guild.ownerId,
                        'premium.expiryDate': { $gt: Date.now() }
                    })

                    if (userData) {
                        hasUserPremium = true
                    }
                }

                if (!hasServerPremium && !hasUserPremium) {
                    console.log(`Skipping guild ${guildId} - no premium found.`)
                    continue
                }

                const currentAutopartneringGuildMemberCount = client.guilds.cache.get(guildId).memberCount
                const mongoGuild = await db.collection('guild-data').findOne({ guildId: guildId })
                var randomMongoGuild = await db
                    .collection('guild-data')
                    .aggregate([
                        {
                            $match: {
                                guildId: { $ne: guildId },
                                'advertisement.message': { $exists: true },
                                allowPartners: true
                            }
                        },
                        {
                            $match: {
                                lastGuildPartner: {
                                    $nin: [
                                        (await guildData.findOne({ guildId: mongoGuild.guildId }).lastGuildPartner) ||
                                            (await guildData.updateOne(
                                                { guildId: mongoGuild.guildId },
                                                { $set: { lastGuildPartner: 0 } },
                                                { upsert: true }
                                            ))
                                    ]
                                }
                            }
                        },
                        { $match: { blacklisted: { $nin: [guildId] } } },
                        {
                            $match: {
                                $or: [
                                    { 'requirement.memberRequirement': { $exists: false } }, // Field is missing
                                    { 'requirement.memberRequirement': null }, // Field is null
                                    { 'requirement.memberRequirement': 0 }, // Field is set to 0
                                    { 'requirement.memberRequirement': { $lte: currentAutopartneringGuildMemberCount } } // Field meets member count
                                ]
                            }
                        },
                        { $sample: { size: 50 } }
                    ])
                    .toArray()

                try {
                    for (const guild2 of randomMongoGuild) {
                        try {
                            if (!randomMongoGuild) {
                                console.log('There was no guilds')
                                return
                            }

                            await db
                                .collection('guild-data')
                                .findOne({ partnerRequestsChannel: guild2.partnerRequestsChannel })
                                .then(async (channel4) => {
                                    var guild = await client.guilds.fetch(guildId)

                                    const embed = new EmbedBuilder()

                                        .setTitle(
                                            await translator(
                                                `${emojis.checkmark} Partner Request`,
                                                'English',
                                                guild.language || 'English'
                                            )
                                        )
                                        .setDescription(
                                            await translator(
                                                `${emojis.markdown} Would you like to partner with **${guild.name} (${
                                                    guild.memberCount
                                                } Members)** \n${emojis.markdown} Guild ID: **${guildId}**\n${
                                                    emojis.endingMarkdown
                                                } Category: **${guild.category || 'None'}**\n>`,
                                                'English',
                                                guild.language || 'English'
                                            )
                                        )
                                        .setColor('Yellow')
                                        .setTimestamp()
                                        .setFooter({ text: 'Bridgify EST. 2024 • Auto Mass' })

                                    const randomStringCode = Math.random().toString(36).substring(2, 15)

                                    const acceptButton2 = new ButtonBuilder()
                                        .setLabel(await translator('Accept', 'English', guild2.language || 'English'))
                                        .setStyle(ButtonStyle.Success)
                                        .setCustomId(
                                            `accept-${randomStringCode}-${guildId}-${guild2.guildId}-auto_mass`
                                        )
                                        .setEmoji(emojis.checkmark)
                                    const checkAd = new ButtonBuilder()
                                        .setLabel(await translator('Check Ad', 'English', guild2.language || 'English'))
                                        .setStyle(ButtonStyle.Secondary)
                                        .setCustomId(
                                            `check_ad-${randomStringCode}-${guildId}-${guild2.guildId}-auto_mass`
                                        )
                                        .setEmoji(emojis.glass)
                                    const denyButton2 = new ButtonBuilder()
                                        .setLabel(await translator('Decline', 'English', guild2.language || 'English'))
                                        .setStyle(ButtonStyle.Danger)
                                        .setCustomId(`deny-${randomStringCode}-${guildId}-${guild2.guildId}-auto_mass`)
                                        .setEmoji(emojis.cross)
                                    const blacklistButton = new ButtonBuilder()
                                        .setLabel(
                                            await translator('Blacklist', 'English', guild2.language || 'English')
                                        )
                                        .setStyle(ButtonStyle.Danger)
                                        .setCustomId(
                                            `blacklist-${randomStringCode}-${guildId}-${guild2.guildId}-auto_mass`
                                        )
                                        .setEmoji(emojis.banHammer)

                                    const upvoteButton = new ButtonBuilder()
                                    upvoteButton.setLabel('Wanna Upvote Bridgify?')
                                    upvoteButton.setURL('https://botlist.me/bots/1193672589428654120')
                                    upvoteButton.setStyle(ButtonStyle.Link)

                                    const invitebotButton = new ButtonBuilder()
                                    invitebotButton.setLabel('Invite Bridgify')
                                    invitebotButton.setURL(
                                        'https://discord.com/api/oauth2/authorize?client_id=1193672589428654120&permissions=18456&scope=applications.commands%20bot'
                                    )
                                    invitebotButton.setStyle(ButtonStyle.Link)

                                    if (guild2?.auto_accept === true || guild2.auto_accept === true) {
                                        const guildData = await db
                                            .collection('guild-data')
                                            .findOne({ guildId: guild2.guildId })
                                        const channelId = guildData.partnerChannel
                                        const ad = guildData.advertisement.message
                                        const discordLink = guildData.advertisement.invite

                                        const guildData2 = await db
                                            .collection('guild-data')
                                            .findOne({ guildId: guildId })
                                        const channelId2 = guildData2.partnerChannel
                                        const ad2 = guildData2.advertisement.message
                                        const discordLink2 = guildData2.advertisement.invite

                                        const channel = await client.channels.fetch(channelId2)
                                        const row2 = new ActionRowBuilder().addComponents(upvoteButton, invitebotButton)
                                        const embed = new EmbedBuilder()
                                        embed.setTitle('Partnership')
                                        embed.setDescription(ad)
                                        embed.setImage(
                                            guildData.advertisement?.banner2 ||
                                                'https://cdn.discordapp.com/attachments/1197315922428432444/1291872189267705966/Banner.png?ex=6701ad3b&is=67005bbb&hm=29b5105bedb52716e1df149eb4324ac44277fa9eff086afecf468bea2c232536&'
                                        )
                                        embed.setColor(guildData?.hexColor || 'Yellow')
                                        embed.setFooter({ text: `Bridgify EST. 2024. Used Auto-Mass` })

                                        await channel.send({ embeds: [embed], components: [row2] }).catch((error) => {
                                            return console.log(error)
                                        })

                                        const embed2 = new EmbedBuilder()
                                        embed2.setTitle('Partnership')
                                        embed2.setDescription(ad2)
                                        embed2.setImage(
                                            guildData2.advertisement?.banner2 ||
                                                'https://cdn.discordapp.com/attachments/1197315922428432444/1291872189267705966/Banner.png?ex=6701ad3b&is=67005bbb&hm=29b5105bedb52716e1df149eb4324ac44277fa9eff086afecf468bea2c232536&'
                                        )
                                        embed2.setColor(guildData2?.hexColor || 'Yellow')
                                        embed2.setFooter({ text: `Bridgify EST. 2024. Used Auto-Mass` })

                                        const shards = await client.guilds
                                            .fetch(guild2.guildId)
                                            .then((guild) => guild.shardId)
                                        client.shard.broadcastEval(
                                            async (
                                                client,
                                                {
                                                    embed,
                                                    embed2,
                                                    row2,
                                                    discordLink,
                                                    discordLink2,
                                                    guildData,
                                                    guildData2
                                                }
                                            ) => {
                                                const path = require('path')
                                                const validationPath = path.resolve(
                                                    __dirname,
                                                    '../../../../src/functions/validateInvite'
                                                )
                                                const { validateInvite } = require(validationPath)

                                                const channel = await client.channels.fetch(guildData.partnerChannel)
                                                const channel2 = await client.channels.fetch(guildData2.partnerChannel)

                                                await channel2
                                                    .send({ embeds: [embed], components: [row2] })
                                                    .catch((error) => {
                                                        return console.log(error)
                                                    })
                                                await channel2
                                                    .send({
                                                        content: `${await validateInvite(
                                                            client,
                                                            discordLink,
                                                            guildData2.guildId
                                                        )}`
                                                    })
                                                    .catch((error) => {
                                                        return console.log(error)
                                                    })
                                                await channel
                                                    .send({ embeds: [embed2], components: [row2] })
                                                    .catch((error) => {
                                                        return console.log(error)
                                                    })
                                                await channel
                                                    .send({
                                                        content: `${await validateInvite(
                                                            client,
                                                            discordLink2,
                                                            guildData.guildId
                                                        )}`
                                                    })
                                                    .catch((error) => {
                                                        return console.log(error)
                                                    })
                                            },
                                            {
                                                shard: shards,
                                                context: {
                                                    embed,
                                                    embed2,
                                                    row2,
                                                    discordLink,
                                                    discordLink2,
                                                    guildData,
                                                    guildData2
                                                }
                                            }
                                        )

                                        db.collection('guild-data').updateOne(
                                            { guildId: guildId },
                                            { $inc: { partnersAccepted: 1 } }
                                        )

                                        let allowDMs = await isToggled(guildId)
                                        if (!allowDMs) return
                                        else {
                                            const owner = (await client.guilds.fetch(guildId)).fetchOwner()
                                            const w = new EmbedBuilder()
                                                .setTitle(
                                                    await translator(
                                                        `${emojis.checkmark} Successful Partnership!`,
                                                        'English',
                                                        mongoGuild.language || 'English'
                                                    )
                                                )
                                                .setColor('Green')
                                                .setDescription(
                                                    await translator(
                                                        `${emojis.markdown} Partnered with **${await client.guilds
                                                            .fetch(guild2.guildId)
                                                            .then((g) => g.name)}** \n ${
                                                            emojis.markdown
                                                        } Guild ID: **${await client.guilds
                                                            .fetch(guild2.guildId)
                                                            .then((g) => g.id)}** \n ${
                                                            emojis.endingMarkdown
                                                        } Member Count: **${await client.guilds
                                                            .fetch(guild2.guildId)
                                                            .then((g) => g.memberCount)}**`,
                                                        'English',
                                                        guild2.language || 'English'
                                                    )
                                                )
                                                .setTimestamp()
                                                .setFooter({ text: `Bridgify EST. 2024` })
                                            await owner.send({ embeds: [w] }).catch((error) => {
                                                return console.log(error)
                                            })
                                        }
                                        return
                                    }
                                    const row = new ActionRowBuilder().addComponents(
                                        acceptButton2,
                                        denyButton2,
                                        blacklistButton,
                                        checkAd
                                    )

                                    const shardId = await client.guilds
                                        .fetch(guild2.guildId)
                                        .then((guild) => guild.shardId)
                                    try {
                                        client.shard.broadcastEval(
                                            async (client, { embed, row, channel }) => {
                                                try {
                                                    const requestChannel = await client.channels.fetch(channel)
                                                    await requestChannel
                                                        .send({ embeds: [embed], components: [row] })
                                                        .catch((error) => {
                                                            return console.log(error)
                                                        })
                                                } catch (error) {
                                                    return
                                                }
                                            },
                                            {
                                                shard: shardId,
                                                context: {
                                                    guildId,
                                                    embed,
                                                    row,
                                                    channel: channel4.partnerRequestsChannel
                                                }
                                            }
                                        )
                                    } catch (err) {
                                        console.log(err)
                                    }
                                })
                        } catch (err) {
                            continue
                        }
                    }
                } catch (err) {
                    console.log(err)
                }
            } catch (err) {
                console.log(err)
            }
            await wait(20000)
        }
    } catch (err) {
        console.log(err)
    }
}

module.exports = { autoMass, AutoMass }
