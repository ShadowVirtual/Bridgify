const {
  Events,
  PermissionsBitField,
  Collection,
  EmbedBuilder,
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  RoleSelectMenuBuilder,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionFlagsBits
} = require('discord.js');
const { db } = require('../database')
const { didUserUpvoted4 } = require('../functions/didUserUpvoted.js')
const { isGuildPremium, isUserPremium } = require('../functions/isGuildPremium')
const { translator } = require('../functions/translator')
const { errorCodes } = require('../functions/errorCodes.js')
const config = require('../config.json')
const config2 = require('../config.json')
const fs = require('fs')
const path = require('path')
const cooldowns = new Collection()
const userUpvoted = new Collection()

// Constants
const DEV_USERS = [
  '1302806745294307452',
  '922662980162838549',
  '914129312301604886'
]

const COMMAND_COOLDOWNS = {
  partner: { default: 60000, premium: 10000 },
  'direct-partner': { default: 150000, premium: 60000 },
  mass: { default: 3600000, premium: 3600000 },
  'partner-category': { default: 300000, premium: 300000 },
  advertise: { default: 5400000, premium: 1800000 },
  bump: { default: 5400000, premium: 1800000 },
  're-partner': { default: 180000, premium: 60000 },
  p4p: { default: 720000, premium: 240000 }
}

const FREE_COMMANDS = ['partner', 'direct-partner', 'advertise', 'bump', 're-partner', 'p4p']

const COMMANDS = ['partner', 'direct-partner', 'mass', 'partner-category', 'advertise', 'bump', 're-partner', 'p4p']

const random_tips = [
  'You can always partner with a random server with @everyone or @here pings by running `/p4p`',
  'You can partner with a specific server by running `/direct-partner` with the guild ID of the server you want to partner with.',
  'You can find guild/server Ids by running `/list-servers`',
  'You can partner with multiple servers by running `/mass`',
  'You can partner with a random server that is under a specific category by running `/partner-category`',
  'You can change the language of Bridgify by running `/settings > Misc Settings > Language`',
  'You can advertise your server with `/advertise`',
  'You can bump your server with `/bump`',
  'You can re-partner with a server by running `/re-partner`',
  'You can buy certain ad spots by opening a ticket in our support server!',
  'You can partner with a server by using the `/partner` command.',
  'You can change your category by running `/settings > Misc Settings > Category`',
  'You can be on top of the leaderboard by partnering with a lot of servers. Check the leaderboard by running `/leaderboard`',
  'You can get free premium by running a lot of free commands like `/partner`, `/direct-partner`, `/advertise`, `/bump`, `/re-partner`, `/p4p`. Check `/premium` for more information',
  'You can get 4-8 free skipable cooldowns if you upvote Bridgify on [top.gg!](https://top.gg/bot/1193672589428654120)'
]

// Setup Components Creation
const createSetupComponents = async (guildDB) => {
  const createChannelMenu = (customId, placeholder) => {
    return new ChannelSelectMenuBuilder()
      .setCustomId(customId)
      .setChannelTypes(ChannelType.GuildText)
      .setPlaceholder(placeholder);
  };

  return {
    partnerChannel: createChannelMenu(
      'partner-channel',
      await translator('Select your partner channel', 'English', guildDB?.language || 'English')
    ),
    reviewChannel: createChannelMenu(
      'partner-review-channel',
      await translator('Select your partner-review-channel', 'English', guildDB?.language || 'English')
    ),
    pmRole: new RoleSelectMenuBuilder()
      .setCustomId('PM-role')
      .setPlaceholder(await translator('Your Partnership Manager Role', 'English', guildDB?.language || 'English')),
    adButton: new ButtonBuilder()
      .setCustomId('Advertisement')
      .setLabel(await translator('Advertisement', 'English', guildDB?.language || 'English'))
      .setStyle(ButtonStyle.Primary)
      .setEmoji('📝'),
  };
};

