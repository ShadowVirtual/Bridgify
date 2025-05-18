const { SlashCommandBuilder } = require("discord.js");
const { db } = require(`../database`)



module.exports = {
    data: new SlashCommandBuilder()
        .setName("premium-code")
        .setDescription("generates a random premium code")
        .addStringOption(option => (
            option.setName("duration")
                .setDescription("Duration of the premium code")

                .addChoices(
                    { name: "Day", value: "Day" },
                    { name: "Week", value: "Week" },
                    { name: "Month", value: "Month" },
                    { name: "Year", value: "Year" },
                    { name: "Permanent", value: "Permanent" }

                )
                .setRequired(true)

        )
    )

    .addStringOption(option => (
        option.setName("type")
            .setDescription("Type of the premium code")

            .addChoices(
                { name: "Premium", value: "Server" },
                { name: "Premium+", value: "User" }
            )
            .setRequired(true)
    )),


    async execute(interaction) {
        // if (interaction.user.id != interaction.guild.ownerId) {
        //     return await interaction.reply({content: `Only the owner of the guild can use this command!`, ephemeral: true})
        // }
        const choice = interaction.options.getString("duration")
        const type = interaction.options.getString("type")


        if (choice == "Day") {
            const randomLetterCode = Math.random().toString(36).slice(-8)
            const code = randomLetterCode
            const expiryDate = Date.now() + (1000 * 60 * 60 * 24)

            const data = db.collection('codes')
            data.insertOne({ code: code, expiryDate: expiryDate, redeemed: false, duration: "Day", type: type })
            await interaction.reply({ content: `Premium code: ${code}`, ephemeral: true })
            return
        }
        if (choice == "Week") {
            const randomLetterCode = Math.random().toString(36).slice(-8)
            const code = randomLetterCode
            const expiryDate = Date.now() + (1000 * 60 * 60 * 24)

            const data = db.collection('codes')
            data.insertOne({ code: code, expiryDate: expiryDate, redeemed: false, duration: "Week", type: type })
            await interaction.reply({ content: `Premium code: ${code}`, ephemeral: true })
            return
        }
        if (choice == "Month") {
            const randomLetterCode = Math.random().toString(36).slice(-8)
            const code = randomLetterCode
            const expiryDate = Date.now() + (1000 * 60 * 60 * 24)

            const data = db.collection('codes')
            data.insertOne({ code: code, expiryDate: expiryDate, redeemed: false, duration: "Month", type: type })
            await interaction.reply({ content: `Premium code: ${code}`, ephemeral: true })
            return
        }
        if (choice == "Year") {
            const randomLetterCode = Math.random().toString(36).slice(-8)
            const code = randomLetterCode
            const expiryDate = Date.now() + (1000 * 60 * 60 * 24)

            const data = db.collection('codes')
            data.insertOne({ code: code, expiryDate: expiryDate, redeemed: false, duration: "Year", type: type })
            await interaction.reply({ content: `Premium code: ${code}`, ephemeral: true })
            return
        }
        if (choice == "Permanent") {
            const randomLetterCodeWithNumbers = Math.random().toString(36).slice(-8)
            const code = randomLetterCodeWithNumbers
            const expiryDate = Date.now() + (1000 * 60 * 60 * 24)

            const data = db.collection('codes')
            data.insertOne({ code: code, expiryDate: expiryDate, redeemed: false, duration: "Permanent", type: type })
            await interaction.reply({ content: `Premium code: ${code}`, ephemeral: true })
            return
        }

    }
}
