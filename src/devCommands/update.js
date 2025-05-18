const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle } = require('discord.js');
const { exec, execSync } = require('child_process');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('update')
    .setDescription('Pull the latest code from GitHub'),

  async execute(interaction) {
    try {
      const gitChanges = await new Promise((resolve, reject) => {
        exec("git fetch origin && git log --oneline --graph --decorate main..origin/main", (err, stdout, stderr) => {
          if (err) {
            console.log(`Error: ${stderr}`);
            reject(err);
          } else {
            resolve(stdout);
          }
        });
      });

      await interaction.reply({
        content: "```" + (gitChanges.trim() || "No changes found on main") + "```",
        components: [
          new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setLabel('Update')
                .setCustomId('update')
                .setEmoji("🔄")
                .setStyle(ButtonStyle.Primary)
            ),
        ],
      });

      const filter = i => i.customId === 'update' && i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.Button, filter, time: 15000 });

      collector.on('collect', async i => {
        if (i.customId === 'update') {
          try {
            const update = execSync('git pull origin main', { encoding: 'utf-8' }); // Ensure output is a string
            await i.update({
              content: "```" + update.trim() + "```",
              components: [],
            });
          } catch (err) {
            console.error(`Error pulling updates: ${err}`);
            await i.update({
              content: "Failed to pull updates.",
              components: [],
            });
          }
        }
      });

      collector.on('end', async (collected) => {
        if (collected.size === 0) {
          try {
            await interaction.editReply({
              components: [],
            });
          } catch (editError) {
            console.error("Error editing reply during collector end:", editError);
          }
        }
      });
    } catch (error) {
      console.error(`Failed to execute command: ${error}`);
      await interaction.reply({ content: 'An error occurred while fetching updates. Please check the logs for details.' });
    }
  },
};