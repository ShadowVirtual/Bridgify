const { Events, EmbedBuilder, ChannelType, ButtonBuilder, ActionRowBuilder, ActionRow, ButtonStyle } = require("discord.js");
const { db } = require("../database.js");

module.exports = {
    name: Events.GuildCreate,
    once: false,
    async execute(guild) {
        try {
        const textChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText);

        const randomGuildChannel = textChannels.random()
        

        const embed = new EmbedBuilder()
        .setColor("Blurple")
        .setTitle("Getting Started")
        .setDescription(`
🌟 > **BRIDGIFY HAS ENTERED THE CHAT** - Your Digital Local Bridge Builder 🌉
    
Greetings! You've just unlocked a new era of networking with Bridgify, your trusty digital ally. We're thrilled to be part of your server and can't wait to help you forge powerful partnerships and spread your message with unprecedented ease.
    

🔗 > **HELPFUL COMMANDS**:
- \`/partner\`: Instantly link up with potential allies and grow your community's reach.
- \`/advertise\`: Propel your announcements into the spotlight with a single command.
- \`/setup\`: Customize Bridgify to fit the unique fabric of your server.
- \`/setup-bump\`: Customize Bridgify to fit the unique fabric of your server.
- \`/help\`: Access a helping hand whenever you need guidance or support.
- \`/settings\`: Access advanced settings to customize your experience.
    

🎥 > **STEP-BY-STEP TUTORIALS**:
Stuck or just curious about Bridgify's full potential? Check out our YouTube tutorial for a visual guide on setting up and maximizing your Bridgify experience.
    
📜 > **PLAYING BY THE RULES**:
By adding Bridgify to your server, you're agreeing to our Terms of Service and Privacy Policy. Let's maintain a respectful and positive environment for everyone to enjoy.

    
🆘 > **SUPPORT IS JUST A CLICK AWAY**:
Run into a snag or just looking for some tips? Our dedicated support server is your go-to resource for any questions or assistance you might need.

    
Thank you for choosing Bridgify! Let's build lasting connections together. 🤝`)
        .setImage("https://cdn.discordapp.com/attachments/1197315922428432444/1291872189267705966/Banner.png?ex=6701ad3b&is=67005bbb&hm=29b5105bedb52716e1df149eb4324ac44277fa9eff086afecf468bea2c232536&")
        .setTimestamp()
        .setFooter({text: "Bridgify EST. 2024. All Rights Reserved."})

        const buttons = [
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setURL("https://youtu.be/GFILfa_P9M4?si=V3vnqEViH0Rgu2NY")
                .setLabel("Watch Tutorial")
                .setEmoji("🎥"),

            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setURL("https://discord.com/api/oauth2/authorize?client_id=1193672589428654120&permissions=18456&scope=applications.commands%20bot")
                .setLabel("Invite Bridgify")
                .setEmoji("💌"),
        ]

        const button2 = [
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setURL("https://discord.gg/QVnc6HxEBB")
                .setLabel("Support Server")
                .setEmoji("📦"),

            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setURL("https://top.gg/bot/1193672589428654120")
                .setLabel("Upvote Bridgify")
                .setEmoji("<:GigaChad:1223462866787635250>"),
        ]

        const row = new ActionRowBuilder()
            .addComponents(buttons)

        const row2 = new ActionRowBuilder()
            .addComponents(button2)
        

        await randomGuildChannel.send({ content: `<@${guild.ownerId}>`, embeds: [embed], components: [row, row2] }).catch(() => null);
        const owner = await guild.fetchOwner()

        await owner.send({content: `<@${owner.id}>`, embeds: [embed], components: [row, row2]}).catch(() => null);

        db.collection("guild-data").insertOne({guildId: guild.id})
        console.log(`[INFO]  >>>  I was just added to a new guild: ${guild.name} | ${guild.id} | Owner ID: ${guild.ownerId} | Size: ${guild.memberCount}`);

        
    } catch (e) {
        console.log(e)
    }}
}