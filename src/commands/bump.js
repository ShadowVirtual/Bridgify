const { SlashCommandBuilder, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonStyle, ButtonBuilder } = require("discord.js");
const { db } = require('../database')
const { randomNumber } = require("../functions/randomNumberGenerator.js");
const { isGuildPremium } = require("../functions/isGuildPremium.js")
const { translator } = require('../functions/translator')
const { delay } = require("../functions/delay.js");
const { randomFact } = require("../functions/randomFact.js")
const { createProgressBar } = require("../functions/progressBar.js")
const { randomAd } = require("../functions/randomAd.js");
const { validateInvite } = require("../functions/validateInvite.js");
const ms = require('ms');
const { errorCodes } = require("../functions/errorCodes.js");
module.exports = {
    cooldown: 3600,
    data: new SlashCommandBuilder()
        .setName('bump')
        .setDescription('bump your guild'),


    async execute(interaction) {
        await interaction.deferReply()
        const data = await db.collection('guild-data').findOne({ guildId: interaction.guild.id })
        const guildID = db.collection("guild-data")


        if (!data?.advertisement_channel) {
            const embed = await errorCodes(5, interaction.guild.id)
            await interaction.editReply({ embeds: [embed] })
            return
        }

        if (!data?.bumpAd?.message) {
            const embed = await errorCodes(6, interaction.guild.id)
            await interaction.editReply({ embeds: [embed] })
            return
        }
        const randomServerWithChannel = await guildID.aggregate([
            { $match: { guildId: { $ne: interaction.guildId } } },
            { $match: { "advertisement_channel": { $exists: true } } },
            { $sample: { size: randomNumber(25, 20) } }
        ]).toArray();

        const ad = await db.collection("guild-data").findOne({ guildId: interaction.guild.id })
        await db.collection("guild-data").updateOne({ guildId: interaction.guild.id }, { $inc: { "bumpNumber": 1 } }, { upsert: true })


        const estimatedTime = randomServerWithChannel.length * 40 / 190;
        const totalServers = randomServerWithChannel.length;
        let currentServersBumped = 0
        let reply



        const ad3 = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle(await translator("**Join this server for more members!**", "English", data.language || "English"))
            .setDescription("https://discord.gg/Sy2tN4NBD2")


        await interaction.editReply({ embeds: [ad3] })


        const updateProgressBar = async (currentServersBumped) => {
            const bumpProgress = createProgressBar(currentServersBumped, totalServers)

            const bumpProcess = new EmbedBuilder()
                .setColor("Blurple")
                .setTitle(await translator("**Bump Processing!** <a:DiscordLoading:1244009948883456146>", "English", data.language || "English"))
                .setDescription(await translator("- Kindly bear with us as the distribution to all servers is in progress. This might take a while due to Discord’s rate limit constraints <a:alarme_bleu94:1244014038036516957>", "English", data.language || "English"))
                .setFields(
                    {
                        name: await translator("<a:timer8:1244014040213098507> **How long will it take?**", "English", data.language || "English"),
                        value: `- **${Math.round(estimatedTime)} minutes**`,
                        inline: true
                    },
                    {
                        name: await translator("<a:CatJAM:1244009652002361374> **How many servers will get your ad?**", "English", data.language || "English"),
                        value: `- **${randomServerWithChannel.length}**`,
                        inline: true
                    },
                    {
                        name: await translator("<a:Pepethinking:1244014039214850199> **Did you know that?**", "English", data.language || "English"),
                        value: `- ${randomFact()}`,
                        inline: false
                    },

                    {
                        name: await translator("<a:Sharkpajamas:1249013510965428236> **Advertisements:**", "English", data.language || "English"),
                        value: `${randomAd()}`,
                        inline: false
                    },
                    {
                        name: await translator("<:joewaiting:1223458445110280222> **Bump Progress**", "English", data.language || "English"),
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


            const channel = interaction.channel
            const channelSend = interaction.client.channels.cache.get(channel.id)
            if (!reply) {
                reply = await channelSend.send({ embeds: [bumpProcess], components: [row] })
            }
            else {
                await reply.edit({ embeds: [bumpProcess], components: [row] })
            }

        }

        await updateProgressBar(currentServersBumped);

        const bumpInterval = setInterval(async () => {
            if (currentServersBumped >= totalServers) {
                clearInterval(bumpInterval); // Stop the interval when all servers are bumped
            } else {
                currentServersBumped++;
                await updateProgressBar(currentServersBumped)
            }
        }, 40000); // Update every 20 seconds as an example

        for (const server of randomServerWithChannel) {

            const timestamp = interaction.guild.createdTimestamp;
            const ageInDays = Math.floor(Math.round(timestamp / 1000));
            var bumpMessage = new EmbedBuilder()
                .setColor('Blurple')
                .setTitle(interaction.guild.name)
                .addFields(
                    {
                        name: await translator("__General Information__", "English", data.language || "English"),
                        value: await translator(`> ⏰ Created: <t:${ageInDays}:R> \n > 🚀 Boosts: ${interaction.guild.premiumSubscriptionCount}\n > 👪 Members: ${interaction.guild.memberCount} \n > 💥 Bumped: ${ad.bumpNumber}`, "English", server.language || "English"),
                        inline: false
                    },
                    {
                        name: await translator("__Server Description__", "English", server.language || "English"),
                        value: data?.bumpAd?.message,
                        inline: false
                    },
                    {
                        name: await translator("__ Advertisement Links __", "English", server.language || "English"),
                        value: "[Support](https://discord.gg/QVnc6HxEBB) • [Vote](https://top.gg/bot/1193672589428654120)",
                        inline: false
                    }
                )
                .setFooter({ text: await translator("Powered by Bridgify", "English", server.language || "English") })
                .setTimestamp();


            const Buttons = new ActionRowBuilder()
                .addComponents([
                    new ButtonBuilder()
                        .setLabel("Invite Bridgify")
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://discord.com/oauth2/authorize?client_id=1193672589428654120`),

                    // FIXME: implement at a later date
                    // new ButtonBuilder()
                    //     .setLabel("Join Server")
                    //     .setStyle(ButtonStyle.Link)
                    //     .setURL(`${(await validateInvite(interaction.client, data.advertisement.invite, interaction.guild.id))}`),

                    new ButtonBuilder()
                        .setLabel("Report")
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId("reportButton")
                ])

            await delay(20000)

            try {
                var usersadvertisingChannel = await db.collection("guild-data").findOne({ guildId: interaction.guild.id })
                var guildChannel = await interaction.client.channels.fetch(server.advertisement_channel)


                if (server.advertisement_channel == usersadvertisingChannel.advertisement_channel) {
                    continue
                }
                const shards = await interaction.client.guilds.fetch(server.guildId).then(guild => guild.shardId)
                const id2 = interaction.guild.id
                interaction.client.shard.broadcastEval(async (client, {
                    server,
                    Buttons,
                    id2,
                    invite,
                    bumpMessage
                }) => {
                    const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder} = require("discord.js");
                    let collector
                    let message
                    const path = require("path");
                    
                    const validationPath = path.resolve(__dirname, '../../../../src/functions/validateInvite');
                    const { validateInvite } = require(validationPath);
                    const { translator } = require(path.resolve(__dirname, '../../../../src/functions/translator'));

                    const guildChannel = await client.channels.fetch(server.advertisement_channel);
                    await guildChannel.send(await validateInvite(client, invite, id2));
                    message = await guildChannel.send({ embeds: [bumpMessage], components: [Buttons] });


                    const filter = (i) => i.user.id === i.member.user.id;

                    collector = message.createMessageComponentCollector({ filter, time: 172800000 });

                    collector.on("collect", async (i) => {
                        if (i.customId === "reportButton") {
                            const modal = new ModalBuilder()
                                .setCustomId("reportModal")
                                .setTitle(await translator("Report", "English", server.language || "English"))
                                .addComponents(
                                    new ActionRowBuilder().addComponents(
                                        new TextInputBuilder()
                                            .setCustomId("reportServer")
                                            .setLabel("Reason?")
                                            .setStyle(TextInputStyle.Paragraph)
                                            .setRequired(true)
                                            .setMinLength(10)
                                            .setMaxLength(500)
                                            .setPlaceholder(await translator("Enter your reason here", "English", server.language || "English"))
                                    )
                                )

                            await i.showModal(modal)

                            const modalSubmit = await i.awaitModalSubmit({ time: 1200000, filter: filter }).catch(() => { })

                            if (modalSubmit) {
                                const reportServer = modalSubmit.fields.getTextInputValue("reportServer")
                                const embed = new EmbedBuilder()
                                    .setTitle("Report")
                                    .setColor("Red")
                                    .setFields(
                                        {name: "Reported Server", value: id2, inline: true},
                                        {name: "Reported By", value: i.user.id, inline: true},
                                        {name: "Reason", value: reportServer, inline: false}
                                    )
                                const channel = await client.channels.fetch('1244431124873084968')

                                await channel.send({ embeds: [embed] })

                                await modalSubmit.reply({ content: await translator("Thank you for your report. We will review it shortly.", "English", server.language || "English"), ephemeral: true })
                            }
                        }
                    })
                }, {
                    shard: shards,
                    context: {
                        invite: data.advertisement.invite,
                        guildChannel,
                        Buttons,
                        id2,
                        bumpMessage,
                        server: server
                    }
                })


            } catch (error) {
                if (error.code == 10003) {
                    console.log("unable to send message to a channel that doesn't exist")
                    continue
                }
                console.log("unable to send message to an unknown channel")
                continue
            }
        }

        const serverBumpRank = await db.collection("guild-data")
            .find()
            .sort({ bumpNumber: -1 })
            .toArray()
            .then(guilds => {
                const rank = guilds.findIndex(g => g.guildId === interaction.guild.id) + 1;
                return rank;
            });
        const cooldown = 90 * 60 * 1000

        const nextBumpTimestamp = Date.now() + cooldown;
        const message3 = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle(await translator("Bump Successful!", "English", data.language || "English"))
            .setDescription(await translator(`Your guild has been bumped ${await db.collection("guild-data").findOne({ guildId: interaction.guild.id }).then(data => data.bumpNumber)} times!`, "English", data.language || "English"))
            .addFields(
                { name: await translator('Estimated Time for Completion', "English", data.language || "English"), value: `${Math.round(estimatedTime)} minutes`, inline: false },
                { name: await translator('Servers Reached', "English", data.language || "English"), value: `${randomServerWithChannel.length}`, inline: false },
                { name: await translator(`Next Bump Available in: `, "English", data.language || "English"), value: `<t:${Math.floor(nextBumpTimestamp / 1000)}:R>`, inline: false },
                { name: await translator('Server Bump Rank', "English", data.language || "English"), value: `#${serverBumpRank}`, inline: false }
            )
            .setTimestamp()

        await reply.edit({ embeds: [message3] })

    }
}
