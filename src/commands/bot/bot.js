const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const os = require('node:os')
require('dotenv').config()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('bot')
        .addSubcommand((subcommand) => subcommand.setName('info').setDescription('Shows bot information'))
        .addSubcommand((subcommand) => subcommand.setName('vote').setDescription('Vote for the bot')),

    async execute(interaction) {
        const subcommand = await interaction.options.getSubcommand()

        if (subcommand === 'info') {
            async function getAllServer() {
               // Check if sharding is enabled
                if (interaction.client.shard) {
                    // Bot is running in sharded mode
                    const shardGuildCounts = await interaction.client.shard.broadcastEval(
                        (client) => client.guilds.cache.size
                    );
                    return shardGuildCounts.reduce((total, count) => total + count, 0);
                } else {
                    // Bot is running in non-sharded mode
                    return interaction.client.guilds.cache.size;
                }
            }

            const totalGuildCount = await getAllServer()

            // Function to format uptime into hours, minutes, and seconds
            function formatUptime(uptime) {
                const totalSeconds = Math.floor(uptime)
                const hours = Math.floor(totalSeconds / 3600)
                const minutes = Math.floor((totalSeconds % 3600) / 60)
                const seconds = totalSeconds % 60

                return `${hours}h ${minutes}m ${seconds}s`
            }

            const embed = new EmbedBuilder()
                .setTitle('Bot Information')
                .setColor('Blurple')
                .setFields(
                    { name: 'Name', value: 'Bridgify', inline: true },
                    { name: 'Version', value: process.env.VERSION, inline: true },
                    { name: 'Creators', value: 'StevieJobs and Zakleby', inline: true },
                    { name: 'Servers', value: `${totalGuildCount}`, inline: true },
                    // Uncomment the line below to calculate total users (if desired)
                    {
                        name: 'Users',
                        value: `${interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}`,
                        inline: true
                    },
                    { name: 'Bot Latency', value: `${interaction.client.ws.ping}ms`, inline: true },
                    { name: 'API Latency', value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true },
                    {
                        name: 'Developers',
                        value: 'Scarlet, ShadyMoon, sealeopard',
                        inline: true
                    },
                    {
                        name: 'Memory Usage',
                        value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
                        inline: true
                    },
                    {
                        name: 'CPU Usage',
                        value: `${(process.cpuUsage().system / 1024 / 1024).toFixed(2)} %`,
                        inline: true
                    },
                    { name: 'Uptime', value: formatUptime(process.uptime()), inline: true }, // Use the formatted uptime
                    { name: 'Discord.js Version', value: `${require('discord.js').version}`, inline: true },
                    { name: 'Node.js Version', value: `${process.version}`, inline: true },
                    { name: 'Platform', value: `${process.platform} ${process.arch}`, inline: true },
                    { name: 'Responding from', value: `Shard ${interaction.guild.shardId} on ${os.hostname()}!`, inline: true }
                )
                .setFooter({ text: 'Bridgify EST. 2024.' })
                .setImage(
                    'https://cdn.discordapp.com/attachments/1197314348381638796/1290683274972106884/Untitled.png?ex=67014e78&is=66fffcf8&hm=2d8ff6bb4299d1e7a378879923ac0db0ccfe31e185d4ba141c60f273a6d29f85&'
                )
                .setThumbnail(
                    'https://cdn.discordapp.com/attachments/1197315922428432444/1288629955626008666/Icon.png?ex=66f5e1ab&is=66f4902b&hm=ea45ba5f0b520e7caade877d0795c5e1974e38dba25ea6e69f7e40926163bc5a&'
                )
                .setTimestamp()

            await interaction.reply({ embeds: [embed] })
        } else if (subcommand === 'vote') {
            await interaction.deferReply()
            const embed = new EmbedBuilder()
                .setTitle('Upvote Bridgify!')
                .setColor('Blurple')
                .setDescription(
                    `Vote for our bot on any of these platforms! Thank you for supporting us!\n\n- [DiscordBotList.com](https://discordbotlist.com/bots/bridgify/upvote)\n- [BotList.me](https://botlist.me/bots/1193672589428654120)\n- [DiscordList.gg](https://discordlist.gg/bot/1193672589428654120)\n- [InfinityBots.gg](https://infinitybots.gg/bot/1193672589428654120/vote)\n- [RadarCord.net](https://radarcord.net/bot/1193672589428654120/vote)\n- [Discord.RovelStars.com](https://discord.rovelstars.com/bots/1193672589428654120/vote) \n- [Topgg.com](https://top.gg/bot/1193672589428654120) \n- [BhBotlist](https://bhlist.co.in/bots/1193672589428654120)`
                )
                .setFooter({ text: 'Thanks for voting!' })
            await interaction.editReply({ embeds: [embed] })
        }
    }
}
