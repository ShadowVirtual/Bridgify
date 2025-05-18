
const { SlashCommandBuilder } = require("discord.js");
const { db } = require(`../database`)


module.exports = {
    data: new SlashCommandBuilder()
        .setName("add-premium")
        .setDescription("add a premium guild")
        .addStringOption(option => (
            option.setName("guild-id")
                .setDescription("put a guild id in here so that the bot can put it in it's database!")
                .setRequired(true)

        ))
        .addStringOption(option => (
            option.setName("duration")
                .setDescription("Duration of the premium")
                .addChoices(
                    { name: "Day", value: "Day" },
                    { name: "Month", value: "Month" },
                    { name: "Year", value: "Year" },
                    { name: "Permanent", value: "Permanent" }
                )
        )),

    async execute(interaction) {
        // if (interaction.user.id != interaction.guild.ownerId) {
        //     return await interaction.reply({content: `Only the owner of the guild can use this command!`, ephemeral: true})
        // }
        const choice = interaction.options.getString("duration")
        const guild = interaction.options.getString("guild-id")
        const data = db.collection('guild-data')

        if (choice == "Day") {
            const expiryDate = Date.now() + (1000 * 60 * 60 * 24)
            data.updateOne({ guildId: guild }, { $set: { "premium.expiryDate": expiryDate } }, { upsert: true })
            await interaction.reply({ content: `Successfully added premium for 1 day!`, ephemeral: true })
            return
        }
        if (choice == "Month") {
            const expiryDate = Date.now() + (1000 * 60 * 60 * 24 * 30)
            data.updateOne({ guildId: guild }, { $set: { "premium.expiryDate": expiryDate } }, { upsert: true })
            await interaction.reply({ content: `Successfully added premium for 1 month!`, ephemeral: true })
            return
        }

        if (choice == "Year") {
            const expiryDate = Date.now() + (1000 * 60 * 60 * 24 * 365)
            data.updateOne({ guildId: guild }, { $set: { "premium.expiryDate": expiryDate } }, { upsert: true })
            await interaction.reply({ content: `Successfully added premium for 1 year!`, ephemeral: true })
            return
        }
        if (choice == "Permanent") {
            const expiryDate = Date.now() + (1000 * 60 * 60 * 24 * 365 * 100)
            data.updateOne({ guildId: guild }, { $set: { "premium.expiryDate": expiryDate } }, { upsert: true })
            await interaction.reply({ content: `Successfully added premium for a lifetime!`, ephemeral: true })
            return
        }
    }

}