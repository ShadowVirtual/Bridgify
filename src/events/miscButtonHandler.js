const {
    Events,
  } = require('discord.js');
  const { db } = require('../database')


module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isButton()) {

            const { customId } = interaction;

            

            if (customId === 'disable-tips') {
                await db.collection('guild-data').updateOne({ guildId: interaction.guild.id }, { $set: { messageTipsEnabaled: false } });
                await interaction.reply({ content: 'Random tips are now disabled', ephemeral: true });
            }

            if (customId === 'disable-reminder') {
                await db.collection('guild-data').updateOne({ guildId: interaction.guild.id }, { $set: { cooldownReminderEnabled: false } });
                await interaction.reply({ content: 'You will no longer be reminded to use a command', ephemeral: true });
            }
        }
    }
}