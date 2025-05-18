const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { db } = require(`../database`)



module.exports = {
    data: new SlashCommandBuilder()
        .setName("add-banned")
        .setDescription("global bans a guild from using the bot")
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


        const data = db.collection('guild-data')
        const data2 = db.collection("ban-guilds")
        data.updateOne({ guildId: guildId }, { $set: { "banned": true } }, { upsert: true })
        data2.updateOne({ guildId: guildId }, { $set: { "banned": true } }, { upsert: true })
        await interaction.reply({ content: `Successfully added banned!`, ephemeral: true })

        const guildToLeave = client.guilds.cache.get(interaction.options.getString("guild-id"));

        if (guildToLeave) guildToLeave.leave();
    }
}