// Advertisement Modal Creation
const createAdvertModal = () => {
  const modal = new ModalBuilder().setTitle('✨ Bridgify Setup ✨').setCustomId('admenu');

  const fields = {
    advertisement: new TextInputBuilder()
      .setLabel("Your Server's Advertisement")
      .setStyle(TextInputStyle.Paragraph)
      .setCustomId('adMessageOption')
      .setRequired(true)
      .setPlaceholder("Enter your server's amazing advertisement here..."),

    banner: new TextInputBuilder()
      .setLabel('Banner URL (Optional)')
      .setStyle(TextInputStyle.Short)
      .setCustomId('adBannerOption')
      .setRequired(false)
      .setPlaceholder('https://share.creavite.co/your-banner')
      .setMaxLength(58)
      .setMinLength(20),
  };

  modal.addComponents(
    new ActionRowBuilder().addComponents(fields.advertisement),
    new ActionRowBuilder().addComponents(fields.banner)
  );

  return modal;
};

// Setup Flow Handler
async function handleSetupFlow(interaction, guildDB) {
  await interaction.deferReply({ ephemeral: true });

  // Check if the user is an admin or server owner
  if (
    !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) &&
    interaction.user.id !== interaction.guild.ownerId
  ) {
    return await interaction.editReply({
      embeds: [await errorCodes(0, interaction.guildId)], // Error code for insufficient permissions
      ephemeral: true,
    });
  }

  const components = await createSetupComponents(guildDB);
  let setupData = {};

  try {
    // Step 1: Partner Channel Selection
    const partnerEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🤝 Partner Channel Setup')
      .setDescription(await translator('Select your partner channel', 'English', guildDB.language || 'English'))
      .addFields(
        {
          name: '📌 Important',
          value: 'This channel will be used to display successful partnerships',
          inline: false,
        },
        {
          name: '💡 Tips',
          value: "Choose a channel that's visible to all members",
          inline: false,
        }
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
    await validateChannelPermissions(
      interaction.guild.channels.cache.get(setupData.partnerChannel),
      interaction.client.user
    );

    // Step 2: Review Channel Selection
    const reviewEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📝 Partner Review Channel')
      .setDescription(await translator('Select your partner review channel', 'English', guildDB?.language || 'English'))
      .addFields(
        {
          name: '🔒 Security',
          value: 'This channel should only be accessible to staff members',
          inline: false,
        },
        {
          name: '📋 Purpose',
          value: 'Staff will review and approve partnership requests here',
          inline: false,
        }
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
    await validateChannelPermissions(
      interaction.guild.channels.cache.get(setupData.reviewChannel),
      interaction.client.user
    );

    // Step 3: Partner Manager Role
    const roleEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('👑 Partner Manager Role')
      .setDescription(
        await translator('Select the role for partnership managers', 'English', guildDB?.language || 'English')
      )
      .addFields(
        {
          name: '⚡ Permissions',
          value: 'This role will have access to all partnership commands',
          inline: false,
        },
        {
          name: '⚠️ Note',
          value: 'Choose a role with appropriate moderation permissions',
          inline: false,
        }
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

    // Step 4: Advertisement Setup
    const adEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📢 Advertisement Setup')
      .setDescription(await translator("Set up your server's advertisement", 'English', guildDB?.language || 'English'))
      .addFields(
        {
          name: '✨ Best Practices',
          value:
            '• Keep it concise\n• Highlight unique features\n• Include important channels\n• Mention special events',
          inline: false,
        },
        {
          name: '🎨 Customization',
          value: 'You can include a banner to make your ad stand out',
          inline: false,
        }
      )
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setTimestamp();

    await roleResponse.update({
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

    setupData.advertisement = modalSubmit.fields.getTextInputValue('adMessageOption');
    setupData.banner = modalSubmit.fields.getTextInputValue('adBannerOption');

    const invite = await interaction.channel.createInvite({ maxAge: 0, maxUses: 0 });
    await saveSetupData(interaction.guild.id, { ...setupData, invite: `https://discord.gg/${invite.code}` });
    const successEmbed = new EmbedBuilder()
      .setColor('Green')
      .setTitle(`${config.emojis.checkmark} Setup Complete!`)
      .setDescription('Your partnership system has been successfully configured!')
      .addFields(
        {
          name: '📌 Channel Configuration',
          value: [
            `**Partner Channel:** <#${setupData.partnerChannel}>`,
            `**Review Channel:** <#${setupData.reviewChannel}>`,
          ].join('\n'),
          inline: true,
        },
        {
          name: '👥 Role Setup',
          value: `**Partner Manager:** <@&${setupData.pmRole}>`,
          inline: true,
        },
        {
          name: '🔗 Server Information',
          value: `**Server Invite:** https://discord.gg/${invite.code}`,
          inline: false,
        },
        {
          name: '🎨 Customization',
          value: `**Banner:** ${setupData.banner || 'None'}`,
          inline: false,
        }
      )
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setFooter({
        text: 'Bridgify Partner Bot • Change settings via /setup, /settings, or dashboard',
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    await modalSubmit.reply({ embeds: [successEmbed] });
  } catch (error) {
    await interaction.editReply({ embeds: [await errorCodes(15, interaction.guildId)], components: [] });
  }
}

// Utility Functions
async function validateChannelPermissions(channel, botUser) {
  const permissions = channel.permissionsFor(botUser);
  if (!permissions.has(PermissionsBitField.Flags.SendMessages)) {
    throw new Error('Missing channel permissions');
  }
}

async function saveSetupData(guildId, setupData) {
  await db.collection('guild-data').updateOne(
    { guildId },
    {
      $set: {
        'advertisement.message': setupData.advertisement,
        'advertisement.banner2': setupData.banner,
        'advertisement.invite': setupData.invite,
        partnerChannel: setupData.partnerChannel,
        partnerManagerRole: setupData.pmRole,
        partnerRequestsChannel: setupData.reviewChannel,
        partnershipReviewChannel: setupData.reviewChannel,
        allowPartners: true,
      },
    },
    { upsert: true }
  );
}

// Main interaction handler
function findCommandFile(commandName, dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true })

  for (const item of items) {
    const fullPath = path.join(dir, item.name)

    if (item.isDirectory()) {
      // Search in subdirectory
      const result = findCommandFile(commandName, fullPath)
      if (result) return result
    } else if (item.isFile() && item.name === `${commandName}.js`) {
      // Found the command file
      return fullPath
    }
  }
  return null
}

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    try {
      if (!interaction.guild || !interaction.isCommand()) return

      var commandName = interaction.commandName

      // Handle dev commands
      if (DEV_USERS.includes(interaction.user.id)) {
        const devCommandPath = path.join(__dirname, `../devCommands/${commandName}.js`)
        if (fs.existsSync(devCommandPath)) {
          const command = require(devCommandPath)
          return await command.execute(interaction)
        }
      }

      // Check guild in database
      const guild = await db.collection('guild-data').findOne({ guildId: interaction.guildId })
      const userIsAuthorized = interaction.user.id === interaction.guild.ownerId || guild?.managers?.includes(interaction.user.id) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);
      const bannedGuild = await db.collection('ban-guilds').findOne({ guildId: interaction.guildId })
      const executingGuildData = await db.collection('guild-data').findOne({ guildId: interaction.guildId });

      if (bannedGuild?.banned == true) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('❌ Server Banned')
          .setDescription('This server has been banned from using Bridgify. Please contact Bridgify Support!')

        await interaction.reply({ embeds: [embed], ephemeral: true }).catch(async () => {
          await interaction.followUp({ embeds: [embed], ephemeral: true })
        })
        return
      }
      if (!guild) {
        db.collection('guild-data').insertOne({ guildId: interaction.guild.id })

        // const embed = new EmbedBuilder()
        //     .setColor("Red")
        //     .setTitle("❌ Server Not Found")
        //     .setDescription("This server is not in our database. Please contact Bridgify Support!");

        // await interaction.reply({ embeds: [embed], ephemeral: true });
        // return;
      }

      // Handle setup requirements
      if (['partner', 'partner-all-guilds', 'partner-category'].includes(commandName) && !guild?.advertisement && interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) || ['partner', 'partner-all-guilds', 'partner-category'].includes(commandName) && !guild.allowPartners && interaction.user.id == interaction.guild.ownerId) {
        return await handleSetupFlow(interaction, guild)
      }

      

      // Find and execute command
      const commandsDirectory = path.join(__dirname, '../commands')
      const commandPath = findCommandFile(commandName, commandsDirectory)

      if (!commandPath) {
        throw new Error(`Command ${commandName} not found`)
      }

      const command = require(commandPath)

      const devData = await db.collection('dev-settings').findOne({ trustedManagers: interaction.client.user.id })

      // Handle upvote benefits and cooldowns. And check if the bot has enought permissions to run certain commands etc 
      if (interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.SendMessages) === false || interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ViewChannel) === false || interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.EmbedLinks) === false) {
        
        const missingPermissions = [];
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.SendMessages)) missingPermissions.push('`Send Messages`');
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ViewChannel)) missingPermissions.push('`View Channel`');
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.EmbedLinks)) missingPermissions.push('`Embed Links`');
        
        const embed = new EmbedBuilder()
            .setColor('#FF0000') // A vibrant red color
            .setTitle('❌ Missing Permissions')
            .setDescription('The bot is missing some essential permissions to execute this command. Please grant the required permissions and try again.')
            .addFields(
                { name: 'Missing Permissions', value: missingPermissions.join('\n') || 'None' }, // Display permissions in a clean list
                { name: 'How to Fix', value: 'Ensure the bot has the following permissions in this server:\n- **Send Messages**: Allows the bot to send messages.\n- **View Channel**: Allows the bot to see this channel.\n- **Embed Links**: Allows the bot to send rich embeds.' }
            )
            .setThumbnail('https://i.imgur.com/7Wg5ZzK.png') // Add a relevant thumbnail (e.g., a lock or warning icon)
            .setFooter({ text: 'Need help? Contact support!', iconURL: 'https://i.imgur.com/7Wg5ZzK.png' }) // Add a footer with support information
            .setTimestamp(); // Add a timestamp for better context
        
        await interaction.reply({ embeds: [embed], ephemeral: true }).catch(async () => {
            await interaction.followUp({ embeds: [embed], ephemeral: true });
        });
        return handleUpvoteAndCooldown(interaction, commandName, false);
      }

      if (COMMANDS.includes(commandName) && (commandName !== "bump" && !userIsAuthorized)) {

        await handleUpvoteAndCooldown(interaction, commandName, false)
        return await interaction.reply({embeds: [await errorCodes(0, interaction.guildId)]});
      }
    
      if (await handleUpvoteAndCooldown(interaction, commandName)) {
        if (FREE_COMMANDS.includes(commandName)) {
          await db
            .collection('guild-data')
            .updateOne({ guildId: interaction.guildId }, { $inc: { 'premium.points': 15 } })
        }
        await command.execute(interaction)
      }


      if (devData.saleAlert == true && COMMANDS.includes(commandName)) {
        const embed = new EmbedBuilder()
          .setColor('#FFD700') // Gold color for an eye-catching effect
          .setTitle('🎉 Bridgify’s New Year Sale! 🎉')
          .setDescription(
            `**Don't miss out on the chance to unlock premium features at a discounted price!**\n
                     🎁 **Limited Time Offer:**\n\n
                     🔥 Up to **50% OFF** on premium plans!\n
                     💎 Enhance your partnership experience with **exclusive perks** and tools.\n\n
                     🕒 **Offer ends soon!** Grab it before it's gone!`
          )
          .addFields(
            {
              name: '🌟 Premium Perks Include:',
              value: '✅ Priority Support\n✅ Advanced Commands\n✅ Custom Automation\n✅ And much more!'
            },
            { name: '📅 Sale Duration:', value: 'From **January 1st** to **January 7th**' },
            { name: '🛒 How to Redeem:', value: 'Use `/redeem`!' }
          )
          .setFooter({
            text: 'Hurry! Sale ends soon. Terms and conditions apply.',
            iconURL: 'https://img.freepik.com/free-vector/new-year-sale-icon-template_23-2148796731.jpg'
          }) // Footer icon
          .setTimestamp()

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel(`Support Server`)
            .setURL('https://discord.gg/TsXra96qqM')
            .setStyle(ButtonStyle.Link)
            .setEmoji('🔗'),

          new ButtonBuilder()
            .setLabel(`Ad Spot for Sale`)
            .setURL('https://discord.gg/TsXra96qqM')
            .setStyle(ButtonStyle.Link)
            .setEmoji('🔗'),

          new ButtonBuilder()
            .setLabel('Sentry Bot')
            .setURL('https://discord.gg/xkGSm2vDsG')
            .setStyle(ButtonStyle.Link)
            .setEmoji('🔗')
        )

        const sendEmbedProbability = 0.3

        if (Math.random() < sendEmbedProbability) {
          await interaction.followUp({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] })
        }
      } else {
        if (COMMANDS.includes(commandName) && executingGuildData?.messageTipsEnabaled == true || executingGuildData?.messageTipsEnabaled == undefined || executingGuildData?.messageTipsEnabaled == null) {
          const sendEmbedProbability = 0.3

          const embed = new EmbedBuilder()
            .setColor('Blurple') // Using Blurple for a modern Discord feel
            .setTitle('💡 Did You Know?')
            .setDescription(random_tips[Math.floor(Math.random() * random_tips.length)])
            .setFooter({
              text: 'Tip of the Day by Bridgify'
            })
            .setTimestamp() // Adds the current timestamp

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel(`Support Server`)
              .setURL('https://discord.gg/TsXra96qqM')
              .setStyle(ButtonStyle.Link)
              .setEmoji('🔗'),

            new ButtonBuilder()
              .setLabel(`Ad Spot for Sale`)
              .setURL('https://discord.gg/TsXra96qqM')
              .setStyle(ButtonStyle.Link)
              .setEmoji('🔗'),

            new ButtonBuilder()
              .setLabel('Sentry Bot')
              .setURL('https://discord.gg/xkGSm2vDsG')
              .setStyle(ButtonStyle.Link)
              .setEmoji('🔗'),

            new ButtonBuilder()
              .setLabel(`Disable Tips`)
              .setStyle(ButtonStyle.Danger)
              .setCustomId('disable-tips')
          )

          if (Math.random() < sendEmbedProbability) {
            await interaction.followUp({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] })
          }
        }
      }
    } catch (error) {
      console.error('Interaction Error:', error)
      await handleUpvoteAndCooldown(interaction, commandName, false)
      await interaction
        .reply({ embeds: [await errorCodes('Unexpected Error', interaction.guildId)], ephemeral: true })
        .catch(async () =>
          interaction.followUp({ embeds: [await errorCodes(21, interaction.guildId)], ephemeral: true })
        )
    }


  }
}
async function handleUpvoteAndCooldown(interaction, commandName, success = true) {


  if (success === true) {
  // Handle upvote benefits
  const upvoteData = await didUserUpvoted4(interaction.user.id);
  if (upvoteData?.voted >= 1) {
    const skipsLeft = userUpvoted.get(interaction.guild.id) || 6;
    if (skipsLeft > 0) {
      userUpvoted.set(interaction.guild.id, skipsLeft - 1);
      return true;
    }
  }

  // Handle cooldowns
  if (!COMMAND_COOLDOWNS[commandName]) return true;

  const timestamps = cooldowns.get(commandName) || new Collection();
  cooldowns.set(commandName, timestamps);

  const now = Date.now();
  const isPremium = await isGuildPremium(interaction.guildId);
  const IsUserOwnerAndPremium = await isUserPremium(interaction.user.id, interaction.client, interaction.guildId);
  const cooldownAmount = COMMAND_COOLDOWNS[commandName][isPremium || IsUserOwnerAndPremium ? 'premium' : 'default'];


  if (timestamps.has(interaction.guild.id)) {
    const expirationTime = timestamps.get(interaction.guild.id) + cooldownAmount;
    if (now < expirationTime) {
      const timeLeft = expirationTime - now;
      const hours = Math.floor(timeLeft / 3600000);
      const minutes = Math.floor((timeLeft % 3600000) / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      const upvoteButton = new ButtonBuilder()
        .setLabel('Upvote')
        .setURL('https://top.gg/bot/1193672589428654120')
        .setStyle(ButtonStyle.Link)
        .setEmoji('📈');

      const adSpotOnSale = new ButtonBuilder()
        .setLabel('Ad Spot for Sale')
        .setURL('https://discord.gg/TsXra96qqM')
        .setStyle(ButtonStyle.Link)
        .setEmoji('🔗');

      const SentryBot = new ButtonBuilder()
        .setLabel('Sentry Bot')
        .setURL('https://discord.gg/xkGSm2vDsG')
        .setStyle(ButtonStyle.Link)
        .setEmji('🔗');

      const row = new ActionRowBuilder().addComponents(upvoteButton, adSpotOnSale. SentryBot);
      await interaction
        .reply({
          embeds: [await errorCodes(14, interaction.guildId, hours, minutes, seconds, commandName)],
          components: [row],
        })
        .catch(
          async () =>
            await interaction.followUp({ embeds: [await errorCodes(14, interaction.guildId)], ephemeral: true })
        );



      return false;
    }
  }

  // Only set the cooldown if the command execution is successful
  
    timestamps.set(interaction.guild.id, now);

    setTimeout(async () => {
      try {
        timestamps.delete(interaction.guild.id);

        const reminderPing = await db.collection('guild-data').findOne({ guildId: interaction.guildId });
        const isPremium = await isGuildPremium(interaction.guildId);


        const createEmbed = (title, description, mention, isRoleMention) => ({
          content: `${mention}`,
          embeds: [
            new EmbedBuilder()
              .setColor('#5865F2')
              .setTitle(title)
              .setDescription(description)
              .setFooter({
                text: 'Bridgify • The #1 Partnership Bot',
                iconURL: interaction.client.user.displayAvatarURL(),
              })
              .setTimestamp(),
          ],
          allowedMentions: {
            parse: isRoleMention ? ['users'] : ['users', 'roles'],
            roles: isRoleMention ? [reminderPing.pingReminder] : [],
          },
        });

        const commandMessage = `Command \`/${commandName}\` is ready to use!`;
        const userMention = `<@${interaction.user.id}>`;
        const roleMention = `<@&${reminderPing?.pingReminder}>`;

        let embedMessage;
        if (isPremium && reminderPing?.pingReminder) {
          if (reminderPing?.reminder) {
            embedMessage = createEmbed(
              `Cooldown Notice`,
              `${config2.emojis.checkmark} ${commandMessage}\n\nSpecial Message: \`${reminderPing.reminder}\``,
              roleMention,
              true
            );
          } else {
            embedMessage = createEmbed(
              `Cooldown Notice`,
              `${config2.emojis.checkmark} ${commandMessage}`,
              roleMention,
              true
            );
          }
        } else {
          // Non-premium or premium without ping reminder
          embedMessage = createEmbed(
            `Cooldown Notice`,
            `${config2.emojis.checkmark} ${commandMessage}\n${config2.emojis.glass} **User:** ${userMention}`,
            userMention,
            false
          );
        }

        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setLabel('Support Server')
              .setURL('https://discord.gg/cWSAvcmxPN')
              .setStyle(ButtonStyle.Link)
              .setEmoji('🔗')
          )
          .addComponents(
            new ButtonBuilder()
              .setLabel('Follow us on X')
              .setURL('https://x.com/bridgifyxyz')
              .setStyle(ButtonStyle.Link)
              .setEmoji('🔗')
          )
          .addComponents(
            new ButtonBuilder()
            .setLabel("Disable Reminder")
            .setStyle(ButtonStyle.Danger)
            .setCustomId('disable-reminder')
          );

        const devDataBase = await db.collection('dev-settings').findOne({ trustedManagers: interaction.client.user.id });

        if (devDataBase.surveyButton == true) {
          row.addComponents(
            new ButtonBuilder()
              .setLabel('Want to take part in our survey?')
              .setURL('https://forms.gle/m3pq7nS18BBYzbjT6')
              .setStyle(ButtonStyle.Link)
              .setEmoji('📋')
          );
        }

        if (devDataBase.staffAppButton == true) {
          row.addComponents(
            new ButtonBuilder()
              .setLabel('Want to apply as a staff member?')
              .setURL('https://forms.gle/H7HFoMsxVF2tMjDPA')
              .setStyle(ButtonStyle.Link)
              .setEmoji('📋')
          );
        }
        if (reminderPing?.cooldownReminderEnabled == true || reminderPing?.cooldownReminderEnabled == null || reminderPing?.cooldownReminderEnabled == undefined) {
        await interaction
          .followUp({ content: embedMessage.content, embeds: [embedMessage.embeds[0]], components: [row] })
          .catch(async () => {
            await interaction.reply({
              content: embedMessage.content,
              embeds: [embedMessage.embeds[0]],
              components: [row],
            });
          });
        }
      } catch (e) {
        console.error(e);
      }
    }, cooldownAmount);
  }



  return true;
}
