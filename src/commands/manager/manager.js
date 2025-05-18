const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { db } = require("../../database");
const {translator} = require('../../functions/translator')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("manager")
        .setDescription("manager")

        .addSubcommand(subcommand => (
            subcommand
                .setName("add")
                .setDescription("Adds a user as a trusted manager")
                .addUserOption(option => (
                    option.setName("user")
                        .setDescription("User to add as a manager")
                        .setRequired(true)
                ))
        ))

        .addSubcommand(subcommand => (
            subcommand
                .setName("remove")
                .setDescription("Removes a user as a trusted manager")
                .addUserOption(option => (
                    option.setName("user")
                        .setDescription("User to remove as a manager")
                        .setRequired(true)
                ))
        )),
    async execute(interaction) {

        const subcommand = await interaction.options.getSubcommand();

        if (subcommand == "remove") {
            const language = await db.collection("guild-data").findOne({guildId: interaction.guild.id}).language
            if (interaction.user.id == interaction.guild.ownerId) {
                const guildData = await db.collection("guild-data").findOne({guildId: interaction.guild.id})
    
                if (!guildData.managers.includes(interaction.options.getUser("user").id)) {
                    await interaction.reply(await translator("This user is not a manager!", "English", language || "English"), {ephemeral: true})
                    return
                };
                await interaction.reply(await translator(`Successfully removed <@${interaction.options.getUser("user").id}> as a manager!`, "English", language || "English"), {ephemeral: true})
                db.collection("guild-data").updateOne({guildId: interaction.guild.id}, {$pull: {"managers": interaction.options.getUser("user").id}}, {upsert: true})
    
            }
            else {
                await interaction.reply(await translator("Only the server owner can use this command!", "English", language || "English"), {ephemeral: true})
            }
        }

        if (subcommand == "add") {
            try {
                let message
                const user = interaction.options.getUser("user").id;
                const data = await db.collection('guild-data').findOne({ guildId: interaction.guild.id })
                if (interaction.user.id == interaction.guild.ownerId) {
                    if (user == interaction.user.id) {
                        message = await translator("You can't add yourself as a manager!", "English", data.language || "English")
                        await interaction.reply(message, { ephemeral: true });
                        return;
                    }
    
                    if (user == interaction.guild.ownerId) {
                        message = await translator("You can't add the server owner as a manager!", "English", data.language || "English")
                        await interaction.reply(message, { ephemeral: true });
                        return;
                    }
    
                    let guildData = await db.collection("guild-data").findOne({ guildId: interaction.guild.id });
    
                    if (!guildData) {
                        message = await translator("Guild data not found.", "English", data.language || "English")
                        await interaction.reply(message, { ephemeral: true });
                        return;
                    }
    
                    if (!guildData.managers) {
                        guildData.managers = [];
                    }
    
                    if (guildData.managers.includes(user)) {
                        message = await translator("This user is already a manager!", "English", data.language || "English")
                        await interaction.reply(message, { ephemeral: true });
                        return;
                    }
    
                    guildData.managers.push(user);
    
                    await db.collection("guild-data").updateOne(
                        { guildId: interaction.guild.id },
                        { $set: { managers: guildData.managers } },
                        { upsert: true }
                    );
    
                    message = await translator("Successfully added user as a manager!", "English", data.language || "English")
                    await interaction.reply(message, { ephemeral: true });
                } else {
                    message = await translator("Only the server owner can use this command!", "English", data.language || "English")
                    await interaction.reply(message, { ephemeral: true });
                }
            } catch (error) {
                console.error(error);
                let message
                message = await translator("An error occurred while processing your request.", "English", /*data.language || */"English")
                await interaction.reply(message, { ephemeral: true });
            }
        }
      
    }
};
