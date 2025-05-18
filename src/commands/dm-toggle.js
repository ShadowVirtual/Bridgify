const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { db } = require('../database');
const { translator } = require('../functions/translator')
module.exports = {
    data: new SlashCommandBuilder()
        .setName("dm-toggle")
        .setDescription("Toggle DMs from bridgify")
        .addBooleanOption(option =>
            option.setName("enabled")
                .setDescription("Toggle DMs")
        ),
    async execute(interaction) {
        const enabled = interaction.options.getBoolean("enabled");
        const guild = interaction.guild;

        const guildData = await db.collection('guild-data').findOne({ guildId: guild.id });

        if (enabled === true && (!guildData || guildData.allowDms === false)) {
            await db.collection('guild-data').updateOne({ guildId: guild.id }, { $set: { 'allowDms': true } }, { upsert: true });
            const embed = new EmbedBuilder()
                .setColor("Green")
                .setDescription(await translator("DMs from Bridgify are now enabled", "English", guildData.language || "English"))
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (enabled === false && (!guildData || guildData.allowDms === true)) {
            await db.collection('guild-data').updateOne({ guildId: guild.id }, { $set: { 'allowDms': false } }, { upsert: true });
            const embed = new EmbedBuilder()
                .setColor("Green")
                .setDescription(await translator("DMs from Bridgify are now disabled", "English", guildData.language || "English"))
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            const embed = new EmbedBuilder()
                .setColor("Yellow")
                .setDescription(await translator(`DMs from Bridgify are already \`${enabled ? 'enabled' : 'disabled'}\``, "English", guildData.language || "English"))
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
