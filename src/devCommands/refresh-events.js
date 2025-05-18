const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require('fs');
const path = require('path');


const token = process.env.botToken;
const clientId = process.env.CLIENT_ID;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("refresh-events")
        .setDescription("Globally Refresh events"),

    async execute(interaction) {

        // if (interaction.user.id !== interaction.guild.ownerId) {
        //     await interaction.reply({ content: "Only the server owner can use this command!", ephemeral: true });
        //     return;
        // } 
        try {
            const eventsPath = path.join(__dirname, "../events");
            const eventFiles = fs
                .readdirSync(eventsPath)
                .filter((file) => file.endsWith(".js"));

            for (const file of eventFiles) {
                const filePath = path.join(eventsPath, file);
                const event = require(filePath);
                if (event.once) {
                    interaction.client.once(event.name, (...args) => event.execute(...args, interaction.client));
                } else {
                    interaction.client.on(event.name, (...args) => event.execute(...args, interaction.client));
                }

                await interaction.reply("Events refreshed.", { ephemeral: true });
                return;
            }
        } catch (error) {
            console.error(`[ERROR]  >>>  Error occurred in refresh-events.js:`, error);
            await interaction.reply("An error occurred while trying to refresh events.", { ephemeral: true });
        }

    }

}