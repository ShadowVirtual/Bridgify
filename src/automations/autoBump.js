const { db } = require('../database')
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ComponentType, ActionRowBuilder, ActionRow } = require('discord.js')
const { randomNumber } = require('../functions/randomNumberGenerator')
const { validateInvite } = require('../functions/validateInvite')
function wait(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds)
    })
}

class AutoAdvertise {
    constructor(client) {
        /** @type {import("discord.js").Client<true>} */
        this.client = client
    }
}

async function autoAdvertise(client) {
    try {
        const currentAutoadvertisingGuilds = await db
            .collection('guild-data')
            .aggregate([
                { $match: { advertisement_channel: { $exists: true } } },
                { $match: { advertisement: { $exists: true } } },
                { $match: { autoBump: true } },
                { $sample: { size: 4 } }
            ])
            .toArray()

        for (const guildIds of currentAutoadvertisingGuilds) {
            const guildId = guildIds.guildId

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

            //define everything
            const randomServer = await db
                .collection('guild-data')
                .aggregate([
                    { $match: { guildId: { $ne: guildId } } },
                    { $match: { advertisement_channel: { $exists: true } } },
                    { $sample: { size: randomNumber(190, 25) } }
                ])
                .toArray()

            const upvoteButton = new ButtonBuilder()
            upvoteButton.setStyle(ButtonStyle.Link)
            upvoteButton.setLabel('Wanna Upvote Bridgify?')
            upvoteButton.setURL('https://botlist.me/bots/1193672589428654120')

            const invitebotButton = new ButtonBuilder()
            invitebotButton.setStyle(ButtonStyle.Link)
            invitebotButton.setLabel('Invite Bridgify')
            invitebotButton.setURL(
                'https://discord.com/api/oauth2/authorize?client_id=1193672589428654120&permissions=18456&scope=applications.commands%20bot'
            )
            try {
                for (const guild of randomServer) {
                    const guildData = await db.collection('guild-data').findOne({ guildId: guild.guildId })
                    const guildData2 = await db.collection('guild-data').findOne({ guildId: guildId })

                    const channelId = guildData.advertisement_channel
                    const ad = guildData2.advertisement.message
                    const discordLink = guildData2.advertisement.invite
                    const row = new ActionRowBuilder().addComponents(upvoteButton, invitebotButton)
                    const adEmbed = new EmbedBuilder().setColor('Blurple').setTitle('Bumped').setDescription(ad)

                    await db
                        .collection('guild-data')
                        .updateOne({ guildId: guild.guildId }, { $inc: { bumpNumber: 1 } }, { upsert: true })
                    try {
                        const shards = await client.guilds.fetch(guild.guildId).then((guild) => guild.shardId)
                        client.shard.broadcastEval(
                            async (client, { adEmbed, row, discordLink, guildData, channelId }) => {
                                const path = require('path')
                                const validationPath = path.resolve(
                                    __dirname,
                                    '../../../../src/functions/validateInvite'
                                )
                                const { validateInvite } = require(validationPath)

                                const channel = await client.channels.fetch(channelId)

                                await channel.send({ embeds: [adEmbed], components: [row] }).catch(() => {})
                                await channel
                                    .send({
                                        content: `${await validateInvite(client, discordLink, guildData.guildId)}`
                                    })
                                    .catch(() => {})
                            },
                            {
                                shard: shards,
                                context: {
                                    adEmbed,
                                    row,
                                    discordLink,
                                    guildData,
                                    channelId
                                }
                            }
                        )
                    } catch (error) {
                        continue
                    }
                }
            } catch (error) {
                continue
            }
        }

        await wait(5000)
    } catch (error) {
        return
    }
}

module.exports = { AutoAdvertise, autoAdvertise }
