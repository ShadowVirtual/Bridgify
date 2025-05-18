const { SlashCommandBuilder } = require("discord.js");
const { db } = require(`../database`)



module.exports = {
    data: new SlashCommandBuilder()
        .setName("reset-leaderboard")
        .setDescription("reset the leaderboard"),

    async execute(interaction) {

        // if (interaction.user.id != interaction.guild.ownerId) {
        //     return await interaction.reply({content: `Only the owner of the guild can use this command!`, ephemeral: true})
        // }

        await interaction.deferReply({ ephemeral: true })
        const guilds = await db.collection("guild-data").find().toArray();


        for (const guild of guilds) {
            await db.collection("guild-data").updateOne({ guildId: guild.guildId }, { $set: { "partnersSent": 0 } }, { upsert: true })
        }

        await interaction.editReply({ content: "Leaderboard has been reset", ephemeral: true })
    }
}