const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ActionRow, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");
const { db } = require("../../database");
const {translator} = require('../../functions/translator')
const { getServerMemberCount } = require('../../functions/getServerMemberCount')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("list")
        .setDescription("list")
        
        .addSubcommand(option => (
            option
                .setName("guilds")
                .setDescription("List random guilds")
        ))

        .addSubcommand(option => (
            option
                .setName("blacklist")
                .setDescription("List blacklisted guilds")

        )),


    async execute(interaction) {

        const subcommand = await interaction.options.getSubcommand()

        if (subcommand == "guilds") {
        await interaction.deferReply({ ephemeral: true })
        const guildData = db.collection("guild-data")
        const guilds = await guildData.aggregate([
            { $match: {"allowPartners": true} },
            { $match: { 
                $or: [
                    { "requirement.memberRequirement": { $exists: false } }, // Field is missing
                    { "requirement.memberRequirement": null },               // Field is null
                    { "requirement.memberRequirement": 0 },                  // Field is set to 0
                    { "requirement.memberRequirement": { $lte: interaction.guild.memberCount } } // Field meets member count
                ]
            } },
            { $sample: { size: 40 } }
        ]).toArray()

        let description = '';
        for (const guild of guilds) {
            try {
            const guildObject = await interaction.client.guilds.fetch(guild.guildId)
            const guildName = guildObject.name
            const guildMemberCount = guildObject.memberCount
            const newGuildName = guildName.replace(/`/g, "")
            description += `\`${newGuildName} | ${guild.guildId}  | ${await getServerMemberCount(guild.guildId, interaction.client)} members\`\n`
            } catch(err) {
                console.log("ERROR:" + err)
            }
        }
        const embed = new EmbedBuilder()
        embed.setTitle(await translator("List of random guilds", "English", guildData.language || "English"))
        embed.setColor("Blurple")
        embed.setDescription(description)
        embed.setTimestamp()
        await interaction.editReply({ embeds: [embed] })
    }

    if (subcommand == "blacklist") {
        await interaction.deferReply({ ephemeral: true })
        const blacklistData = await db.collection('guild-data').findOne({ guildId: interaction.guild.id })

        if (!blacklistData.blacklisted || blacklistData.blacklisted.length === 0) {
            await interaction.reply("There are no blacklisted guilds!")
            return
        }

        let message = ''

        const allBlackListedGuilds = blacklistData.blacklisted
        for (const guild of allBlackListedGuilds) {
            try {
                const guildName = await interaction.client.guilds.fetch(guild)

                message += `${guildName} |  ID: ${guildName.id}  | ${await getServerMemberCount(guildName.id, interaction.client)} members\n`
            } catch (e) {
                console.log("ERROR:" + e)
                continue
            }
        }

        if (message === '') {
            await interaction.reply(await translator("There are no blacklisted guilds!", "English", blacklistData.language || "English"))
            return
        }

        const embed = new EmbedBuilder()
            .setTitle(await translator("List of blacklisted guilds", "English", blacklistData.language || "English"))
            .setDescription(message)
            .setColor("Blurple")
            .setTimestamp()

        await interaction.editReply({ embeds: [embed] })
    }
}
    
}