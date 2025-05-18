const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("special-message")
        .setDescription("Sends an important message about the database wipe."),

    async execute(interaction) {
        try {
            await interaction.deferReply();
            const guilds = interaction.client.guilds.cache;
            const sentToOwners = new Set();
            
            const embed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("🚨 Urgent: Database Reset – Action Required! 🚨")
                .setDescription(
                    "**Bridgify's database has been wiped, meaning all stored data, including partnerships, settings, and configurations, have been lost.**\n\n" +
                    "To continue using Bridgify, you **must** set it up again by running `/setup`. This will restore your partnership system and ensure everything runs smoothly.\n\n" +
                    "We apologize for the inconvenience and appreciate your patience!\n" +
                    "If you had premium prior, please join the support server and open a ticket to reclaim a new code. Proof of purchase required." +
                    "As an apology for the inconvenience, we are offering a free month of premium for ONE server to each user who was affected." +
                    "To claim the premium, please join the support server and create a ticket. Ping either of the Core Team members and we will issue the code"
                )
                .setFooter({ text: "Bridgify Development Team" })
                .setTimestamp()
                .setThumbnail("https://cdn.pixabay.com/animation/2023/06/13/15/12/15-12-30-808_512.gif");

            const button = new ButtonBuilder()
                .setLabel("Setup Now")
                .setStyle(ButtonStyle.Primary)
                .setCustomId("setup_command");

            const supportButton = new ButtonBuilder()
                .setLabel("Support Server")
                .setEmoji("📚")
                .setStyle(ButtonStyle.Link)
                .setURL("https://discord.gg/cWSAvcmxPN");

            const row = new ActionRowBuilder().addComponents(button, supportButton);

            for (const guild of guilds) {
                try {
                    const guildOwner = await guild[1].fetchOwner();
                    if (!sentToOwners.has(guildOwner.id)) {
                        await guildOwner.send({ embeds: [embed], components: [row] }).catch(error =>
                            console.error(`[BRIDGIFY] >>> Error sending DB wipe notice to guild: ${guild[1].name} (${guild[1].id})`)
                        );
                        console.log(`[BRIDGIFY] >>> Sent DB wipe notice to ${guildOwner.user.tag} (${guildOwner.id})`);
                        sentToOwners.add(guildOwner.id);
                    }
                } catch (error) {
                    console.error(`[BRIDGIFY] >>> Error sending DB wipe notice to guild: ${guild[1].name} (${guild[1].id})`);
                    console.error(error);
                    continue;
                }
            }

            await interaction.editReply("Database wipe notices sent to all unique guild owners!");
            sentToOwners.clear();
            console.log("[BRIDGIFY] >> Cleared set of sentToOwners");
        } catch (error) {
            console.error(error);
            await interaction.editReply("Failed to send database wipe notices.");
        }
    }
};
