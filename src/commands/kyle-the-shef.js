const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kyle-the-shef")
        .setDescription("Learn more about Kyle the Shef, the ultimate Discord bot for server management and fun!"),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle("🍳 Kyle the Shef 🍳")
            .setDescription("Kyle the Shef is your go-to Discord bot for making server management easier, faster, and more fun! Whether you're looking for moderation tools, entertaining commands, or utility features, Kyle has got you covered.")
            .setColor("#FFA500") 
            .setThumbnail("https://cdn.discordapp.com/icons/1105859859041243148/c9cf61ffd100e957315dc3920e4e9442.webp")
            .addFields(
                { name: "🛠️ Moderation Commands", value: "Kyle comes packed with powerful moderation tools to keep your server safe and organized. From banning users to clearing chat, Kyle makes moderation a breeze." },
                { name: "🎉 Fun Commands", value: "Spice up your server with fun commands like trivia, memes, and more! Kyle is here to keep your community entertained." },
                { name: "⚙️ Utility Features", value: "Need help managing roles, channels, or server settings? Kyle has utility commands to simplify your life." },
                { name: "🤖 Customizable", value: "Kyle is highly customizable, allowing you to tailor the bot to your server's unique needs." }
            )
            .setFooter({ text: "Invite Kyle the Shef to your server today and experience the difference!" })
            .setTimestamp();

        const inviteButton = new ButtonBuilder()
            .setLabel("Invite Kyle the Shef")
            .setURL("https://discord.com/oauth2/authorize?client_id=1072216284747546867&permissions=8936954920129&scope=bot+applications.commands") // Replace with your bot's invite link
            .setStyle(ButtonStyle.Link);

        const actionRow = new ActionRowBuilder().addComponents(inviteButton);

        await interaction.reply({ embeds: [embed], components: [actionRow] });
    }
};