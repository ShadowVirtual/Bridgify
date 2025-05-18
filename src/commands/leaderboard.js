const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { db } = require("../database");
const { translator } = require("../functions/translator");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Shows the top 10 partners"),

    async execute(interaction) {
        await interaction.deferReply()
        const guildData = await db.collection("guild-data").findOne({ guildId: interaction.guildId });
        const leaderboardRaw = await db.collection("guild-data").find().sort({partnersSent: -1}).toArray();

        let leaderboardMessage = "Top 10 Partners:\n";
        for (let i = 0; i < Math.min(10, leaderboardRaw.length); i++) {
            let guildName = interaction.client.guilds.cache.get(leaderboardRaw[i].guildId)?.name || "Unknown Guild";
            // Remove markdown link syntax from the guild name
            guildName = guildName.replace(/(\*|_|`|~|\\|\||>|#|\[|\]|:|@|&|\/|\{|\}|<|-|\+|=)/g, "");
            leaderboardMessage += `${i+1}. ${guildName}, Partners: ${leaderboardRaw[i].partnersSent || 0}\n`;

            var embed = new EmbedBuilder()
                .setTitle(await translator("Top 10 Servers", "English", guildData.language || "English"))
                .setDescription(leaderboardMessage)
                .setColor("Yellow");
        }
        await interaction.editReply({ embeds: [embed] });
    }
}
