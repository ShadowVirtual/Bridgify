const { SlashCommandBuilder, PermissionsBitField } = require('discord.js')
const { db } = require('../../database')
const { translator } = require('../../functions/translator')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('blacklist')

        .addSubcommand((subcommand) =>
            subcommand
                .setName('add')
                .setDescription('Blacklists a guild from doing partnerships with your server!')
                .addStringOption((option) =>
                    option
                        .setName('guild-id')
                        .setDescription("put a guild id in here so that the bot can put it in it's database!")
                )
        )

        .addSubcommand((subcommand) =>
            subcommand
                .setName('remove')
                .setDescription('Removes a guild from your server blacklist')
                .addStringOption((option) =>
                    option.setName('guild-id').setDescription('id of the guild to remove the blacklist')
                )
        ),

    async execute(interaction) {
        const subcommand = await interaction.options.getSubcommand()

        if (subcommand == 'remove') {
            const data = await db.collection('guild-data').findOne({ guildId: interaction.guild.id })
            if (
                interaction.user.id == interaction.guild.ownerId ||
                interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
            ) {
                if (!data.blacklisted.map((x) => x).includes(interaction.options.getString('guild-id'))) {
                    const embed = await errorCodes(11, interaction.guild.id)
                    await interaction.reply({ embeds: [embed] })
                    return
                } else {
                    await db
                        .collection('guild-data')
                        .updateOne(
                            { guildId: interaction.guild.id },
                            { $pull: { blacklisted: interaction.options.getString('guild-id') } },
                            { upsert: true }
                        )
                    await interaction.reply(
                        await translator(
                            'I have successfully removed this guild from the blacklist!',
                            'English',
                            data.language || 'English'
                        ),
                        { ephemeral: true }
                    )
                }
            } else {
                const embed = await errorCodes(0, interaction.guild.id)
                await interaction.reply({ embeds: [embed] })
            }
        }

        if (subcommand == 'add') {
            await interaction.deferReply({ ephemeral: true })

            const data = await db.collection('guild-data').findOne({ guildId: interaction.guild.id })

            if (
                interaction.user.id == interaction.guild.ownerId ||
                interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
            ) {
                if (data.blacklisted?.map((x) => x).includes(interaction.options.getString('guild-id'))) {
                    const message = await translator(
                        'This guild is already blacklisted',
                        'English',
                        data.language || 'English'
                    )
                    await interaction.editReply({ content: message, ephemeral: true })
                    return
                } else {
                    await db
                        .collection('guild-data')
                        .updateOne(
                            { guildId: interaction.guild.id },
                            { $push: { blacklisted: interaction.options.getString('guild-id') } },
                            { upsert: true }
                        )
                }
                let message
                message = await translator(
                    'I have successfully added this guild into the blacklist!',
                    'English',
                    data.language || 'English'
                )
                await interaction.editReply(message, { ephemeral: true })
            } else {
                await interaction.editReply(
                    await translator(
                        'Only the server owner can use this command!',
                        'English',
                        data.language || 'English'
                    ),
                    { ephemeral: true }
                )
            }
        }
    }
}
