const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType} = require("discord.js");
const { db } = require("../database");
const { randomNumber } = require("../functions/randomNumberGenerator.js");
const { isToggled } = require("../functions/dmtoggled.js");
const { isGuildPremium } = require("../functions/isGuildPremium.js");
const { didUserUpvoted, didUserUpvoted2 } = require("../functions/didUserUpvoted.js");
const { translator } = require("../functions/translator.js");
const { delay } = require("../functions/delay.js");
const { randomFact } = require("../functions/randomFact.js");



module.exports = {
    data: new SlashCommandBuilder()
        .setName("pm-leaderboard")
        .setDescription("View the top 10 PMs!"),


    async execute(interaction) {
        try {
        await interaction.deferReply()
        const guildData = await db.collection("guild-data").findOne({ guildId: interaction.guildId})
        const staffs = await db.collection("guild-data").findOne({ guildId: interaction.guildId }).then(data => data.leaderboard)


        if (!guildData.leaderboard) {
            await interaction.editReply("Leaderboard not found.", { ephemeral: true });
            return;
        }
        const leaderboard = guildData.leaderboard.sort((a, b) => b.points - a.points);
        let messages = [];
        for (let i = 0; i < Math.min(leaderboard.length, 10); i++) {
            const staffMember = leaderboard[i];
            const staffMemberId = staffMember.userId;
            const rank = (i + 1).toString().padStart(3, '0')
            const points3 = staffMember.points.toString().padStart(5, ' '); 

            const translatedMessage = await translator(`\n \`${rank} - ${points3} - \`` + `<@${staffMemberId}>`, "English", guildData.language || "English");
            messages.push(translatedMessage);
        }

        const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(`Auto Reset is **${guildData.autoReset ? "Enabled" : "Disabled"}** if you want to reset the leaderboard or turn on auto reset then do \`/settings\` \n\n\` ## - Point - Username\`\n` + messages.join("\n"));

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error(`[ERROR]  >>>  Error occurred in pm-leaderboard.js:`, error);
    }
}
}