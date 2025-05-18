const { db } = require('../database')
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')
const { randomNumber } = require('../functions/randomNumberGenerator')
const { validateInvite } = require('../functions/validateInvite')

function wait(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds)
    })
}

class AutoAdvertise2 {
    constructor(client) {
        /** @type {import("discord.js").Client<true>} */
        this.client = client
    }
}

async function autoAdvertise2(client) {
    try {
        console.log('Starting autoAdvertise2...')

        // Fetch guilds that meet the base criteria
        const currentAutoadvertisingGuilds2 = await db
            .collection('guild-data')
            .aggregate([
                { $match: { advertisement_channel: { $exists: true } } },
                { $match: { advertisement: { $exists: true } } },
                { $match: { autoAdvertise: true } },
                { $sample: { size: 4 } }
            ])
            .toArray()
        console.log(`Fetched ${currentAutoadvertisingGuilds2.length} guilds for auto-advertising`)

        for (const guildData of currentAutoadvertisingGuilds2) {
            const guildId = guildData.guildId
            console.log(`Processing guild: ${guildId}`)

            // Check if the guild has server-level premium
            const hasServerPremium = guildData.premium?.expiryDate > Date.now()

            let hasUserPremium = false
            if (!hasServerPremium) {
                // Fetch the guild owner ID
                const guild = await client.guilds.fetch(guildId).catch(() => null)
                if (!guild) {
                    console.warn(`Guild ${guildId} not found or inaccessible.`)
                    continue
                }

                const ownerId = guild.ownerId

                // Check if the owner has user-sided premium
                const userData = await db.collection('user-data').findOne({ userId: ownerId })
                if (userData && userData.premium?.expiryDate > Date.now()) {
                    hasUserPremium = true
                }
            }

            // Skip this guild if neither server nor user premium is active
            if (!hasServerPremium && !hasUserPremium) {
                console.log(`Skipping guild ${guildId} - no premium found.`)
                continue
            }

            // Check potential servers to advertise to
            const potentialServers = await db
                .collection('guild-data')
                .find({
                    guildId: { $ne: guildId }, // Exclude current guild
                    advertisement_channel: { $exists: true } // Must have an advertisement channel
                })
                .toArray()

            console.log(`Potential servers before sampling: ${potentialServers.length}`)
            if (potentialServers.length === 0) {
                console.warn(`No valid servers found for advertising from guild: ${guildId}`)
                continue
            }

            // Sample random servers
            const randomServer = potentialServers.slice(0, randomNumber(100, 25))
            console.log(`Random servers selected: ${randomServer.length}`)

            const upvoteButton = new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Wanna Upvote Bridgify?')
                .setURL('https://botlist.me/bots/1193672589428654120')

            const invitebotButton = new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Invite Bridgify')
                .setURL(
                    'https://discord.com/api/oauth2/authorize?client_id=1193672589428654120&permissions=18456&scope=applications.commands%20bot'
                )

            for (const targetGuild of randomServer) {
                try {
                    console.log(`Processing random server: ${targetGuild.guildId}`)
                    const targetGuildData = await db.collection('guild-data').findOne({ guildId: targetGuild.guildId })

                    if (!targetGuildData) {
                        console.log(`Guild data missing for ${targetGuild.guildId}`)
                        continue
                    }

                    const channelId = targetGuildData.advertisement_channel
                    const channel = await client.channels.fetch(channelId).catch(() => null)
                    const ad = guildData.advertisement.message
                    const discordLink = guildData.advertisement.invite

                    if (!channel) {
                        console.log(`Channel ${channelId} not found for guild ${targetGuild.guildId}`)
                        continue
                    }

                    const row = new ActionRowBuilder().addComponents(upvoteButton, invitebotButton)
                    const adEmbed = new EmbedBuilder().setColor('Blurple').setTitle('Advertisement').setDescription(ad)

                    // Validate invite outside of shard eval
                    const invite = await validateInvite(client, discordLink, guildData.guildId)

                    // Check if sharding is enabled
                    if (client.shard) {
                        // Get the shard responsible for the guild
                        const shardId = client.guilds.resolve(targetGuild.guildId)?.shardId
                        if (shardId !== undefined) {
                            await client.shard.broadcastEval(
                                async (client, { channelId, adEmbed, invite, row }) => {
                                    const channel = await client.channels.fetch(channelId).catch(() => null)
                                    if (!channel) return

                                    await channel.send({ embeds: [adEmbed], components: [row] }).catch(console.error)
                                    await channel.send({ content: invite }).catch(console.error)
                                },
                                {
                                    shard: shardId,
                                    context: {
                                        channelId,
                                        adEmbed,
                                        invite,
                                        row
                                    }
                                }
                            )
                            console.log(`Successfully sent advertisement to ${targetGuild.guildId}`)
                        } else {
                            console.error(`No shard found for guild ${targetGuild.guildId}`)
                        }
                    } else {
                        // Direct sending method when sharding is not enabled
                        try {
                            await channel.send({ embeds: [adEmbed], components: [row] })
                            await channel.send({ content: invite })
                            console.log(`Successfully sent advertisement to ${targetGuild.guildId} (non-sharded)`)
                        } catch (error) {
                            console.error(`Error sending message to channel ${channelId}:`, error)
                        }
                    }
                } catch (error) {
                    console.error(`Error processing guild ${targetGuild.guildId}:`, error)
                }
            }
        }

        console.log('Finished autoAdvertise2 execution.')
        await wait(5000) // Delay before the next batch of advertisements
    } catch (error) {
        console.error('Error in autoAdvertise2 function:', error)
    }
}

module.exports = { AutoAdvertise2, autoAdvertise2 }
