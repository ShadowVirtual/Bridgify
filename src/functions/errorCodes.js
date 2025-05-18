const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { translator } = require('../functions/translator')
const { db } = require('../database')
const { emojis } = require('../config.json')

async function errorCodes(errorCode, guildId, hours = "", mins = "", seconds = "", commandName = "") {

    const language = (await db.collection("guild-data").findOne({ guildId: guildId })).language || "English";
    let description, title = `${emojis.cross} Error`, embedColor = "#DC143C";

    switch (errorCode) {
        case 0:
            description = `${emojis.markdown} Error: \`Not Authorized\` \n ${emojis.endingMarkdown} Make sure you are authorized to run this command, tell an admin to run \`/manager add\` and add you as a manager!`;
            break;
        case 1:
            description = `${emojis.markdown} Error: \`Not Setup\` \n ${emojis.endingMarkdown} Please make sure you have set up Bridgify. Run \`/setup\` to setup Bridgify!`;
            break;
        case 2:
        case 3:
            description = `${emojis.markdown} Error: \`Not Premium\` \n ${emojis.endingMarkdown} Please make sure you have bought Bridgify Premium. Run \`/premium\` for more info`;
            break;
        case 4:
            description = `${emojis.markdown} Error: \`No Servers\` \n ${emojis.endingMarkdown} There is no server under that category`;
            break;
        case 5:
            description = `${emojis.markdown} Error: \`No Advertisement Channel\` \n ${emojis.endingMarkdown} There is no advertisement channel, please make sure you have one set up. You can set up one with \`/settings > Ad Modules > Update Advertising Channel\``;
            break;
        case 6:
            description = `${emojis.markdown} Error: \`No Bump Ad\` \n ${emojis.endingMarkdown} There is no bump ad, please make sure you have one set up. You can set up one with \`/setup > Setup Bump\``;
            break;
        case 8:
            description = `${emojis.markdown} Error: \`Already Partnered\` \n ${emojis.endingMarkdown} You have already partnered with this server`;
            break;
        case 9:
            description = `${emojis.markdown} Error: \`Invalid Premium Code/Expired\` \n ${emojis.endingMarkdown} Please make sure you have entered a valid premium code`;
            break;
        case 10:
            description = `${emojis.markdown} Error: \`Missing Permission\` \n ${emojis.endingMarkdown} I do not have permission to send messages in the partnership request channel/partnership channel.`;
            break;
        case 11:
            description = `${emojis.markdown} Error: \`Not Blacklisted\` \n ${emojis.endingMarkdown} This guild is not blacklisted!`;
            break;
        case 12:
            description = `${emojis.markdown} Error: \`Invalid Referral Code\` \n ${emojis.endingMarkdown} This Referral Code is not valid!`;
            break;
        case 13:
            description = `${emojis.markdown} Error: \`Invalid Hex Code\` \n ${emojis.endingMarkdown} This Hex Code is not valid! Please enter a valid hex color code (e.g., #FF5733).`;
            break;
        case 14:
            const cooldownMessage = hours || mins || seconds 
            ? `Please wait \`${hours}:${mins}:${seconds}\` before using \`/${commandName}\` again. \n  ${emojis.endingMarkdown} Want to buy Bridgify premium for a shorter cooldown and many other things? It's only $3 a month and $20 a year! Join [our server](https://discord.gg/TsXra96qqM) and make a ticket if interested! Feel free to upvote the bot for 6 skippable cooldowns.` 
            : `Please wait before using this command again. \n ${emojis.endingMarkdown} Want to buy Bridgify premium for a shorter cooldown and many other things? It's only $3 a month and $20 a year! Join [our server](https://discord.gg/TsXra96qqM) and make a ticket if interested! Feel free to upvote the bot for 6 skippable cooldowns.`;
            description = `${emojis.markdown} Error: \`Cooldown\` \n ${emojis.markdown} \n ${emojis.markdown} ${cooldownMessage}`;
            break;
        case 15:
            description = `${emojis.markdown} Error: \`Need Permissions\` \n ${emojis.markdown} I need **Send Messages**, **View Channel**, abd **Manage Channels** to fully setup this server. \n ${emojis.endingMarkdown} Issue still happening? Please contact support. https://discord.gg/B3EesEDNWR`;
            break;
        case 16:
            description - `${emojis.markdown} Error: \`Unknown Error\` \n ${emojis.endingMarkdown} An unknown error occurred. Please contact support.`;
            break;
        default:
            description = `${emojis.markdown} Error: \`Unknown Error\` \n ${emojis.endingMarkdown} An unknown error occurred. Please contact support.`;
            throw new Error("Unknown Error");
            
    }

    const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle(await translator(title, 'English', language))
        .setDescription(await translator(description, 'English', language))
        .setFooter({ text: "Bridgify EST. 2024"})
        .setThumbnail('https://cdn.discordapp.com/attachments/1197315922428432444/1288629955626008666/Icon.png?ex=66f5e1ab&is=66f4902b&hm=ea45ba5f0b520e7caade877d0795c5e1974e38dba25ea6e69f7e40926163bc5a&')
        .setImage('https://cdn.discordapp.com/attachments/1197315922428432444/1288629980955283496/Banner.png?ex=66f5e1b1&is=66f49031&hm=cf859c83e8f575ab910d2dec8a4743a8f4e00ae35daeed18fbaad473a3d304b9&')
        .setTimestamp();

    return embed;
}


module.exports = {
    errorCodes
}