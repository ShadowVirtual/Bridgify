const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { db } = require(`../database`)
const {isGuildPremium} = require('../functions/isGuildPremium')
const {isGuildBlacklisted} = require('../functions/isGuildBlacklisted')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("re-add-all-guilds")
        .setDescription("add all guilds to the database"),
    /**
    @param {import("discord.js").ChatInputCommandInteraction} interaction
    */
    async execute(interaction) {
        try {
            const guild = interaction.guild

            const coll = db.collection("guild-data")
            if (coll.findOne({ guildId: guild.id })) {
                return
            }

            coll.insertOne({ guildId: guild.id })
            interaction.user.send(`Added ${guild.name} to the database.`)
        } catch (error) {
            console.log(error)
        }
}}
