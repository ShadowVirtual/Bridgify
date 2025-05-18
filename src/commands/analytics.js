const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Canvas = require('canvas');
const Chart = require('chart.js/auto');
const { AttachmentBuilder } = require('discord.js');
const { db } = require('../database');
const { translator } = require('../functions/translator');

function getDaySuffix(day) {
    if (day >= 11 && day <= 13) return "th";
    switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
    }
}

const months = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("analytics")
        .setDescription("View your discord server's analytics!")
        .addStringOption(option =>
            option.setName('timeframe')
                .setDescription('Select the timeframe for analytics')
                .setRequired(false)
                .addChoices(
                    { name: 'Week', value: '7' },
                    { name: 'Month', value: '30' },
                    { name: 'Year', value: '365' }
                )),

    async execute(interaction) {
        await interaction.deferReply();
        const guildData = await db.collection("guild-data").findOne({ guildId: interaction.guild.id });
        const timeframe = interaction.options.getString('timeframe') || '7';

        try {
            // Get collections and sort dates
            const collections = await db.listCollections({ name: /^joins-/ }).toArray();
            const sortedDates = collections
                .map(x => x.name.replace('joins-', ''))
                .sort((a, b) => {
                    const [dayA, monthA, yearA] = a.split('-');
                    const [dayB, monthB, yearB] = b.split('-');
                    return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
                })
                .slice(-parseInt(timeframe)); // Only take the last X days based on timeframe

            // Collect join data
            const joins = [];
            for (const day of sortedDates) {
                try {
                    const joinsForDay = await db.collection("joins-" + day).findOne({ guildId: interaction.guild.id });
                    joins.push(joinsForDay?.joined || 0);
                } catch {
                    joins.push(0);
                }
            }

            // Calculate statistics
            const totalJoins = joins.reduce((sum, value) => sum + value, 0);
            const averageJoins = (totalJoins / joins.length).toFixed(1);
            const maxJoins = Math.max(...joins);
            const maxJoinDate = sortedDates[joins.indexOf(maxJoins)];

            // Create canvas and chart
            const canvas = Canvas.createCanvas(800, 400);
            const ctx = canvas.getContext('2d');

            // Set chart background
            ctx.fillStyle = '#2f3136';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Configure and create chart
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: sortedDates.map(date => {
                        const [day, month] = date.split('-');
                        return `${day} ${months[parseInt(month) - 1].slice(0, 3)}`;
                    }),
                    datasets: [{
                        label: await translator('Member Joins', 'English', guildData?.language || 'English'),
                        data: joins,
                        backgroundColor: 'rgba(88, 101, 242, 0.2)',
                        borderColor: 'rgba(88, 101, 242, 1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: 'rgba(88, 101, 242, 1)',
                        pointBorderColor: '#FFFFFF',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            labels: {
                                color: '#FFFFFF'
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#FFFFFF'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#FFFFFF'
                            }
                        }
                    }
                }
            });

            // Create embed
            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle(`📊 Server Analytics`)
                .addFields(
                    { 
                        name: '📈 Join Statistics', 
                        value: [
                            `**Total Joins:** ${totalJoins}`,
                            `**Average Daily:** ${averageJoins}`,
                            `**Peak Joins:** ${maxJoins} (${maxJoinDate})`
                        ].join('\n'),
                        inline: false 
                    },
                    {
                        name: '🏆 Server Status',
                        value: [
                            `**Current Members:** ${interaction.guild.memberCount}`,
                            `**Time Period:** Last ${timeframe} days`
                        ].join('\n'),
                        inline: false
                    }
                )
                .setFooter({ 
                    text: `Updated ${new Date().toLocaleString()}`,
                    iconURL: interaction.guild.iconURL()
                });

            // Send the response
            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'analytics.png' });
            await interaction.editReply({ 
                embeds: [embed],
                files: [attachment]
            });

        } catch(err) {
            console.error(err);
            await interaction.editReply('An error occurred while generating analytics.');
        }
    }
};