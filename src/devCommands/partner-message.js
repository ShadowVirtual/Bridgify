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
                .setTitle("Partner Bots Announcement!!")
                .setDescription(
                    "**Bridgify is proud to announce that we are now partnered with PartnerCord! Please use the buttons below to invite the bot, if you have questions click the support server."
                )
                .setFooter({ text: "Bridgify Development Team" })
                .setTimestamp()
                .setThumbnail("https://cdn.pixabay.com/animation/2023/06/13/15/12/15-12-30-808_512.gif");

                const button = new ButtonBuilder()
                .setLabel("Invite PC Now")
                .setStyle(ButtonStyle.Link)
                .setURL("https://discord.com/oauth2/authorize?client_id=1370875530282270720")

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
                            console.error(`[BRIDGIFY] >>> Error sending partner notice to guild: ${guild[1].name} (${guild[1].id})`)
                        );
                        console.log(`[BRIDGIFY] >>> Sent partner notice to ${guildOwner.user.tag} (${guildOwner.id})`);
                        sentToOwners.add(guildOwner.id);
                    }
                } catch (error) {
                    console.error(`[BRIDGIFY] >>> Error sending partner notice to guild: ${guild[1].name} (${guild[1].id})`);
                    console.error(error);
                    continue;
                }
            }

            await interaction.editReply("ONE TIME Partner notice sent to all unique guild owners!");
            sentToOwners.clear();
            console.log("[BRIDGIFY] >> Cleared set of sentToOwners");
        } catch (error) {
            console.error(error);
            await interaction.editReply("Failed to send ONE TIME partner notice.");
        }
    }
};
