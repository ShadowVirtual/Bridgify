const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, PermissionsBitField, RoleSelectMenuBuilder, ChannelSelectMenuBuilder} = require("discord.js");
const { db } = require('../database');
const { isGuildPremium, isUserPremium } = require('../functions/isGuildPremium');
const { translator } = require('../functions/translator');
const { errorCodes } = require('../functions/errorCodes');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("settings")
        .setDescription("Configure the bot through here!"),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const guildData = await db.collection("guild-data").findOne({ guildId: interaction.guild.id });
            if (interaction.user.id == interaction.guild.ownerId && guildData?.advertisement || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) && guildData?.advertisement) {
                const menu = new StringSelectMenuBuilder()
                    .setCustomId("menu")
                    .setPlaceholder(await translator("Select a setting to configure", "English", guildData.language || "English"))
                    .addOptions([
                        {
                            label: await translator("Premium Modules", "English", guildData.language || "English"),
                            value: "Premium_Modules",
                            description: await translator("Premium Modules", "English", guildData.language || "English"),
                            emoji: "⚙️"
                        },
                        {
                            label: await translator("Ad Modules", "English", guildData.language || "English"),
                            value: "Ad_Modules",
                            description: await translator("Ad Modules", "English", guildData.language || "English"),
                            emoji: "⚙️"
                        },
                        {
                            label: await translator("Partner Modules", "English", guildData.language || "English"),
                            value: "Partner_Modules",
                            description: await translator("Partner Modules", "English", guildData.language || "English"),
                            emoji: "⚙️"
                        },

                        {
                            label: await translator("Leaderboard Modules", "English", guildData.language || "English"),
                            value: "Leaderboard_Modules",
                            description: await translator("Leaderboard Modules", "English", guildData.language || "English"),
                            emoji: "⚙️"
                        },
                        {
                            label: await translator("Requirement Modules", "English", guildData.language || "English"),
                            value: "Requirement_Modules",
                            description: await translator("Requirement Modules", "English", guildData.language || "English"),
                            emoji: "⚙️"
                        },
                        {
                            label: await translator("Misc Modules", "English", guildData.language || "English"),
                            value: "Misc_Modules",
                            description: await translator("Misc Modules", "English", guildData.language || "English"),
                            emoji: "⚙️"
                        }
                    ]);

                var editRow = new ActionRowBuilder().addComponents(menu);
                var editMessage = await interaction.editReply({ content: await translator("Select a setting to configure", "English", guildData.language || "English"), components: [editRow], ephemeral: true });

                const filter = i => i.user.id === interaction.user.id;
                const collector = editMessage.createMessageComponentCollector({ filter, time: 540000 });

                collector.on("collect", async (i) => {
                    try {
                        if (i.customId === "menu") {
                            if (i.values[0] === "Premium_Modules") {
                                await i.deferUpdate()
                                const embed = new EmbedBuilder()
                                    .setTitle(await  translator("Premium Modules", "English", guildData.language || "English"))
                                    .setDescription(await translator("These modules are for premium users only!", "English", guildData.language || "English"))
                                    .setColor("Blurple");
                                
                                const embed2 = new EmbedBuilder()
                                    .setTitle(await  translator("Premium Modules", "English", guildData.language || "English"))
                                    .setColor("Blurple");
                                
                                const buttons = [

                                    new ButtonBuilder()
                                    .setStyle(ButtonStyle.Success)
                                    .setEmoji("🪙")
                                    .setCustomId("auto_partner")
                                    .setLabel(await translator("Auto Partner", "English", guildData.language || "English")),

                                 new ButtonBuilder()
                                    .setStyle(ButtonStyle.Success)
                                    .setEmoji("🪙")
                                    .setCustomId("auto_bump")
                                    .setLabel(await translator("Auto Bump", "English", guildData.language || "English")),

                                ]

                                const button2 = [
                                    new ButtonBuilder()
                                    .setStyle(ButtonStyle.Success)
                                    .setEmoji("🪙")
                                    .setCustomId("auto_advertise")
                                    .setLabel(await translator("Auto Advertise", "English", guildData.language || "English")),

                                new ButtonBuilder()
                                    .setStyle(ButtonStyle.Success)
                                    .setEmoji("🪙")
                                    .setCustomId("auto_accept")
                                    .setLabel(await translator("Auto Accept", "English", guildData.language || "English")),

                                    
                                new ButtonBuilder()
                                    .setStyle(ButtonStyle.Success)
                                    .setEmoji("🪙")
                                    .setCustomId("auto_mass")
                                    .setLabel(await translator("Auto Mass", "English", guildData.language || "English")),
                                ]

                                const button3 = [
                                    new ButtonBuilder()
                                    .setStyle(ButtonStyle.Secondary)
                                    .setEmoji("🪙")
                                    .setCustomId("Set_Custom_Reminder")
                                    .setLabel(await translator("Set Custom Reminder", "English", guildData.language || "English")),


                                    new ButtonBuilder()
                                    .setStyle(ButtonStyle.Secondary)
                                    .setEmoji("🪙")
                                    .setCustomId("Remove_Custom_Reminder")
                                    .setLabel(await translator("Remove Custom Reminder", "English", guildData.language || "English")),

                                    
                                    new ButtonBuilder()
                                    .setStyle(ButtonStyle.Secondary)
                                    .setEmoji("🪙")
                                    .setCustomId("Set_Ping_Reminder")
                                    .setLabel(await translator("Set Reminder Ping", "English", guildData.language || "English")),
                                ]

                                const button4 = [

                                    new ButtonBuilder()
                                    .setStyle(ButtonStyle.Secondary)
                                    .setEmoji("🪙")
                                    .setCustomId("Remove_Ping_Reminder")
                                    .setLabel(await translator("Remove Reminder Ping", "English", guildData.language || "English")),

                                    new ButtonBuilder()
                                    .setStyle(ButtonStyle.Secondary)
                                    .setEmoji("❌")
                                    .setCustomId("back")
                                    .setLabel(await translator("Back", "English", guildData.language || "English")),
                                ]
                                
                                 

                                const row = new ActionRowBuilder().addComponents(buttons);

                                const row2 = new ActionRowBuilder().addComponents(button2);

                                const row3 = new ActionRowBuilder().addComponents(button3);

                                const row4 = new ActionRowBuilder().addComponents(button4);


                                if (!(await isGuildPremium(i.guildId) || await isUserPremium(i.user.id, i.client, i.guildId))) {
                                    await i.editReply({ embeds: [embed], components: [] });
                                    return
                                } else {
                                    const message = await i.editReply({ embeds: [embed2], components: [row, row2, row3, row4] });
                                    
                                    const filter2 = j => j.user.id === i.user.id;
                                    const collector2 = message.createMessageComponentCollector({ filter: filter2, time: 540000 });

                                    collector2.on("collect", async j => {
                                        try {
                                            const guildData = await db.collection("guild-data").findOne({ guildId: j.guildId });

                                            switch (j.customId) {
                                                case "Set_Custom_Reminder":
                                                    const modal2 = new ModalBuilder()
                                                        .setTitle(await translator("Set Custom Reminder", "English", guildData.language || "English"))
                                                        .setCustomId("Set_Custom_Reminder")
                                                    
                                                    const firstActionRow = new ActionRowBuilder()
                                                        .addComponents(
                                                            new TextInputBuilder()
                                                                .setCustomId("custom_reminder")
                                                                .setLabel(await translator("Set Custom Reminder", "English", guildData.language || "English"))
                                                                .setStyle(TextInputStyle.Paragraph)
                                                                .setMinLength(38)
                                                                .setMaxLength(1000)
                                                                .setRequired(true))

                                                    modal2.addComponents(firstActionRow);

                                                    await j.showModal(modal2);
                                                    
                                                    const filter = i => i.user.id === j.user.id;
                                                    const collector = await i.awaitModalSubmit({ filter, time: 60000 });
                                                    
                                                    if (collector) {
                                                        const customReminder = collector.fields.getTextInputValue("custom_reminder");

                                                        await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { reminder: customReminder } }, { upsert: true });

                                                        await collector.reply({ content: await translator("Successfully set the custom reminder!", "English", guildData.language || "English") });
                                                    }

                                                    break;
                                                case "Remove_Custom_Reminder":
                                                    await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { reminder: null } }, { upsert: true });
                                                    await j.reply({ content: await translator("Successfully removed the custom reminder!", "English", guildData.language || "English") });
                                                    break;
                                                
                                                case "Set_Ping_Reminder":
                                                    const modal3 = new ModalBuilder()
                                                        .setTitle(await translator("Set Reminder Role Ping", "English", guildData.language || "English"))
                                                        .setCustomId("Set_Ping_Reminder")
                                                    
                                                    const firstActionRow2 = new ActionRowBuilder()
                                                        .addComponents(
                                                            new TextInputBuilder()
                                                                .setCustomId("ping_reminder")
                                                                .setLabel(await translator("Role ID", "English", guildData.language || "English"))
                                                                .setStyle(TextInputStyle.Short)
                                                                .setRequired(true))

                                                    modal3.addComponents(firstActionRow2);

                                                    await j.showModal(modal3);
                                                    
                                                    const filter333 = i => i.user.id === j.user.id;
                                                    const collector333 = await i.awaitModalSubmit({ filter333, time: 60000 });
                                                    
                                                    if (collector333) {
                                                        const pingReminder = collector333.fields.getTextInputValue("ping_reminder");
                                                        
                                                        await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { pingReminder: pingReminder } }, { upsert: true });

                                                        await collector333.reply({ content: await translator("Successfully set the reminder ping!", "English", guildData.language || "English") });

                                                    }
                                                    break;

                                                case "Remove_Ping_Reminder":
                                                    await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { pingReminder: null } }, { upsert: true });
                                                    await j.reply({ content: await translator("Successfully removed the reminder ping!", "English", guildData.language || "English") });
                                                    break;

                                                    
                                                        
                                                case "auto_partner":
                                                    guildData.autoPartner = !guildData.autoPartner;
                                                    await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { autoPartner: guildData.autoPartner } }, { upsert: true });
                                                    await j.reply({ content: await translator(`Successfully ${guildData.autoPartner ? 'enabled' : 'disabled'} auto partner!`, "English", guildData.language || "English") });
                                                    break;
                                                case "auto_bump":
                                                    guildData.autoBump = !guildData.autoBump;
                                                    await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { autoBump: guildData.autoBump } }, { upsert: true });
                                                    await j.reply({ content: await translator(`Successfully ${guildData.autoBump ? 'enabled' : 'disabled'} auto bump!`, "English", guildData.language || "English") });
                                                    break;
                                                case "auto_advertise":
                                                    guildData.autoAdvertise = !guildData.autoAdvertise;
                                                    await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { autoAdvertise: guildData.autoAdvertise } }, { upsert: true });
                                                    await j.reply({ content: await translator(`Successfully ${guildData.autoAdvertise ? 'enabled' : 'disabled'} auto advertise!`, "English", guildData.language || "English") });
                                                    break;
                                                case "auto_accept":
                                                    guildData.auto_accept = !guildData.auto_accept;
                                                    await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { auto_accept: guildData.auto_accept } }, { upsert: true });
                                                    await j.reply({ content: await translator(`Successfully ${guildData.auto_accept ? 'enabled' : 'disabled'} auto accept!`, "English", guildData.language || "English") });
                                                    break;
                                                case "auto_mass": 
                                                    guildData.autoMass = !guildData.autoMass;
                                                    await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { autoMass: guildData.autoMass } }, { upsert: true });
                                                    await j.reply({ content: await translator(`Successfully ${guildData.autoMass ? 'enabled' : 'disabled'} auto mass!`, "English", guildData.language || "English") });
                                                    break;                                                    
                                                
                                                case "back":
                                                    await j.update({ content: await translator(`Select a setting to configure`, "English", guildData.language || "English"), embeds: [], components: [editRow] });
                                                    break;
                                                default:
                                                    break;
                                            }
                                            return
                                        } catch (error) {
                                            console.error(`Error in Premium Modules interaction: ${error}`);
                                        }
                                    });
                                }
                            }

                            if (i.values[0] === "Ad_Modules") {
                                await i.deferUpdate()
                                const embed = new EmbedBuilder()
                                    .setColor("Blurple")
                                    .setTitle(await translator("Ad Modules", "English", guildData.language || "English"));

                                const buttons = [
                                    new ButtonBuilder()
                                        .setStyle(ButtonStyle.Primary)
                                        .setEmoji("⚙️")
                                        .setCustomId("Update_Channels")
                                        .setLabel(await translator("Update Partner Channels", "English", guildData.language || "English")),

                                    new ButtonBuilder()
                                        .setStyle(ButtonStyle.Primary)
                                        .setEmoji("⚙️")
                                        .setLabel(await translator("Set Embed Color", "English", guildData.language || "English"))
                                        .setCustomId("SetColor"),


                                    
                                    new ButtonBuilder()
                                        .setStyle(ButtonStyle.Primary)
                                        .setEmoji("⚙️")
                                        .setLabel(await translator("Remove Embed Color", "English", guildData.language || "English"))
                                        .setCustomId("removeEmbedColor"),

                                    new ButtonBuilder()
                                        .setStyle(ButtonStyle.Primary)
                                        .setEmoji("⚙️")
                                        .setCustomId("back")
                                        .setLabel(await translator("Back", "English", guildData.language || "English")),
                                    
                                ];

                                const buttons2 = [
                                    new ButtonBuilder()
                                        .setStyle(ButtonStyle.Primary)
                                        .setEmoji("⚙️")
                                        .setCustomId("Update_Ad")
                                        .setLabel(await translator("Update Advertisement", "English", guildData.language || "English")),
                                    new ButtonBuilder()
                                        .setStyle(ButtonStyle.Primary)
                                        .setEmoji("⚙️")
                                        .setCustomId("Update_ad_channel")
                                        .setLabel(await translator("Update Advertising Channel", "English", guildData.language || "English")),
                                ]

                                const button3 = [
                                    new ButtonBuilder()
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji("⚙️")
                                    .setCustomId("upartner_ping")
                                    .setLabel(await translator("Update Partner Ping", "English", guildData.language || "English")),
                                ]

                                const row = new ActionRowBuilder().addComponents(buttons);
                                const row2 = new ActionRowBuilder().addComponents(buttons2);
                                const row3 = new ActionRowBuilder().addComponents(button3);
                                const message = await i.editReply({ embeds: [embed], components: [row, row2, row3] });

                                const filter3 = j => j.user.id === i.user.id;
                                const collector3 = message.createMessageComponentCollector({ filter: filter3, time: 540000 });

                                collector3.on("collect", async (j) => {
                                    try {

                                        if (j.customId === "removeEmbedColor") {
                                            const color = await db.collection("guild-data").findOne({ guildId: j.guildId });

                                            if (color?.hexColor) {
                                                await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { hexColor: null } }, { upsert: true });
                                                await j.reply({ content: await translator("Successfully removed embed color!", "English", guildData.language || "English") });
                                                return
                                            }
                                            else {
                                                await j.reply({ content: await translator("There is no embed color set!", "English", guildData.language || "English") });
                                            }
                                        }
                                        if (j.customId === "SetColor") {
                                            const modal = new ModalBuilder()
                                                .setTitle(await translator("Hex Color", "English", guildData.language || "English"))
                                                .setCustomId("setColorModal");
                                        
                                            const colorInput = new TextInputBuilder()
                                                .setLabel(await translator("Insert Hex Color", "English", guildData.language || "English"))
                                                .setStyle(TextInputStyle.Short)
                                                .setPlaceholder("#000000")
                                                .setCustomId("colorOption3")
                                                .setRequired(true);
                                        
                                            modal.addComponents(new ActionRowBuilder().addComponents(colorInput));
                                        
                                            await j.showModal(modal);
                                        
                                            const filter = (i) => i.user.id === j.user.id;
                                        
                                            try {
                                                const submittedModal = await j.awaitModalSubmit({ filter, time: 540000 }); // 9 minutes timeout
                                        
                                                const colorValue = submittedModal.fields.getTextInputValue("colorOption3");
                                        
                                                const hexPattern = /^#([A-Fa-f0-9]{6})$/;
                                                if (!hexPattern.test(colorValue)) {
                                                    return await submittedModal.reply({
                                                        embeds: [await errorCodes(13, j.guild.id)],
                                                        ephemeral: true,
                                                    });
                                                }
                                        
                                                await db.collection("guild-data").updateOne({ guildId: j.guild.id }, { $set: { hexColor: colorValue } });
                                        
                                                await submittedModal.reply({
                                                    content: await translator("Color successfully set to", "English", guildData.language || "English") + ` ${colorValue}`,
                                                    ephemeral: true,
                                                });
                                            } catch (error) {
                                                console.error("Modal submission error:", error);
                                                await j.reply({ content: "Something went wrong. Please try again.", ephemeral: true });
                                                return
                                            }
                                        }
                                        if (j.customId === "Update_Ad") {
                                            const modal = new ModalBuilder()
                                                .setTitle(await translator("Bridgify Setup", "English", guildData.language || "English"))
                                                .setCustomId("Update_Ad")
                                            const adMessage = new TextInputBuilder()
                                                .setLabel(await translator("Advertisement Message", "English", guildData.language || "English"))
                                                .setStyle(TextInputStyle.Paragraph)
                                                .setCustomId("adMessageOption3")
                                                .setRequired(true)
                                            
                                            const banner = new TextInputBuilder()
                                                .setLabel(await translator("Banner URL (AUTO.CREAVITE.CO) (OPTIONAL)", "English", guildData.language || "English"))
                                                .setStyle(TextInputStyle.Short)
                                                .setCustomId("bannerOption3")
                                                .setRequired(false)

                                            const actionRow1 = new ActionRowBuilder().addComponents(adMessage);
                                            const actionRow2 = new ActionRowBuilder().addComponents(banner);
                                            modal.addComponents(actionRow1, actionRow2);
                                            await j.showModal(modal);

                                            const submitted = await j.awaitModalSubmit({
                                                time: 1200000,
                                                filter: j => j.user.id === interaction.user.id && j.customId === "Update_Ad"
                                            });

                                            if (submitted) {
                                                const banner2 = submitted.fields.getTextInputValue("bannerOption3");
                                                const adMessage3 = submitted.fields.getTextInputValue("adMessageOption3");
                                                if (banner2 && adMessage3) {
                                                    await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { "advertisement.banner2": banner } });
                                                    await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { "advertisement.message": adMessage } });
                                                    await submitted.reply(await translator("Successfully updated advertisement!", "English", guildData.language || "English"));
                                                    return
                                                }
                                                const adMessage = submitted.fields.getTextInputValue("adMessageOption3");
                                                await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { "advertisement.message": adMessage } });
                                                await submitted.reply(await translator("Successfully updated advertisement!", "English", guildData.language || "English"));
                                            }
                                        }
                                        if (j.customId === "Update_Channels")  {
                                            const modal3 = new ModalBuilder()
                                                .setTitle(await translator("Channel Setup", "English", guildData.language || "English"))
                                                .setCustomId("Update_Channels");
                                            const channel = new TextInputBuilder()
                                                .setLabel(await translator("Partner Channel", "English", guildData.language || "English"))
                                                .setStyle(TextInputStyle.Short)
                                                .setCustomId("channelOption")
                                                .setRequired(true)
                                            const channel2 = new TextInputBuilder()
                                                .setLabel(await translator("Partner Review Channel", "English", guildData.language || "English"))
                                                .setStyle(TextInputStyle.Short)
                                                .setCustomId("channelOption2")
                                                .setRequired(true)
                                            

                                            const actionRow1 = new ActionRowBuilder().addComponents(channel);
                                            const actionRow2 = new ActionRowBuilder().addComponents(channel2);
                                            modal3.addComponents(actionRow1, actionRow2);
                                            await j.showModal(modal3);

                                            const submitted = await j.awaitModalSubmit({
                                                time: 1200000,
                                                filter: j => j.user.id === interaction.user.id && j.customId === "Update_Channels"
                                            });
                                            if (submitted) {
                                                const channel = submitted.fields.getTextInputValue("channelOption");
                                                const channel2 = submitted.fields.getTextInputValue("channelOption2")
                                                const getPartnerChannel = interaction.guild.channels.cache.get(channel);
                                                const getPartnerReviewChannel = interaction.guild.channels.cache.get(channel2);
                                                try {
                                                var hasPermss = getPartnerChannel.permissionsFor(interaction.client.user).has(PermissionsBitField.Flags.SendMessages)
                                                } catch (e) {
                                                    const embed = new EmbedBuilder()
                                                    .setColor("Red")
                                                    .setDescription(await translator("I do not have permission to send messages in the partner channel! Please make sure I have these permissions in the partner channel", "English", guildData.language || "English"))
                                                    .setImage("https://cdn.discordapp.com/attachments/1198070409216676021/1241383599903735889/image.png?ex=664a0012&is=6648ae92&hm=9a9b5ca6bcb34c2f1e1235c8390d3c11d7698b75423b161f5293467270702012&")
                                                     return await submitted.reply({embeds: [embed], ephemeral: true});
                                                }
                                                try {
                                                var hasPerms2 = getPartnerReviewChannel.permissionsFor(interaction.client.user).has(PermissionsBitField.Flags.SendMessages);
                                                } catch (e) {
                                                    const embed = new EmbedBuilder()
                                                    .setColor("Red")
                                                    .setDescription(await translator("I do not have permission to send messages in the partner channel! Please make sure I have these permissions in the partner channel", "English", guildData.language || "English"))
                                                    .setImage("https://cdn.discordapp.com/attachments/1198070409216676021/1241383599903735889/image.png?ex=664a0012&is=6648ae92&hm=9a9b5ca6bcb34c2f1e1235c8390d3c11d7698b75423b161f5293467270702012&")
                                                     return await submitted.reply({embeds: [embed], ephemeral: true});
                                                }
                                                if (!hasPermss) {
                                                    const embed = new EmbedBuilder()
                                                    .setColor("Red")
                                                    .setDescription(await translator("I do not have permission to send messages in the partner channel! Please make sure I have these permissions in the partner channel", "English", guildData.language || "English"))
                                                    .setImage("https://cdn.discordapp.com/attachments/1198070409216676021/1241383599903735889/image.png?ex=664a0012&is=6648ae92&hm=9a9b5ca6bcb34c2f1e1235c8390d3c11d7698b75423b161f5293467270702012&")
                                                     return await submitted.reply({embeds: [embed], ephemeral: true});
                                                };

                                                if (!hasPerms2) {
                                                    const embed = new EmbedBuilder()
                                                    .setColor("Red")
                                                    .setDescription(await translator("I do not have permission to send messages in the partner channel! Please make sure I have these permissions in the partner channel", "English", guildData.language || "English"))
                                                    .setImage("https://cdn.discordapp.com/attachments/1198070409216676021/1241383599903735889/image.png?ex=664a0012&is=6648ae92&hm=9a9b5ca6bcb34c2f1e1235c8390d3c11d7698b75423b161f5293467270702012&")
                                                    return await submitted.reply({embeds: [embed], ephemeral: true});
                                                }
                                                

                                                await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { "partnerChannel": channel } });
                                                await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { "partnershipReviewChannel": channel2 } });
                                                await submitted.reply(await translator("Partner channels updated successfully!", "English", guildData.language || "English"));
                                            }
                                            return
                                        }
                                        if (j.customId == "Update_ad_channel") {
                                            const modal = new ModalBuilder()
                                                .setTitle(await translator("Bridgify Setup", "English", guildData.language || "English"))
                                                .setCustomId("Update_ad_channel");
                                            const adChannel = new TextInputBuilder()
                                                .setLabel(await translator("Advertising Channel", "English", guildData.language || "English"))
                                                .setStyle(TextInputStyle.Short)
                                                .setCustomId("adChannelOption")
                                                .setRequired(true)
                                                .setPlaceholder(await translator("Channel ID", "English", guildData.language || "English"))
                                            

                                            const row = new ActionRowBuilder().addComponents(adChannel);
                                            modal.addComponents(row);
                                            await j.showModal(modal);
                                            const submitted = await j.awaitModalSubmit({
                                                time: 1200000,
                                                filter: j => j.user.id === interaction.user.id && j.customId === "Update_ad_channel"
                                            });
                                            if (submitted) {
                                                const adChannel = submitted.fields.getTextInputValue("adChannelOption");
                                                const getPartnerChannel = interaction.guild.channels.cache.get(adChannel);
                                                try {
                                                var hasPerms = getPartnerChannel.permissionsFor(interaction.client.user).has(PermissionsBitField.Flags.SendMessages);
                                                } catch (e) {
                                                    const embed = new EmbedBuilder()
                                                    .setColor("Red")
                                                    .setDescription(await translator("I do not have permission to send messages in the advertising channel! Please make sure I have these permissions in the advertising channel", "English", guildData.language || "English"))
                                                    .setImage("https://cdn.discordapp.com/attachments/1198070409216676021/1241383599903735889/image.png?ex=664a0012&is=6648ae92&hm=9a9b5ca6bcb34c2f1e1235c8390d3c11d7698b75423b161f5293467270702012&")
                                                     return await submitted.reply({embeds: [embed], ephemeral: true});
                                                }
                                                if (!hasPerms) {
                                                    const embed = new EmbedBuilder()
                                                    .setColor("Red")
                                                    .setDescription(await translator("I do not have permission to send messages in the advertising channel! Please make sure I have these permissions in the advertising channel", "English", guildData.language || "English"))
                                                    .setImage("https://cdn.discordapp.com/attachments/1198070409216676021/1241383599903735889/image.png?ex=664a0012&is=6648ae92&hm=9a9b5ca6bcb34c2f1e1235c8390d3c11d7698b75423b161f5293467270702012&")
                                                     return await submitted.reply({embeds: [embed], ephemeral: true});
                                                }
                                                await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { "advertisement_channel": adChannel } });
                                                await submitted.reply(await translator("Advertising channel updated successfully!", "English", guildData.language || "English"));
                                            }
                                            return
                                        }
                                        if (j.customId == "upartner_ping") {
                                            const modal = new ModalBuilder()
                                                .setTitle(await translator("Bridgify Setup", "English", guildData.language || "English"))
                                                .setCustomId("upartner_ping");
                                            const ping = new TextInputBuilder()
                                                .setLabel(await translator("Partner Ping Role", "English", guildData.language || "English"))
                                                .setStyle(TextInputStyle.Short)
                                                .setCustomId("pingOption")
                                                .setRequired(true)
                                                .setPlaceholder(await translator("Enter your partner ping role here!", "English", guildData.language || "English"))
                                            const row = new ActionRowBuilder().addComponents(ping);
                                            modal.addComponents(row);
                                            await j.showModal(modal);
                                            const submitted = await j.awaitModalSubmit({
                                                time: 1200000,
                                                filter: j => j.user.id === interaction.user.id && j.customId === "upartner_ping"
                                            })
                                            if (submitted) {
                                                const ping = submitted.fields.getTextInputValue("pingOption");
                                                await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { "partnerPingRole": ping } }, { upsert: true });
                                                await submitted.reply(await translator("Partner ping role updated successfully!", "English", guildData.language || "English"));
                                            }
                                            return
                                        }

                                        if (j.customId == "back") {
                                            await j.update({contents: await translator("Settings", "English", guildData.language || "English"), components: [editRow], embeds: []})
                                            return
                                        }
                                    } catch (error) {
                                        console.error(`Error in Ad Modules interaction: ${error}`);
                                    }
                                });    
                                return           
                            }

                            if (i.values[0] == "Partner_Modules") {
                                await i.deferUpdate()
                                const button = [
                                    new ButtonBuilder()
                                    .setCustomId("Partner_Management")
                                    .setLabel(await translator("Toggle Partner", "English", guildData.language || "English"))
                                    .setStyle(ButtonStyle.Success)
                                    .setEmoji("⚙️"),

                                    new ButtonBuilder()
                                    .setCustomId("back")
                                    .setLabel(await translator("Back", "English", guildData.language || "English"))
                                    .setStyle(ButtonStyle.Secondary)
                                    .setEmoji("❌")
                                ]

                                const row = new ActionRowBuilder().addComponents(button);

                                const embed = new EmbedBuilder()
                                    .setTitle(await translator("Partner Modules", "English", guildData.language || "English"))
                                    .setDescription(await translator("Select a setting to configure", "English", guildData.language || "English"))

                                const message = await i.editReply({ embeds: [embed], components: [row] });

                                const filter = i => i.user.id === interaction.user.id;
                                const collector4 = message.createMessageComponentCollector({ filter, time: 1200000 });

                                collector4.on("collect", async j => {
                                    try {
                                        if (j.customId == "Partner_Management") {
                                            const guildData = await db.collection("guild-data").findOne({ guildId: j.guildId });
                                            guildData.allowPartners = !guildData.allowPartners;
                                            await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { allowPartners: guildData.allowPartners } }, { upsert: true });
                                            await j.reply({ content: await translator(`Partner Toggle has been ${guildData.allowPartners ? "enabled" : "disabled"}`, "English", guildData.language || "English"), ephemeral: true });
                                            return
                                        }

                                        if (j.customId == "back") {
                                            await j.update({contents: await translator("Select a setting to configure", "English", guildData.language || "English"), components: [editRow], embeds: []})
                                            return
                                        }
                                    } catch (error) {
                                        console.error(`Error in Partner Modules interaction: ${error}`);
                                        return
                                    }
                                })
                                return
                            }

                            if (i.values[0] == "Leaderboard_Modules") {
                                await i.deferUpdate()
                                const buttons1 = [
                                    new ButtonBuilder()
                                    .setCustomId("reset_leaderboard")
                                    .setEmoji("⚙️")
                                    .setStyle(ButtonStyle.Primary)
                                    .setLabel(await translator("Reset Leaderboard", "English", guildData.language || "English"))
                                ]

                                const buttons2 = [

                                    new ButtonBuilder()
                                    .setCustomId("add_points")
                                    .setEmoji("⚙️")
                                    .setStyle(ButtonStyle.Primary)
                                    .setLabel(await translator("Add Points", "English", guildData.language || "English")),

                                    new ButtonBuilder()
                                    .setCustomId("remove_points")
                                    .setEmoji("⚙️")
                                    .setStyle(ButtonStyle.Primary)
                                    .setLabel(await translator("Remove Points", "English", guildData.language || "English")),
                                ]

                                const buttons3 = [
                                    new ButtonBuilder()
                                    .setCustomId("set_points")
                                    .setEmoji("⚙️")
                                    .setStyle(ButtonStyle.Primary)
                                    .setLabel(await translator("Set Points", "English", guildData.language || "English")),
                                    
                                    new ButtonBuilder()
                                    .setCustomId("back")
                                    .setEmoji("⚙️")
                                    .setStyle(ButtonStyle.Secondary)
                                    .setLabel(await translator("Back", "English", guildData.language || "English")),
                                ]

                                const row = new ActionRowBuilder().addComponents(buttons1)

                                const row2 = new ActionRowBuilder().addComponents(buttons2)

                                const row3 = new ActionRowBuilder().addComponents(buttons3)

                                const embed = new EmbedBuilder()
                                    .setTitle("Leaderboard Modules")
                                    .setDescription(await  translator("Leaderboard", "English", guildData.language || "English"))

                                const message = await i.editReply({ embeds: [embed], components: [row, row2, row3] });

                                const filter = i => i.user.id === interaction.user.id;
                                const collector4 = message.createMessageComponentCollector({ filter, time: 1200000 });

                                collector4.on("collect", async (j) => {
                                    try {
                                        if (j.customId == "reset_leaderboard") {
                                            const guildData = await db.collection("guild-data").findOne({ guildId: j.guildId });
                                            guildData.leaderboard = []
                                            await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { leaderboard: guildData.leaderboard } }, { upsert: true });
                                            await j.reply({ content: await translator("Leaderboard has been reset", "English", guildData.language || "English"), ephemeral: true });
                                            return
                                        }

                                        if (j.customId == "add_points") {
                                            const guildData = await db.collection("guild-data").findOne({ guildId: j.guildId });
                                            const modal = new ModalBuilder()
                                                .setCustomId("add_points")
                                                .setTitle(await translator("Add Points", "English", guildData.language || "English"));
                            
                                            const pointsInput = new TextInputBuilder()
                                                .setCustomId("points")
                                                .setLabel(await translator("Points", "English", guildData.language || "English"))
                                                .setRequired(true)
                                                .setStyle(TextInputStyle.Short);
                            
                                            const userIdInput = new TextInputBuilder()
                                                .setCustomId("userId")
                                                .setLabel(await translator("User ID", "English", guildData.language || "English"))
                                                .setRequired(true)
                                                .setStyle(TextInputStyle.Short);
                                            

                                            const row = new ActionRowBuilder().addComponents(pointsInput);
                                            const row2 =  new ActionRowBuilder().addComponents(userIdInput);
                                            modal.addComponents(row2, row);
                            
                                            await j.showModal(modal);
                                            const collector = await j.awaitModalSubmit({ filter, time: 1200000 });
                            
                                            if (collector) {
                                                if (!guildData.leaderboard) {
                                                    await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { leaderboard: [] } }, { upsert: true });
                                                    guildData.leaderboard = []
                                                    
                                                }
                                                const pointsToAdd = parseInt(collector.fields.getTextInputValue("points"));
                                                const userId = collector.fields.getTextInputValue("userId");
                                                
                                                if (isNaN(pointsToAdd)) {
                                                    return await collector.reply({ content: await translator("Points must be a number", "English", guildData.language || "English"), ephemeral: true });
                                                }
                                                const userIndex = guildData.leaderboard.findIndex(user => user.userId === userId);
                            
                                                if (userIndex !== -1) {
                                                    guildData.leaderboard[userIndex].points += pointsToAdd;
                                                } else {
                                                    guildData.leaderboard.push({ userId: userId, points: pointsToAdd });
                                                }
                            
                                                await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { leaderboard: guildData.leaderboard } }, { upsert: true });
                                                await collector.reply({ content: await translator("Points have been added", "English", guildData.language || "English"), ephemeral: true });
                                            }
                                            return
                                        }

                                        if (j.customId == "remove_points") {
                                            const guildData = await db.collection("guild-data").findOne({ guildId: j.guildId });
                                            const modal = new ModalBuilder()
                                                .setCustomId("remove_points")
                                                .setTitle(await translator("Add Points", "English", guildData.language || "English"));
                            
                                            const pointsInput = new TextInputBuilder()
                                                .setCustomId("points")
                                                .setLabel(await translator("Points", "English", guildData.language || "English"))
                                                .setRequired(true)
                                                .setStyle(TextInputStyle.Short);
                            
                                            const userIdInput = new TextInputBuilder()
                                                .setCustomId("userId")
                                                .setLabel(await translator("User ID", "English", guildData.language || "English"))
                                                .setRequired(true)
                                                .setStyle(TextInputStyle.Short);
                                            

                                            const row = new ActionRowBuilder().addComponents(pointsInput);
                                            const row2 =  new ActionRowBuilder().addComponents(userIdInput);
                                            modal.addComponents(row2, row);
                            
                                            await j.showModal(modal);
                                            const collector = await j.awaitModalSubmit({ filter, time: 1200000 });
                            
                                            if (collector) {

                                                const pointsToRemove = parseInt(collector.fields.getTextInputValue("points"));

                                                if (isNaN(pointsToRemove)) {
                                                    return await collector.reply({ content: await translator("Points must be a number", "English", guildData.language || "English"), ephemeral: true });
                                                }
                                                const userId = collector.fields.getTextInputValue("userId");
                                                

                                                 
                                                
                                                if (!guildData.leaderboard || guildData.leaderboard.length === 0) {
                                                    await collector.reply({ content: await translator("There is no user to remove points from.", "English", guildData.language || "English"), ephemeral: true });
                                                    return;
                                                }
                                        
                                                const userIndex = guildData.leaderboard.findIndex(user => user.userId === userId);
                                        
                                                if (userIndex !== -1) {

                                                    guildData.leaderboard[userIndex].points -= pointsToRemove;

                                                    if (guildData.leaderboard[userIndex].points < 0) {

                                                        guildData.leaderboard[userIndex].points = 0; 
                                                    }
                                                    await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { leaderboard: guildData.leaderboard } }, { upsert: true });
                                                    await collector.reply({ content: await translator("Points have been removed.", "English", guildData.language || "English"), ephemeral: true });
                                                } else {
                                                    await collector.reply({ content: await translator("The user does not exist on the leaderboard.", "English", guildData.language || "English"), ephemeral: true });
                                                }
                                                return
                                            }
                                        }
                                        if (j.customId == "set_points") {
                                            const guildData = await db.collection("guild-data").findOne({ guildId: j.guildId });
                                            const modal = new ModalBuilder()
                                                .setCustomId("set_points")
                                                .setTitle(await translator("Set Points", "English", guildData.language || "English"));
                                        
                                            const pointsInput = new TextInputBuilder()
                                                .setCustomId("points")
                                                .setLabel(await translator("Points", "English", guildData.language || "English"))
                                                .setRequired(true)
                                                .setStyle(TextInputStyle.Short);
                                        
                                            const userIdInput = new TextInputBuilder()
                                                .setCustomId("userId")
                                                .setLabel(await translator("User ID", "English", guildData.language || "English"))
                                                .setRequired(true)
                                                .setStyle(TextInputStyle.Short);
                                        
                                            const row = new ActionRowBuilder().addComponents(pointsInput);
                                            const row2 = new ActionRowBuilder().addComponents(userIdInput);
                                            modal.addComponents(row2, row);
                                        
                                            await j.showModal(modal);
                                            const collector = await j.awaitModalSubmit({ filter, time: 1200000 });
                                        
                                            if (collector) {
                                                const pointsValue = collector.fields.getTextInputValue("points");
                                                const pointsToSet = parseInt(pointsValue);
                                                const userId = collector.fields.getTextInputValue("userId");
                                        
                                                if (isNaN(pointsToSet)) {
                                                    await collector.reply({ content: await translator("Please enter a valid number for points.", "English", guildData.language || "English"), ephemeral: true });
                                                    return;
                                                }
                                        
                                                if (!guildData.leaderboard) {
                                                    guildData.leaderboard = [];
                                                }
                                        
                                                const userIndex = guildData.leaderboard.findIndex(user => user.userId === userId);
                                        
                                                if (userIndex !== -1) {
                                                    guildData.leaderboard[userIndex].points = pointsToSet;
                                                } else {
                                                    guildData.leaderboard.push({ userId: userId, points: pointsToSet });
                                                }
                                        
                                                await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { leaderboard: guildData.leaderboard } }, { upsert: true });
                                                await collector.reply({ content: await translator("Points have been set.", "English", guildData.language || "English"), ephemeral: true });
                                            }
                                            return
                                        }

                                        if (j.customId == "back") {
                                            await j.update({ embeds: [], components: [editRow] });
                                            return
                                        }
                                    } catch (error) {
                                        console.error(`Error in Leaderboard Modules interaction: ${error}`);
                                        return
                                    }
                                })
                            }

                            if (i.values[0] == "Requirement_Modules") {
                                await i.deferUpdate();
                                const button = [
                                    new ButtonBuilder()
                                    .setCustomId("set_memberRequirement")
                                    .setEmoji("⚙️")
                                    .setStyle(ButtonStyle.Primary)
                                    .setLabel(await translator("Set Member Requirement", "English", guildData.language || "English")),

                                    new ButtonBuilder()
                                    .setCustomId("remove_memberRequirement")
                                    .setEmoji("⚙️")
                                    .setStyle(ButtonStyle.Primary)
                                    .setLabel(await translator("Remove Member Requirement", "English", guildData.language || "English")),

                                    new ButtonBuilder()
                                    .setCustomId("back")
                                    .setEmoji("⚙️")
                                    .setStyle(ButtonStyle.Primary)
                                    .setLabel(await translator("Back", "English", guildData.language || "English")),
                                ]

                                const row = new ActionRowBuilder().addComponents(button);

                                const embed = new EmbedBuilder()
                                    .setColor("Blurple")
                                    .setTitle(await translator("Requirement Modules", "English", guildData.language || "English"))
                                    .setDescription(await translator("Select an option to configure", "English", guildData.language || "English"));

                                const message = await i.editReply({ embeds: [embed], components: [row] });

                                const filter = (i) => i.user.id === interaction.user.id;
                                const collector = message.createMessageComponentCollector({ filter, time: 1200000 });

                                collector.on("collect", async (i) => {

                                    if (i.customId == "set_memberRequirement") {
                                        const modal = new ModalBuilder()
                                            .setTitle(await translator("Set Member Requirement", "English", guildData.language || "English"))
                                            .setCustomId("set_memberRequirement")
                                            .setComponents(
                                                new ActionRowBuilder().addComponents(
                                                    new TextInputBuilder()
                                                        .setCustomId("memberRequirement")
                                                        .setLabel(await translator("Member Requirement", "English", guildData.language || "English"))
                                                        .setStyle(TextInputStyle.Short)
                                                        .setPlaceholder("4")
                                                        .setRequired(true)
                                                )
                                            );
                                        
                                        await i.showModal(modal);
                                        const modalSubmit = await i.awaitModalSubmit({ filter, time: 1200000 });

                                        if (modalSubmit) {
                                            const memberRequirement = modalSubmit.fields.getTextInputValue("memberRequirement");
                                            const serverMemberCount = i.guild.memberCount;
                                            const ninetyPercentOfMembers = Math.floor(serverMemberCount * 0.9);


                                            if (serverMemberCount < memberRequirement) {
                                                return await modalSubmit.reply({ content: await translator("The server member count is less than the member requirement. Please pick a member requirement lower than your server member count.", "English", guildData.language || "English"), ephemeral: true });
                                            }

                                            if (memberRequirement >= ninetyPercentOfMembers) {
                                                return await modalSubmit.reply("The member requirement is too high. Please pick a member requirement lower than 90% of your server member count.", { ephemeral: true });
                                            }

                                            else {
                                                await db.collection("guild-data").updateOne({ guildId: i.guild.id }, { $set: { "requirement.memberRequirement": Number(memberRequirement) } }, { upsert: true });
                                                await modalSubmit.reply({ content: await translator("Requirements has been set.", "English", guildData.language || "English"), ephemeral: true });
                                            }
                                        }
                                        
                                    }

                                    if (i.customId == "remove_memberRequirement") {
                                        await db.collection("guild-data").updateOne({ guildId: i.guild.id }, { $unset: { "requirement.memberRequirement": 0 } }, { upsert: true });
                                        await i.reply({ content: await translator("Requirements has been removed.", "English", guildData.language || "English"), ephemeral: true });
                                    }

                                    else {
                                        await i.update({ embeds: [], components: [editRow] });             
                                        return                     
                                    }
                                })
                            }

                            if (i.values[0] == "Misc_Modules") {
                                await i.deferUpdate();
                                const button1 = [
                                    new ButtonBuilder()
                                    .setCustomId("set_description")
                                    .setEmoji("⚙️")
                                    .setStyle(ButtonStyle.Primary)
                                    .setLabel(await translator("Set Description", "English", guildData.language || "English")),

                                    new ButtonBuilder()
                                    .setCustomId("set_category")
                                    .setEmoji("⚙️")
                                    .setStyle(ButtonStyle.Primary)
                                    .setLabel(await translator("Set Category", "English", guildData.language || "English")),
                                ]

                                const button2 = [

                                    new ButtonBuilder()
                                    .setCustomId("dms")
                                    .setEmoji("⚙️")
                                    .setStyle(ButtonStyle.Primary)
                                    .setLabel(await translator("Toggle DMs", "English", guildData.language || "English")),

                                    new ButtonBuilder()
                                    .setCustomId("remove_partnerping")
                                    .setEmoji("⚙️")
                                    .setStyle(ButtonStyle.Primary)
                                    .setLabel(await translator("Remove Partner Ping", "English", guildData.language || "English")),

                                    new ButtonBuilder()
                                    .setCustomId("toggle-tips")
                                    .setEmoji("⚙️")
                                    .setStyle(ButtonStyle.Primary)
                                    .setLabel(await translator("Toggle Tips", "English", guildData.language || "English")),

                                    new ButtonBuilder()
                                    .setCustomId("toggle-reminder")
                                    .setEmoji("⚙️")                                    
                                    .setStyle(ButtonStyle.Primary)
                                    .setLabel(await translator("Toggle Cooldown Reminder", "English", guildData.language || "English")),

                                ]

                                const button3 = [
                                    new ButtonBuilder()
                                    .setCustomId("r_advertising")
                                    .setEmoji("⚙️")
                                    .setStyle(ButtonStyle.Primary)
                                    .setLabel(await translator("Remove Advertising Channel", "English", guildData.language || "English")),


                                    new ButtonBuilder()
                                    .setCustomId("language")
                                    .setEmoji("⚙️")
                                    .setStyle(ButtonStyle.Primary)
                                    .setLabel(await translator("Language", "English", guildData.language || "English")),
                                    
                                ]
                                const button4 = [
                                    new ButtonBuilder()
                                    .setCustomId("back")
                                    .setEmoji("⚙️")
                                    .setStyle(ButtonStyle.Secondary)
                                    .setLabel(await translator("Back", "English", guildData.language || "English")),
                                ]


                                const row = new ActionRowBuilder().addComponents(button1);

                                const row2 = new ActionRowBuilder().addComponents(button2);
                                const row3 = new ActionRowBuilder().addComponents(button3);

                                const row4 = new ActionRowBuilder().addComponents(button4);

                                const embed = new EmbedBuilder()
                                    .setTitle("Misc Modules")
                                    .setDescription(await translator("Misc Modules", "English", guildData.language || "English"))

                                const message = await i.editReply({ embeds: [embed], components: [row, row2, row3, row4] });

                                const filter = i => i.user.id === interaction.user.id;
                                const collector4 = message.createMessageComponentCollector({ filter, time: 1200000 });

                                collector4.on("collect", async (j) => {
                                    try {
                                        if (j.customId == "set_description") {
                                            const modal = new ModalBuilder()
                                                .setCustomId("set_description")
                                                .setTitle(await translator("Set Description", "English", guildData.language || "English"));

                                            const description = new TextInputBuilder()
                                                .setCustomId("description")
                                                .setLabel(await translator("Description", "English", guildData.language || "English"))
                                                .setStyle(TextInputStyle.Short)
                                                .setRequired(true)

                                            const actionRow = new ActionRowBuilder().addComponents(description);
                                            modal.addComponents(actionRow)
                                            await j.showModal(modal);

                                            const filter = i => i.user.id === interaction.user.id;
                                            const collector5 = await i.awaitModalSubmit({ filter, time: 1200000 });
                                            if (collector5) {
                                                const description = collector5.fields.getTextInputValue("description");
                                                await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { "description": description } }, { upsert: true });
                                                await collector5.reply({ content: await translator("Description successfully has been set", "English", guildData.language || "English"), ephemeral: true });
                                            }
                                            return
                                        }
                                        if (j.customId == "set_category") {

                                            const button = new ButtonBuilder()
                                                .setCustomId("Back")
                                                .setEmoji("⚙️")
                                                .setStyle(ButtonStyle.Primary)
                                                .setLabel(await translator("Back", "English", guildData.language || "English"))

                                            const select = new StringSelectMenuBuilder()
                                            .setCustomId('category')
                                            .setPlaceholder('Select a category that best fits you!')
                                            .addOptions(
                                                new StringSelectMenuOptionBuilder()
                                                    .setLabel(await translator("Gaming", "English", guildData.language || "English"))
                                                    .setValue('Gaming')
                                                    .setEmoji('🎮'),
                                                new StringSelectMenuOptionBuilder()
                                                    .setLabel(await translator("Chill", "English", guildData.language || "English"))
                                                    .setValue('Chill')
                                                    .setEmoji('🏕️'),
                                                new StringSelectMenuOptionBuilder()
                                                    .setLabel(await translator("Politics", "English", guildData.language || "English"))
                                                    .setValue('Politics')
                                                    .setEmoji('<:1665trumpmugshot:1209963187537969162>'),
                                                new StringSelectMenuOptionBuilder()
                                                    .setLabel(await translator("Business", "English", guildData.language || "English"))
                                                    .setValue('Business')
                                                    .setEmoji('💵'),
                                                new StringSelectMenuOptionBuilder()
                                                    .setLabel('Minecraft')
                                                    .setValue('Minecraft')
                                                    .setEmoji('<:grassblock:1208246487256141884>'),
                                                new StringSelectMenuOptionBuilder()
                                                    .setLabel("LGBTQ")
                                                    .setValue("LGBTQ")
                                                    .setEmoji('🏳️‍🌈'),
                                                new StringSelectMenuOptionBuilder()
                                                    .setLabel(await translator("Listing", "English", guildData.language || "English"))
                                                    .setValue("Listing")
                                                    .setEmoji('📈'),
                                            );
                                
                                        const row = new ActionRowBuilder()
                                            .addComponents(select);

                                        const row2 = new ActionRowBuilder()
                                            .addComponents(button);
                                        
                                        const message = await j.update({ embeds: [embed], components: [row, row2] });

                                        const filter = i => i.user.id === interaction.user.id;
                                        
                                        const collector5 = message.createMessageComponentCollector({ filter, time: 1200000 });
                                        collector5.on("collect", async j => {
                                            if (j.customId == "Back") {
                                                await j.update({ embeds: [], components: [editRow] });
                                            }
                                            if (j.customId == "category") {
                                                await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { "category": j.values[0] } }, { upsert: true });
                                                await j.reply(await translator(`Updated category to ${j.values[0]}`, "English", guildData.language || "English"));
                                            }
                                            if (j.customId == "set_description") {
                                                const modal = new ModalBuilder()
                                                    .setCustomId("set_description")
                                                    .setTitle(await translator("Set Description", "English", guildData.language || "English"))
            
                                                const description = new TextInputBuilder()
                                                    .setCustomId("description")
                                                    .setLabel(await translator("Description", "English", guildData.language || "English"))
                                                    .setStyle(TextInputStyle.Short)
                                                    .setRequired(true)
            
                                                const actionRow = new ActionRowBuilder().addComponents(description);
                                                await j.showModal(modal.addComponents(actionRow));
            
                                                const filter = i => i.user.id === interaction.user.id;
                                                const submit = await j.awaitModalSubmit({ filter, time: 1200000 });
                                                if (submit) {
                                                    const description = i.fields.getTextInputValue("description");
                                                    await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { "description": description } }, { upsert: true });
                                                    await i.reply({ content: await translator("Successfully set description", "English", guildData.language || "English"), ephemeral: true });
                                                };
                                            }
                                            
                                            
                                        })
                                            return
                                                
                                        }
                                        if (j.customId == "dms") {
                                            guildData.allowDms = !guildData.allowDms;
                                            await db.collection("guild-data").updateOne({ guildId: j.guildId }, { $set: { allowDms: guildData.allowDms } }, { upsert: true });
                                            await j.reply({ content: await translator(`DMs from Bridgify are now ${guildData.allowDms ? "enabled" : "disabled"}`, "English", guildData.language || "English"), ephemeral: true });
                                            return
                                        }
                                        
                                        if (j.customId == "r_advertising") {

                                            await db.collection("guild-data").updateOne({guildId: interaction.guild.id}, {$set: {"advertisement_channel": null}}, {upsert: true})

                                            await j.reply({content: await translator("Successfully removed the advertising channel", "English", guildData.language || "English"), ephemeral: true})
                                            return
                                        }

                                        if (j.customId == "remove_partnerping") {
                                            const guildData = await db.collection("guild-data").findOne({guildId: i.guild.id})

                                            if (!guildData.partnerPingRole) {
                                                await i.followUp({content: await translator("There is no partner ping role set", "English", guildData.language || "English"), ephemeral: true})
                                                return
                                            };
                                            
                                            await db.collection("guild-data").updateOne({guildId: i.guild.id}, {$set: {"partnerPingRole": null}}, {upsert: true})
                                            await i.reply({content: await translator("Successfully removed the partner ping role", "English", guildData.language || "English"), ephemeral: true})
                                            return
                                        }
                                        if (j.customId == "back") {
                                            await j.update({ embeds: [], components: [editRow] });
                                            return
                                        }
                                        if (j.customId == "language") {
                                            const select = new StringSelectMenuBuilder()
                                                .setCustomId("language")
                                                .setPlaceholder(await translator("Select a language", "English", guildData.language || "English"))
                                                .addOptions([
                                                    new StringSelectMenuOptionBuilder()
                                                        .setLabel('English')
                                                        .setDescription('English')
                                                        .setValue('English')
                                                        .setEmoji("🏴󠁧󠁢󠁥󠁮󠁧󠁿"),
                                                    new StringSelectMenuOptionBuilder()
                                                        .setLabel('German (Deutsch)')
                                                        .setDescription('German')
                                                        .setValue('German')
                                                        .setEmoji("🇩🇪"),

                                                    new StringSelectMenuOptionBuilder()
                                                        .setLabel('Spanish (Español)')
                                                        .setDescription('Spanish')
                                                        .setValue('Spanish')
                                                        .setEmoji("🇪🇸"),

                                                    new StringSelectMenuOptionBuilder()
                                                        .setLabel('French (Français)')
                                                        .setDescription('French')
                                                        .setValue('French')
                                                        .setEmoji("🇫🇷"),

                                                    new StringSelectMenuOptionBuilder()
                                                        .setLabel('Italian (Italiano)')
                                                        .setDescription('Italian')
                                                        .setValue('Italian')
                                                        .setEmoji("🇮🇹"),

                                                    new StringSelectMenuOptionBuilder()
                                                        .setLabel('Dutch (Nederlands)')
                                                        .setDescription('Dutch')
                                                        .setValue('Dutch')
                                                        .setEmoji("🇳🇱"),

                                                    new StringSelectMenuOptionBuilder()
                                                        .setLabel('Polish (Polski)')
                                                        .setDescription('Polish')
                                                        .setValue('Polish')
                                                        .setEmoji("🇵🇱"),

                                                    new StringSelectMenuOptionBuilder()
                                                        .setLabel("Turkish (Türkçe)")
                                                        .setDescription("Turkish")
                                                        .setValue("Turkish")
                                                        .setEmoji("🇹🇷"),

                                                    new StringSelectMenuOptionBuilder()
                                                        .setLabel("Swedish (Svenska)")
                                                        .setDescription("Swedish")
                                                        .setValue("Swedish")
                                                        .setEmoji("🇸🇪"),

                                                    new StringSelectMenuOptionBuilder()
                                                        .setLabel("Portuguese (Português)")
                                                        .setDescription("Portuguese")
                                                        .setValue("Portuguese")
                                                        .setEmoji("🇵🇹"),

                                                    new StringSelectMenuOptionBuilder()
                                                        .setLabel("Russian (Русский)")
                                                        .setDescription("Russian")
                                                        .setValue("Russian")
                                                        .setEmoji("🇷🇺"),

                                                    new StringSelectMenuOptionBuilder()
                                                        .setLabel("Czech (Česky)")
                                                        .setDescription("Czech")
                                                        .setValue("Czech")
                                                        .setEmoji("🇨🇿"),

                                                ])
                                            
                                            const button = [
                                                new ButtonBuilder()
                                                    .setCustomId("Back")
                                                    .setLabel(await translator("Back", "English", guildData.language || "English"))
                                                    .setStyle(ButtonStyle.Secondary)
                                                    .setEmoji("⚙️")
                                            ]


                                            const actionRow = new ActionRowBuilder().addComponents(select);
                                            const actionRow2 = new ActionRowBuilder().addComponents(button);

                                            const embed = new EmbedBuilder()
                                                .setTitle("Settings")
                                                .setDescription(await translator("Select a language", "English", guildData.language || "English"))
                                                .setColor("Blurple")

                                            const message = await j.update({ embeds: [embed], components: [actionRow, actionRow2] });


                                            const selectCollector = message.createMessageComponentCollector({
                                                filter: (j) => j.user.id === interaction.user.id,
                                                time:  300000
                                            });

                                            selectCollector.on('collect', async (j) => {

                                                if (j.customId == "language") {
                                                    await j.deferReply()
                                                    await db.collection("guild-data").updateOne({ guildId: i.guildId }, { $set: { language: j.values[0] } }, { upsert: true });
                                                    await j.editReply({ content: await translator("Successfully changed language to" + j.values[0], "English", j.values[0]), ephemeral: true });
                                                    return

                                                }

                                                if (j.customId == "Back") {
                                                    try {
                                                        
                                                    await j.update({ embeds: [], components: [editRow] });
                                                    selectCollector.stop()
                                                    return
                                                    } catch (error) {
                                                        console.error(error);
                                                    }
                                                }
                                            })
                                        }

                                        if (j.customId == "toggle-tips") {
                                            await j.deferReply()

                                            guildData.messageTipsEnabaled = !guildData.messageTipsEnabaled;

                                            await db.collection("guild-data").updateOne({ guildId: i.guildId }, { $set: { messageTipsEnabaled: guildData.messageTipsEnabaled } }, { upsert: true });
                                            await j.editReply({ content: await translator(`Successfully ${guildData?.messageTipsEnabaled ? 'disabled' : 'enabled'} random tips`, "English", guildData.language || "English"), ephemeral: true });
                                            return
                                        }

                                        if (j.customId == "toggle-reminder") {
                                            await j.deferReply()
                                            guildData.cooldownReminderEnabled = !guildData.cooldownReminderEnabled;
                                            await db.collection("guild-data").updateOne({ guildId: i.guildId }, { $set: { cooldownReminderEnabled: guildData.cooldownReminderEnabled } }, { upsert: true });
                                            await j.editReply({ content: await translator(`Successfully ${guildData?.cooldownReminderEnabled ? 'disabled' : 'enabled'} cooldown reminder`, "English", guildData.language || "English"), ephemeral: true });
                                            return
                                        }
                                        return

                                    }
                                    catch (error) {
                                        console.error(`Error in Misc Modules interaction: ${error}`);
                                        return
                                    }
                                })
                            }
                        }
                    } catch (error) {
                        console.error(error);
                    }
                });
            }
            else {
                await interaction.editReply({ content: "You do not have permission to use this command or you do not have the bot setup, to set it up use the `/setup` command.", ephemeral: true });
                return
            }
        } catch (error) {
            console.error(`Error in settings command: ${error}`);
        }
    }
};
