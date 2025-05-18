const { SlashCommandBuilder } = require("discord.js");
const { db } = require(`../database`)



module.exports = {
    data: new SlashCommandBuilder()
        .setName("remove-banned")
        .setDescription("remove a banned guild")
        .addStringOption(option => (
            option.setName("guild-id")
                .setDescription("put a guild id in here so that the bot can put it in it's database!")
                .setRequired(true)
        )),

    async execute(interaction) {
        // if (interaction.user.id != interaction.guild.ownerId) {
        //     return await interaction.reply({content: `Only the owner of the guild can use this command!`, ephemeral: true})
        // }
        const guildId = interaction.options.getString('guild-id');
        const data2 = db.collection("ban-guilds")

        const data = db.collection('guild-data')
        data.updateOne({ guildId: guildId }, { $set: { "banned": false } }, { upsert: true })
        data2.updateOne({ guildId: guildId }, { $set: { "banned": false } }, { upsert: true })

        await interaction.reply({ content: `Successfully removed banned!`, ephemeral: true })

    }
}