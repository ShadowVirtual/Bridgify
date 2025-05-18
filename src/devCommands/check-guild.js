const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { db } = require(`../database`)
const { isGuildPremium } = require('../functions/isGuildPremium')
const { isGuildBlacklisted } = require('../functions/isGuildBlacklisted')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('check-guild')
    .setDescription('check if a guild is blacklisted')
    .addStringOption((option) =>
      option
        .setName('guild-id')
        .setDescription("put a guild id in here so that the bot can put it in it's database!")
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      await interaction.deferReply() // Defer the reply

      const guildId = interaction.options.getString('guild-id')
      const guildData = await db.collection('guild-data').findOne({ guildId: guildId })
      const guild = await interaction.client.guilds.fetch(guildId)
      const channelsArray = Array.from(guild.channels.cache.values())
      const randomChannel = channelsArray[Math.floor(Math.random() * channelsArray.length)]
      var discordInvite = await randomChannel.createInvite()
      const date = new Date(guild.createdAt)
      const embed = new EmbedBuilder()

        .setTitle('Guild Info')
        .setFields(
          {
            name: 'Guild ID:',
            value: `${guildId}`
          },
          {
            name: 'Guild Name:',
            value: `${guild.name}`
          },
          {
            name: 'Member Count:',
            value: `${guild.memberCount}`
          },
          {
            name: 'Advertising Channel:',
            value: `${guildData?.advertisement_channel ? 0 : 0}`
          },
          {
            name: 'Partner Accepted:',
            value: `${guildData?.partnersAccepted ? 0 : 0}`
          },

          {
            name: 'Managers:',
            value: `${guildData.managers?.length || 0}`
          },
          {
            name: 'Owner:',
            value: `${guild.ownerId}`
          },
          {
            name: 'Premium:',
            value: `${(await isGuildPremium(guildId)).valueOf() ? 'Yes' : 'No'}`
          },
          {
            name: 'Banned:',
            value: `${(await isGuildBlacklisted(guildId)).valueOf() ? 'Yes' : 'No'}`
          },
          {
            name: 'Creation Date:',
            value: `${date.toUTCString()}`
          },
          {
            name: 'Discord Invite',
            value: `https://discord.gg/${discordInvite.code}`
          }
        )
        .setColor('Blurple')
        .setTimestamp()

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      console.log(error)
    }
  }
}
