const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionsBitField,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    ChannelSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ChannelType,
    ModalBuilder,
    StringSelectMenuBuilder, // Added for category selection
  } = require("discord.js");
  const { db } = require("../database");
  const { emojis } = require("../config.json");
  const { badWords } = require("../functions/bad-words");
  const { errorCodes } = require("../functions/errorCodes");
  const { translator } = require("../functions/translator");
  const config = require("../config.json");
  
  // Function to create setup components
  const createSetupComponents = async (guildDB) => {
    const createChannelMenu = (customId, placeholder) => {
      return new ChannelSelectMenuBuilder()
        .setCustomId(customId)
        .setChannelTypes(ChannelType.GuildText) // GuildText channel type
        .setPlaceholder(placeholder);
    };
  
    return {
      partnerChannel: createChannelMenu(
        "partner-channel",
        await translator("Select your partner channel", "English", guildDB.language || "English")
      ),
      reviewChannel: createChannelMenu(
        "partner-review-channel",
        await translator("Select your partner-review-channel", "English", guildDB.language || "English")
      ),
      pmRole: new RoleSelectMenuBuilder()
        .setCustomId("PM-role")
        .setPlaceholder(await translator("Your Partnership Manager Role", "English", guildDB.language || "English")),
      adButton: new ButtonBuilder()
        .setCustomId("Advertisement")
        .setLabel(await translator("Advertisement", "English", guildDB.language || "English"))
        .setStyle(ButtonStyle.Primary)
        .setEmoji("📝"),
      autoSetupButton: new ButtonBuilder()
        .setCustomId("AutoSetup")
        .setLabel(await translator("Auto-Setup", "English", guildDB.language || "English"))
        .setStyle(ButtonStyle.Success)
        .setEmoji("⚙️"),
      advertisementChannel: createChannelMenu(
        "advertisement channel",
        await translator("Select your advertisement channel", "English", guildDB.language || "English")
      ),
      categorySelect: new StringSelectMenuBuilder() // Add category selection
        .setCustomId("category-select")
        .setPlaceholder(await translator("Select your server category", "English", guildDB.language || "English"))
        .addOptions([
          { label: "Gaming", value: "Gaming" },
          { label: "Chill", value: "Chill" },
          { label: "Politics", value: "Politics" },
          { label: "Business", value: "Business" },
          { label: "Minecraft", value: "Minecraft" },
          { label: "LGBTQ", value: "LGBTQ" },
          { label: "Listing", value: "Listing" },
        ]),
    };
  };
  
  // Function to validate channel permissions
  async function validateChannelPermissions(channel, botUser) {
    const permissions = channel.permissionsFor(botUser);
    if (!permissions.has(PermissionsBitField.Flags.SendMessages)) {
      throw new Error("Missing channel permissions");
    }
  }
  
  // Function to save setup data to the database
  async function saveSetupData(guildId, setupData) {
    await db.collection("guild-data").updateOne(
      { guildId },
      {
        $set: {
          "advertisement.message": setupData.advertisement,
          "advertisement.banner2": setupData.banner,
          "advertisement.invite": setupData.invite,
          partnerChannel: setupData.partnerChannel,
          partnerManagerRole: setupData.pmRole,
          partnerRequestsChannel: setupData.reviewChannel,
          partnershipReviewChannel: setupData.reviewChannel,
          category: setupData.category, // Save the selected category
          allowPartners: true,
        },
      },
      { upsert: true }
    );
  }
  
  // Function to save setup data for bump
  async function saveSetupDataForBump(guildId, setupData) {
    await db.collection("guild-data").updateOne(
      { guildId },
      {
        $set: {
          advertisement_channel: setupData.advertisementChannel,
          "bumpAd.message": setupData.advertisement,
        },
      },
      { upsert: true }
    );
  }
  
  // Function to create the advertisement modal
  const createAdvertModal = () => {
    const modal = new ModalBuilder().setTitle("✨ Bridgify Setup ✨").setCustomId("admenu");
  
    const fields = {
      advertisement: new TextInputBuilder()
        .setLabel("Your Server's Advertisement")
        .setStyle(TextInputStyle.Paragraph)
        .setCustomId("adMessageOption")
        .setRequired(true)
        .setPlaceholder("Enter your server's amazing advertisement here..."),
  
      banner: new TextInputBuilder()
        .setLabel("Banner URL (Optional)")
        .setStyle(TextInputStyle.Short)
        .setCustomId("adBannerOption")
        .setRequired(false)
        .setPlaceholder("https://share.creavite.co/your-banner")
        .setMaxLength(58)
        .setMinLength(20),
    };
  
    modal.addComponents(
      new ActionRowBuilder().addComponents(fields.advertisement),
      new ActionRowBuilder().addComponents(fields.banner)
    );
  
    return modal;
  };
  
  // Function to create the bump advertisement modal
  const createBumpAdModal = () => {
    const modal = new ModalBuilder().setTitle("✨ Bridgify Setup ✨").setCustomId("admenu");
  
    const fields = {
      advertisement: new TextInputBuilder()
        .setLabel("Your Server's Advertisement")
        .setStyle(TextInputStyle.Paragraph)
        .setCustomId("adMessageOption")
        .setRequired(true)
        .setPlaceholder("Enter your server's amazing advertisement here..."),
    };
  
    modal.addComponents(new ActionRowBuilder().addComponents(fields.advertisement));
  
    return modal;
  };
  
  // Function to handle the setup flow
  async function handleSetupFlow(interaction, guildDB) {
    await interaction.deferReply({ ephemeral: true });
  
    const components = await createSetupComponents(guildDB);
    let setupData = {};
  
    try {
      // Step 1: Partner Channel Selection
      const partnerEmbed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("🤝 Partner Channel Setup")
        .setDescription(await translator("Select your partner channel", "English", guildDB.language || "English"))
        .addFields(
          { name: "📌 Important", value: "This channel will be used to display successful partnerships", inline: false },
          { name: "💡 Tips", value: "Choose a channel that's visible to all members", inline: false }
        )
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setTimestamp();
  
      const partnerMsg = await interaction.editReply({
        embeds: [partnerEmbed],
        components: [new ActionRowBuilder().addComponents(components.partnerChannel)],
      });
  
      const partnerResponse = await partnerMsg.awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id,
        time: 300000,
      });
  
      setupData.partnerChannel = partnerResponse.values[0];
      await validateChannelPermissions(interaction.guild.channels.cache.get(setupData.partnerChannel), interaction.client.user);
  
      // Step 2: Review Channel Selection
      const reviewEmbed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("📝 Partner Review Channel")
        .setDescription(await translator("Select your partner review channel", "English", guildDB.language || "English"))
        .addFields(
          { name: "🔒 Security", value: "This channel should only be accessible to staff members", inline: false },
          { name: "📋 Purpose", value: "Staff will review and approve partnership requests here", inline: false }
        )
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setTimestamp();
  
      await partnerResponse.update({
        embeds: [reviewEmbed],
        components: [new ActionRowBuilder().addComponents(components.reviewChannel)],
      });
  
      const reviewResponse = await partnerMsg.awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id,
        time: 300000,
      });
  
      setupData.reviewChannel = reviewResponse.values[0];
      await validateChannelPermissions(interaction.guild.channels.cache.get(setupData.reviewChannel), interaction.client.user);
  
      // Step 3: Partner Manager Role
      const roleEmbed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("👑 Partner Manager Role")
        .setDescription(await translator("Select the role for partnership managers", "English", guildDB.language || "English"))
        .addFields(
          { name: "⚡ Permissions", value: "This role will have access to all partnership commands", inline: false },
          { name: "⚠️ Note", value: "Choose a role with appropriate moderation permissions", inline: false }
        )
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setTimestamp();
  
      await reviewResponse.update({
        embeds: [roleEmbed],
        components: [new ActionRowBuilder().addComponents(components.pmRole)],
      });
  
      const roleResponse = await partnerMsg.awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id,
        time: 300000,
      });
  
      setupData.pmRole = roleResponse.values[0];
  
      // Step 4: Category Selection
      const categoryEmbed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("📂 Server Category")
        .setDescription(await translator("Select the category that best fits your server", "English", guildDB.language || "English"))
        .addFields({ name: "📌 Purpose", value: "This helps other servers understand what your server is about", inline: false })
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setTimestamp();
  
      await roleResponse.update({
        embeds: [categoryEmbed],
        components: [new ActionRowBuilder().addComponents(components.categorySelect)],
      });
  
      const categoryResponse = await partnerMsg.awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id,
        time: 300000,
      });
  
      setupData.category = categoryResponse.values[0];
  
      // Step 5: Advertisement Setup
      const adEmbed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("📢 Advertisement Setup")
        .setDescription(await translator("Set up your server's advertisement", "English", guildDB.language || "English"))
        .addFields(
          {
            name: "✨ Best Practices",
            value: "• Keep it concise\n• Highlight unique features\n• Include important channels\n• Mention special events",
            inline: false,
          },
          { name: "🎨 Customization", value: "You can include a banner to make your ad stand out", inline: false }
        )
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setTimestamp();
  
      await categoryResponse.update({
        embeds: [adEmbed],
        components: [new ActionRowBuilder().addComponents(components.adButton)],
      });
  
      const adButtonResponse = await partnerMsg.awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id,
        time: 300000,
      });
  
      await adButtonResponse.showModal(createAdvertModal());
  
      const modalSubmit = await interaction.awaitModalSubmit({
        time: 300000,
        filter: (i) => i.user.id === interaction.user.id,
      });
  
      setupData.advertisement = modalSubmit.fields.getTextInputValue("adMessageOption");
      setupData.banner = modalSubmit.fields.getTextInputValue("adBannerOption");
  
      const invite = await interaction.channel.createInvite({ maxAge: 0, maxUses: 0 });
      await saveSetupData(interaction.guild.id, { ...setupData, invite: `https://discord.gg/${invite.code}` });
  
      const successEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(`${config.emojis.checkmark} Setup Complete!`)
        .setDescription("Your partnership system has been successfully configured!")
        .addFields(
          {
            name: "📌 Channel Configuration",
            value: [`**Partner Channel:** <#${setupData.partnerChannel}>`, `**Review Channel:** <#${setupData.reviewChannel}>`].join("\n"),
            inline: true,
          },
          { name: "👥 Role Setup", value: `**Partner Manager:** <@&${setupData.pmRole}>`, inline: true },
          { name: "📂 Server Category", value: `**Category:** ${setupData.category}`, inline: true },
          { name: "🔗 Server Information", value: `**Server Invite:** https://discord.gg/${invite.code}`, inline: false },
          { name: "🎨 Customization", value: `**Banner:** ${setupData.banner || "None"}`, inline: false }
        )
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setFooter({
          text: "Bridgify Partner Bot • Change settings via /setup, /settings, or dashboard",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setTimestamp();
  
      await modalSubmit.reply({ embeds: [successEmbed] });
    } catch (error) {

      if (error.code === 50013) {
      await interaction.editReply({ embeds: [await errorCodes(15, interaction.guildId)], components: [] });
      }
      else {
        await interaction.editReply({ embeds: [await errorCodes(-1, interaction.guildId)], components: [] });
      }
    }
  }
  
  // Function to handle the bump flow
  async function handleBumpFlow(interaction, guildDB) {
    await interaction.deferReply({ ephemeral: true });
  
    const components = await createSetupComponents(guildDB);
    let setupData = {};
  
    try {
      const bumpEmbed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("📣 Advertisement Channel Setup")
        .setDescription(await translator("Select your advertisement channel", "English", guildDB.language || "English"))
        .addFields(
          { name: "📌 Channel Purpose", value: "This channel will display all your server advertisements", inline: false },
          { name: "💡 Recommendation", value: "Choose a high-visibility channel for maximum exposure", inline: false }
        )
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setTimestamp();
  
      const partnerMsg = await interaction.editReply({
        embeds: [bumpEmbed],
        components: [new ActionRowBuilder().addComponents(components.advertisementChannel)],
      });
  
      const partnerResponse = await partnerMsg.awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id,
        time: 300000,
      });
  
      setupData.advertisementChannel = partnerResponse.values[0];
      await validateChannelPermissions(interaction.guild.channels.cache.get(setupData.advertisementChannel), interaction.client.user);
  
      const adEmbed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("🎯 Bump Advertisement Setup")
        .setDescription(await translator("Set up your bump ad", "English", guildDB.language || "English"))
        .addFields(
          {
            name: "✨ Advertisement Tips",
            value: "• Be clear and concise\n• Highlight unique features\n• Include active channels\n• Mention special perks",
            inline: false,
          },
          { name: "📊 Best Practices", value: "Keep your ad under 1000 characters for optimal visibility", inline: false }
        )
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setTimestamp();
  
      await partnerResponse.update({
        embeds: [adEmbed],
        components: [new ActionRowBuilder().addComponents(components.adButton)],
      });
  
      const adButtonResponse = await partnerMsg.awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id,
        time: 300000,
      });
  
      await adButtonResponse.showModal(createBumpAdModal());
  
      const modalSubmit = await interaction.awaitModalSubmit({
        time: 300000,
        filter: (i) => i.user.id === interaction.user.id,
      });
  
      setupData.advertisement = modalSubmit.fields.getTextInputValue("adMessageOption");
  
      await saveSetupDataForBump(interaction.guild.id, { ...setupData });
  
      const successEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(`${config.emojis.checkmark} Bump Setup Complete!`)
        .setDescription("Your bump system has been successfully configured!")
        .addFields(
          { name: "📢 Channel Configuration", value: `**Advertisement Channel:** <#${setupData.advertisementChannel}>`, inline: false },
          { name: "📝 Advertisement Preview", value: `\`\`\`${setupData.advertisement || "None"}\`\`\``, inline: false }
        )
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setFooter({
          text: "Bridgify Bump System • Manage via /setup, /settings, or dashboard",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setTimestamp();
  
      await modalSubmit.reply({ embeds: [successEmbed] });
    } catch (error) {

      if (error.code === 50013) {
        await interaction.editReply({ embeds: [await errorCodes(15, interaction.guildId)], components: [] });
        }
        else {
          await interaction.editReply({ embeds: [await errorCodes(-1, interaction.guildId)], components: [] });
        }
    }
  }






  
