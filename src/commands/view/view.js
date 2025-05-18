const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { db } = require("../../database");
const {translator} = require('../../functions/translator')
module.exports = {
    data: new SlashCommandBuilder()
        .setName("view")
        .setDescription("View")

        .addSubcommand(option =>
            option
                .setName("guild-ad")
                .setDescription("View your Guild's Ad!")
                .addStringOption(option =>
                    option
                        .setName("guild-id")
                        .setDescription("Insert the ID for the guild's ad you want to see.")
                        .setRequired(false)
                )
        ),

    async execute(interaction) {

        const subcommand = await interaction.options.getSubcommand();

        if (subcommand == "guild-ad") {

        
        try {
            const guildId = interaction.options.getString("guild-id") || interaction.guild.id;
            const data = await db.collection("guild-data").findOne({ guildId: guildId });
            

            if (!data || !data.advertisement || !data.advertisement.message) {
                return await interaction.reply(await translator(`This guild has no advertisement set, please run \`/set-advertisement\``, "English", data.language || "English"));
            }

            const embed = new EmbedBuilder()
                .setColor("Yellow")
                .setTitle(`Advert:`)
                .setDescription(`${data.advertisement.message}`);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error(`[ERROR]  >>>  Error occurred in view-guild-ad.js:`, error);
            await interaction.reply(await translator("An error occurred while trying to view the guild's ad.", "English", data.language || "English"), { ephemeral: true });
        }
    }
    }
};
