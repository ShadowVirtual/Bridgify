
const { SlashCommandBuilder } = require("discord.js");
const { db } = require(`../database`)


module.exports = {
    data: new SlashCommandBuilder()
        .setName("remove-premium")
        .setDescription("add a premium guild")
        .addStringOption(option => (
            option.setName("guild-id")
                .setDescription("put a guild id in here so that the bot can put it in it's database!")
                .setRequired(true)

        )),
    async execute(interaction) {
        const guildId = interaction.options.getString("guild-id");
        // if (interaction.user.id != interaction.guild.ownerId) {
        //     return await interaction.reply({content: `Only the owner of the guild can use this command!`, ephemeral: true})
        // }

        const data = db.collection('guild-data')
        data.updateOne({ guildId: guildId }, { $set: { "premium.expiryDate": 0 } }, { upsert: true })

        await interaction.reply({ content: `Successfully removed premium!`, ephemeral: true })
    }
}

