const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js"); 
const { db } = require("../database");
const { randomNumber } = require("../functions/randomNumberGenerator.js");
const {isGuildPremium} = require("../functions/isGuildPremium.js")
const { translator } = require('../functions/translator')
const {delay} = require("../functions/delay.js");
const {randomFact} = require("../functions/randomFact.js")
const {createProgressBar} = require("../functions/progressBar.js")
const {randomAd} = require("../functions/randomAd.js");
const { validateInvite } = require("../functions/validateInvite.js");
const ms = require('ms');
const { errorCodes } = require("../functions/errorCodes.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("advertise")
        .setDescription("Advertises your server across several others!"),

    async execute(interaction) {
        try {
        await interaction.deferReply()
        const guildID = db.collection("guild-data")
        let randomServerWithChannel = await guildID.aggregate([
            { $match: { guildId: {$ne : interaction.guildId} } },
            { $match: { "advertisement_channel": { $exists: true } } },
            { $sample: { size: randomNumber(25, 20) } }
        ]).toArray();
        const data = await db.collection("guild-data").findOne({guildId: interaction.guild.id})
        const ad = await db.collection("guild-data").findOne({guildId: interaction.guild.id})
        const invite = await db.collection("guild-data").findOne({guildId: interaction.guild.id}).then(data => data.advertisement?.invite)
        
        await db.collection("guild-data").updateOne({guildId: interaction.guild.id}, {$inc: {"adNumber": 1}}, {upsert: true})
        if (!await guildID.findOne({guildId: interaction.guild.id}).then(data => data.advertisement_channel)) {
            const embed = await errorCodes(5, interaction.guild.id)
            await interaction.editReply({ embeds: [embed] })
            return
        };

        const adEmbed = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle("Advertisment")
            .setDescription(ad.advertisement.message)
            .setTimestamp();



        const fact = randomFact()
        const estimatedTime = randomServerWithChannel.length * 40 / 190; // This will give you the time in minutes
        const totalServers = randomServerWithChannel.length;
        let currentServersBumped = 0
        let reply
        let bumpProcess

        await interaction.editReply("Successfully executed command!")

        const updateProgressBar = async (currentServersBumped) => {
            const bumpProgress = createProgressBar(currentServersBumped, totalServers)
            
            bumpProcess = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle(await translator("**Advertisement Processing!** <a:DiscordLoading:1244009948883456146>", "English", data.language || "English"))
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
                    name: await translator("<:joewaiting:1223458445110280222>  **Advertisement Progress**", "English", data.language || "English"),
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
                .setEmoji('🔗'),
            )

            if (!reply) {
                reply = await interaction.channel.send({embeds: [bumpProcess], components: [row]});
            }
            else {
                await reply.edit({embeds: [bumpProcess], components: [row]});
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

            const serverBumpRank = await db.collection("guild-data")
            .find()
            .sort({ adNumber: -1 })
            .toArray()
            .then(guilds => {
            const rank = guilds.findIndex(g => g.guildId === interaction.guild.id) + 1;
            return rank; 
            });     

            const bumpMessage = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle(await translator("Advertisement Successful!", "English", data.language || "English"))
            .setDescription(await translator(`Your guild has been advertised ${await db.collection("guild-data").findOne({guildId: interaction.guild.id}).then(data => data.adNumber)} times!`, "English", data.language || "English"))
            .addFields(
                { name: await translator('Estimated Time for Completion', "English", data.language || "English"), value: `${Math.round(estimatedTime)} minutes`, inline: false },
                { name: await translator('Servers Reached', "English", data.language || "English"), value: `${randomServerWithChannel.length}`, inline: false },
                { name: await translator('Next Advertisement is Available In', "English", data.language || "English"), value: `1 hour and 30 minutes`, inline: false },
                { name: await translator('Server Advertising Rank', "English", data.language || "English"), value: `#${serverBumpRank}`, inline: false }
            )
            .setTimestamp();

        for (const channel of randomServerWithChannel) {
            try {
                const id2 = interaction.guild.id
                var usersadvertisingChannel = await db.collection("guild-data").findOne({ guildId: interaction.guild.id });

                if (channel === usersadvertisingChannel.advertisement_channel) {
                    continue;
                }

                if (channel && channel.advertisement_channel) {
                    try {
                    const shards = await interaction.client.guilds.fetch(channel.guildId).then(guild => guild.shardId);
                    interaction.client.shard.broadcastEval(async (client, { adChannelId, adEmbed, id2, invite }) => {
                        const path = require('path');
                        const validationPath = path.resolve(__dirname, '../../../../src/functions/validateInvite');
                        const { validateInvite } = require(validationPath);

                            var guildChannel = await client.channels.fetch(adChannelId);

                            await guildChannel.send({ embeds: [adEmbed] });
                            await guildChannel.send({
                                content: `${await validateInvite(client, invite, id2)}`
                            });
                        
                    }, {
                        shard: shards,
                        context: {
                            adChannelId: channel.advertisement_channel, 
                            adEmbed,
                            id2,
                            invite: data.advertisement.invite
                        }
                    })
                } catch (error) {
                    console.error(`[ERROR] Failed to handle channel: ${channel?.advertisement_channel}`, error);
                    continue;
                }

                    await delay(20000);
                } else {
                    console.error('Skipping undefined or missing channel:');
                }
            } catch (error) {
                console.error(`[ERROR] Failed to handle channel: ${channel?.advertisement_channel}`, error);
                continue;
            }
        }
        await reply.edit({ embeds: [bumpMessage] });

    } catch (error) {
        console.log("[ERROR]" + error)
    }}


}
