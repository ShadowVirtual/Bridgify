const { SlashCommandBuilder, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder} = require("discord.js"); 
const { db } = require('../database')
const {isGuildPremium} = require('../functions/isGuildPremium')
const {isGuildBlacklisted} = require('../functions/isGuildBlacklisted')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('View your stats of your guild'),

    async execute(interaction) {
        const guildData = await db.collection("guild-data").findOne({guildId: interaction.guild.id})
        const blacklist = await db.collection("blacklist").findOne({blacklister: interaction.guild.id})
        const date = new Date(interaction.guild.createdAt)
        const guildOwner = interaction.guild.ownerId;
        
        const embed = new EmbedBuilder()
            .setTitle(`Stats of ${interaction.guild.name}`)
            .addFields(
            {
                name: "<:Partner:1199438465461403668> Partners Accepted:",
                value: `${guildData?.partnersAccepted || 0}`
            },
            {
                name: "<:Owner:1199385117211234365> Owner:",
                value: `<@${guildOwner}>`
            },
            {
                name: "<:bans:1199384754026455060> Blacklisted:",
                value: `${guildData && guildData.blacklisted ? guildData.blacklisted.length : 0}`
                
            },
            {
                name: "<:bans:1199384754026455060> Banned:",
                value: `${await isGuildBlacklisted(interaction.guild.id) ? "Yes" : "No"}`
            },
            {
                name: "<:Shield:1199384782258327652> Managers:",
                value: `${guildData && guildData.managers ? guildData.managers.map(element => { 
                    return `<@${element}>` 
                }).join(", ") : "No managers found"}`
            
            },

            {
                name: "<:Calendar:1199385000525692978> Server Creation Date:",
                value: `${date.toDateString()}`
            },
            {
                name: "<:verified:1199384890865635338> Premium?",
                value: `${(await isGuildPremium(interaction.guildId)).valueOf() ? "Yes" : "No"}`
            }
            )
            .setTimestamp()
            .setColor("Blurple")
            
        await interaction.reply({embeds: [embed]})
    }
}
