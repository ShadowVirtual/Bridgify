const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { db } = require(`../database`)




module.exports = {
    data: new SlashCommandBuilder()
        .setName("manual-add-manager")
        .setDescription("Dev Command")
        .addStringOption(option => (
            option.setName("guildid")
                .setDescription("The ID of the guild")
                .setRequired(true)
        ))
        .addStringOption(option => (
            option.setName("userid")
                .setDescription("The ID of the user")
                .setRequired(true)
        )),

    async execute(interaction) {

        const userId = interaction.options.getString("userid")
        const GuildId = interaction.options.getString("guildid")
        const guildData = await db.collection("guild-data").findOne({ guildId: GuildId })

        // if (interaction.user.id !== interaction.guild.ownerId) {
        //     return
        // }

        if (!guildData) {
            await interaction.reply("Guild data not found.", { ephemeral: true });
            return;
        }

        if (!guildData.managers) {
            guildData.managers = [];
        }

        if (guildData.managers.includes(userId)) {
            await interaction.reply("This user is already a manager!", { ephemeral: true });
            return;
        }

        guildData.managers.push(userId);

        await db.collection("guild-data").updateOne(
            { guildId: GuildId },
            { $set: { managers: guildData.managers } },
            { upsert: true }
        );

        await interaction.reply(`Successfully added <@${userId}> as a manager in guild ID ${GuildId}!`, { ephemeral: true });
    }
}