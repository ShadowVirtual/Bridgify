const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { db } = require(`../database`)
const { isGuildPremium } = require('../functions/isGuildPremium');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("dev-settings")
        .setDescription("dev settings menu"),

    async execute(interaction) {
        const trustedManagers = db.collection("dev-settings").findOne({ trustedManagers: interaction.user.id })


        // if (trustedManagers.includes(interaction.user.id) || interaction.guild.ownerId == interaction.user.id) {

        //     // const select = new StringSelectMenuBuilder()
        //     //     .setCustomId("dev-settings")
        //     //     .setPlaceholder("Nothing selected")
        //     //     .addOptions([
        //     //         {
        //     //             label: ""
        //     //         }

        // }
    }
}