async function handleAutoSetup(interaction, guildDB) {
    try {
        // Create or find a Partner Manager role
        let defaultRole = interaction.guild.roles.cache.find(role => role.name.toLowerCase().includes("partner"));
        if (!defaultRole) {
            defaultRole = await interaction.guild.roles.create({
                name: "Partner Manager",
                color: "#5865F2",
                reason: "Auto-Setup: Created Partner Manager role",
            });
        }

        // Add the bot to the Partner Manager role
        await interaction.guild.members.fetch(interaction.client.user.id).then(botMember => {
            botMember.roles.add(defaultRole, "Auto-Setup: Added bot to Partner Manager role");
        });

        // Create a Partnerships channel
        const partnerChannel = await interaction.guild.channels.create({
            name: "partnerships",
            type: ChannelType.GuildText,
            topic: "This is the channel for partnerships.",
            reason: "Auto-Setup: Created Partnerships channel",
            permissionOverwrites: [
                {
                    id: interaction.guild.id, // @everyone
                    deny: [PermissionsBitField.Flags.SendMessages], // Prevent @everyone from sending messages
                },
                {
                    id: interaction.client.user.id, // Bot
                    allow: [PermissionsBitField.Flags.SendMessages], // Allow the bot to send messages
                },
            ],
        });

        // Create a Partnership Requests channel
        const reviewChannel = await interaction.guild.channels.create({
            name: "partnership-requests",
            type: ChannelType.GuildText,
            topic: "This is the channel for reviewing partnership requests.",
            reason: "Auto-Setup: Created Partnership Requests channel",
            permissionOverwrites: [
                {
                    id: interaction.guild.id, // @everyone
                    deny: [PermissionsBitField.Flags.ViewChannel], // Prevent @everyone from viewing the channel
                },
                {
                    id: interaction.client.user.id, // Bot
                    allow: [PermissionsBitField.Flags.ViewChannel], // Allow the bot to view the channel
                },
            ],
        });

        // Default advertisement and banner
        const defaultAd = "Welcome to our server! Check out our amazing community and events!";
        const defaultBanner = "https://example.com/banner.png";

        // Create an invite link for the partner channel
        const invite = await partnerChannel.createInvite({ maxAge: 0, maxUses: 0 });

        // Save the setup data
        const setupData = {
            partnerChannel: partnerChannel.id,
            reviewChannel: reviewChannel.id,
            pmRole: defaultRole.id,
            advertisement: defaultAd,
            banner: defaultBanner,
            invite: `https://discord.gg/${invite.code}`,
        };

        await saveSetupData(interaction.guild.id, setupData);

        // Send success embed
        const successEmbed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("✅ Auto-Setup Complete!")
            .setDescription("The system has been configured with default settings.")
            .addFields(
                { name: "📌 Partner Channel", value: `<#${setupData.partnerChannel}>`, inline: true },
                { name: "📋 Review Channel", value: `<#${setupData.reviewChannel}>`, inline: true },
                { name: "👥 Partner Manager Role", value: `<@&${setupData.pmRole}>`, inline: true },
                { name: "🔗 Invite Link", value: setupData.invite, inline: false },
                { name: "🎨 Banner", value: setupData.banner || "None", inline: false }
            )
            .setFooter({
                text: "Bridgify Partner Bot",
                iconURL: interaction.client.user.displayAvatarURL(),
            })
            .setTimestamp();

        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "⚠️ Auto-Setup failed. Please try manual setup.", ephemeral: true });
    }
}

  
  // Export the command
  module.exports = {
    data: new SlashCommandBuilder()
      .setName("setup")
      .setDescription("Setup Bridgify in your server!"),
    async execute(interaction) {
      try {
        await interaction.deferReply({ ephemeral: true });
        const data = db.collection("guild-data");
        const guildData = await data.findOne({ guildId: interaction.guildId });
        const manager = await db.collection("guild-data").findOne({ guildId: interaction.guild.id });
  
        const embed = new EmbedBuilder()
          .setColor("Blurple")
          .setTitle("🛠️ Bridgify Setup Wizard")
          .setDescription(await translator("Select what you want to setup on your server", "English", guildData.language || "English"))
          .addFields(
            { name: "🤝 Partnership System (Manual Setup)", value: "Configure your server's partnership channels and roles", inline: true },
            { name: "📢 Bump System", value: "Set up automatic server advertising", inline: true },
            { name: "⭐ Premium Features", value: "Unlock advanced features and automation", inline: true }
          )
          .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
          .setFooter({
            text: "Bridgify Setup • Click a button below to begin",
            iconURL: interaction.client.user.displayAvatarURL(),
          })
          .setTimestamp();
  
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("partnership")
            .setLabel(await translator("Partnership", "English", guildData.language || "English"))
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("partnership-auto")
            .setLabel(await translator("Partnership (Auto-Setup)", "English", guildData.language || "English"))
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("bump")
            .setLabel(await translator("Bumping", "English", guildData.language || "English"))
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("premium")
            .setLabel(await translator("Premium", "English", guildData.language || "English"))
            .setStyle(ButtonStyle.Success)
        );
  
        if (
          manager?.managers?.includes(interaction.user.id) ||
          interaction.user.id == interaction.guild.ownerId ||
          interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
        ) {
          const message = await interaction.editReply({ embeds: [embed], components: [row] });
  
          const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 1200000 });
  
          collector.on("collect", async (interaction) => {
            switch (interaction.customId) {
              case "partnership":
                await handleSetupFlow(interaction, guildData);
                break;
              case "partnership-auto":
                await handleAutoSetup(interaction, guildData);
                break;
              case "bump":
                await handleBumpFlow(interaction, guildData);
                break;
              case "premium":
                const description = await translator(
                  "Premium is the paid feature of the bot that makes Bridgify 100x more efficient at partners.",
                  "English",
                  guildData.language || "English"
                );
                const embed = new EmbedBuilder()
                  .setTitle("**🌟 Premium**")
                  .setColor("#FFD700")
                  .setDescription(`**${description}**`)
                  .addFields(
                    {
                      name: `**💰 ${await translator("Cost", "English", guildData.language || "English")}**`,
                      value: `**${await translator("$3 a month or $20 a year", "English", guildData.language || "English")}**`,
                    },
                    {
                      name: `**🚀 ${await translator("Features", "English", guildData.language || "English")}**`,
                      value: `**${await translator(
                        "Less cooldowns,\n /partner-category, \n/mass, \n access to the premium module in `/settings`\n Premium provides users Auto Partner, Auto Bump, Auto Mass, Auto Advertise, and more!",
                        "English",
                        guildData.language || "English"
                      )}**`,
                    },
                    {
                      name: `**🎫 ${await translator("How to buy premium?", "English", guildData.language || "English")}**`,
                      value: `**Join the support server here and make a ticket!**`,
                    },
                    {
                      name: `**📅 ${await translator("Your Premium Expires On", "English", guildData.language || "English")}**`,
                      value: `**${guildData?.premium?.expiryDate ? new Date(guildData?.premium?.expiryDate).toLocaleDateString() : "N/A"}**`,
                    }
                  )
                  .setFooter({ text: await translator("Thank you for choosing Bridgify Premium!", "English", guildData.language || "English") })
                  .setTimestamp();
  
                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }
          });
        } else {
          return await interaction.editReply({ embeds: [await errorCodes(0, interaction.guild.id)] });
        }
      } catch (error) {
        console.error(`[ERROR]  >>>  Error occurred in setup.js:`, error);
      }
    },
  };