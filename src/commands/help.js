const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder().setName('help').setDescription('Shows the help menu + command descriptions'),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const row1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel('Setup').setEmoji('📝').setStyle(ButtonStyle.Primary).setCustomId('setupButton'),
                new ButtonBuilder().setLabel('Partner').setEmoji('🤝').setStyle(ButtonStyle.Primary).setCustomId('partnerButton'),
                new ButtonBuilder().setLabel('Premium').setEmoji('💎').setStyle(ButtonStyle.Success).setCustomId('premiumButton'),
                new ButtonBuilder().setLabel('Misc').setEmoji('📊').setStyle(ButtonStyle.Secondary).setCustomId('miscButton'),
                new ButtonBuilder().setLabel('Support Server').setEmoji('📚').setStyle(ButtonStyle.Link).setURL('https://discord.gg/cWSAvcmxPN')
            );

            const helpEmbed = new EmbedBuilder()
                .setColor('Orange')
                .setTitle('Bridgify Help')
                .setDescription("**Here's the help menu for Bridgify!**\nPlease select a button below based on the category you need help with.")
                .setFooter({ text: 'Bridgify Partner Bot', iconURL: process.env.ICON_URL })
                .setThumbnail(process.env.ICON_URL)
                .setTimestamp();

            // Send the message and store it
            const sentMessage = await interaction.editReply({ embeds: [helpEmbed], components: [row1] });

            // Collector for button interactions
            const collector = sentMessage.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id,
                time: 300000 // 5 minutes
            });

            collector.on('collect', async (i) => {
                let selectedEmbed;
                switch (i.customId) {
                    case 'setupButton':
                        selectedEmbed = new EmbedBuilder()
                            .setColor('Yellow')
                            .setTitle('Setup Help')
                            .setDescription("> **Setup Commands**\n\n**__/setup__** - Setup Bridgify\n**__/setup-bump__** - Setup your server's bump ad\n**__/settings__** - Configure Bridgify's settings");
                        break;
                    case 'partnerButton':
                        selectedEmbed = new EmbedBuilder()
                            .setColor('Yellow')
                            .setTitle('Partner Help')
                            .setDescription("> **Partner Commands**\n\n**__/partner__** - Choose a guild to partner with\n**__/re-partner__** - Re-partner with a guild\n **__/partner-category__** - Partner with a specific category\n**__/p4p__** - Partner with pings\n **__/direct-partner__** - Partner with a specific server");
                        break;
                    case 'premiumButton':
                        selectedEmbed = new EmbedBuilder()
                            .setColor('Yellow')
                            .setTitle('Premium Help')
                            .setDescription("> **Premium Commands**\n\n**__/mass__** - Send a partner request to all servers\n**__/partner-category__** - Partner with a specific category");
                        break;
                    case 'miscButton':
                        selectedEmbed = new EmbedBuilder()
                            .setColor('Yellow')
                            .setTitle('Misc Commands')
                            .setDescription("> **Misc Commands**\n\n**__/add-blacklist__** - Blacklist a server\n**__/stats__** - Show server statistics\n **__/remove-blacklist__** - Remove a server from your blacklist");
                        break;
                    default:
                        return;
                }

                const updatedRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setLabel('Home').setEmoji('🏠').setStyle(ButtonStyle.Secondary).setCustomId('homeButton')
                );

                await i.update({ embeds: [selectedEmbed], components: [updatedRow] });

                // Separate collector for home button to avoid multiple listeners
                const homeCollector = sentMessage.createMessageComponentCollector({
                    filter: (homeInteraction) => homeInteraction.customId === 'homeButton' && homeInteraction.user.id === interaction.user.id,
                    time: 300000
                });

                homeCollector.on('collect', async (homeInteraction) => {
                    await homeInteraction.update({ embeds: [helpEmbed], components: [row1] });
                    homeCollector.stop();
                });

                homeCollector.on('end', async () => {
                    try {
                        await sentMessage.edit({ components: [] }); // Disable buttons after time expires
                    } catch (error) {
                        console.log('Error removing buttons after homeCollector ended:', error);
                    }
                });
            });

            collector.on('end', async () => {
                try {
                    await sentMessage.edit({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Orange')
                                .setTitle('Help Menu Expired')
                                .setDescription('The help menu has expired. Please re-run `/help` if you need assistance.')
                                .setFooter({ text: 'Bridgify Partner Bot', iconURL: process.env.ICON_URL })
                                .setTimestamp()
                        ],
                        components: []
                    });
                } catch (error) {
                    console.log('Error updating the help menu after expiration:', error);
                }
            });

        } catch (error) {
            console.log(error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'Something went wrong while displaying the help menu. Please try again later.',
                    ephemeral: true
                });
            } else {
                await interaction.editReply({
                    content: 'Something went wrong while displaying the help menu. Please try again later.',
                    embeds: [],
                    ephemeral: true
                });
            }
        }
    }
};
