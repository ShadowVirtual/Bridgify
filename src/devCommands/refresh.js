const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const fs = require('fs')
const path = require('path')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v10')

const token = process.env.botToken
const clientId = process.env.CLIENT_ID

module.exports = {
  data: new SlashCommandBuilder()
    .setName('refresh')
    .setDescription('Globally Refresh Commands')
    .addBooleanOption((option) => option.setName('dev').setDescription('Refresh Dev Commands').setRequired(false)),

  async execute(interaction) {
    try {
      const initialEmbed = new EmbedBuilder().setColor('Yellow').setDescription(`Started Refreshing Commands...`)

      const sentMessage = await interaction.reply({ embeds: [initialEmbed] })

      const commands = []
      const devCommands = []
      const supportServer = '1197312375301345280'

      function getFiles(dir, arr) {
        const files = fs.readdirSync(dir)
        for (const file of files) {
          const filePath = path.join(dir, file)
          const stat = fs.statSync(filePath)
          if (stat.isDirectory()) {
            getFiles(filePath, arr)
          } else if (file.endsWith('.js')) {
            arr.push(filePath)
          }
        }
      }

      getFiles(path.join(__dirname, '..', 'commands'), commands) // Corrected variable name here
      getFiles(path.join(__dirname, '..', 'devCommands'), devCommands) // Corrected variable name here

      for (const file of devCommands) {
        // Construct the full path to the dev command file
        try {
          const guildCommands = require(file.replace(__dirname, "./"))
          if (guildCommands.data) {
            devCommands.push(guildCommands.data.toJSON())
          }
        } catch (error) {
          console.error(`[DISCORD] >>> Error loading dev command ${file}: ${error}`)
          // Handle the error appropriately, e.g., skip the command or notify the user
        }
      }

      for (const file of commands) {
        // Construct the full path to the command file
        try {
          console.log(file)
          const command = require(file.replace(__dirname, './'))
          if (command.data) {
            commands.push(command.data.toJSON())
          }
        } catch (error) {
          console.error(`[DISCORD] >>> Error loading command ${file}: ${error}`)
          // Handle the error appropriately
        }
      }

      const rest = new REST({ version: '10' }).setToken(token)
      const ManualRefresh = async () => {
        try {
          console.log(`[DISCORD] >>> Started refreshing ${commands.length} application (/) commands...`)
          await rest.put(Routes.applicationCommands(clientId), { body: commands })

          if (interaction.options.getBoolean('dev')) {
            await rest.put(Routes.applicationGuildCommands(clientId, supportServer), {
              body: [...commands, ...devCommands]
            })
          }
        } catch (error) {
          console.error(`[DISCORD] >>> Error refreshing commands: ${error}`)
          throw error
        }
      }

      await ManualRefresh()
        .then(async () => {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor('Green')
                .setDescription(`Successfully Refreshed ${commands.length} application (/) Commands..`)
            ]
          })
        })
        .catch((error) => {
          interaction.editReply({
            embeds: [new EmbedBuilder().setColor('Red').setDescription(`Error refreshing commands: ${error}`)] // Changed color to red for errors
          })
        })
    } catch (error) {
      await interaction.editReply({ content: 'An error occurred while refreshing commands.', ephemeral: true })
      console.error(error)
    }
  }
}
