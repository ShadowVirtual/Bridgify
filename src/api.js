const { Client, IntentsBitField } = require("discord.js");
const {isGuildPremium} = require('./functions/isGuildPremium')
const {db} = require('./database')
const {PermissionsBitField} = require('discord.js')
require("dotenv").config();
const express = require('express')
const app = express()
const cors = require('cors');
const port = 2003
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(cors());

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})

app.post('/s', (req, res) => {
    res.send('Hello World!')
    console.log("Hello World From Bridgify!")
    return res.status(200)
})

app.post('/getStatus', (req, res) => {
    console.log("Received a POST request at /getStatus");
    res.status(200).send({ status: "Online" });
});

app.post('/getGuildAvatar', async (req, res) => {

    const {guildId, password} = req.query

    if (password === "Bridgify") {
        const avatar = client.guilds.cache.get(guildId)?.iconURL("png");


        if (avatar == null) {
            return res.send({error: "Error, avatar not found"})
        }

        return res.status(200).json(avatar)

    } else {
        return res.send({error: "Not Authorized"})
    }
})

app.post('/servercount', (req, res) => {
    res.send(`${client.guilds.cache.size}`)
})

app.post('/usercount', (req, res) => {

    res.send(`${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}`)
})


app.post('/updateDataBase', async (req, res) => {

  const { update, guildId, password } = req.query
  const { Ad, partnerStatusBool, bannerUrl, advertisingChannel, autoAccept, autoPartner, autoAdvertise, autoBump, allowDMs, autoMass} = req.body
  const { partnerChannel, requestChannel, language, category } = req.body

  if (password === "Bridgify") {
  if (guildId == null) {
    return res.send({error: "Error, guildId not found"})
  }

  if (update == null) {
    return res.send({error: "Error, update not found"})
  }

  if (await db.collection('guild-data').findOne({guildId: guildId}) == null || !await db.collection('guild-data').findOne({guildId: guildId})) {
    return res.send({error: "Error, guildId not found"})
  }

  if (update == "updateAd") {
    await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"advertisement.message": `${Ad}`}})
    return res.send("Success")
  }
  else if (update == "updateBanner") {
    await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"advertisement.banner2": `${banner}`}})
    return res.send("Success")

  }
  else if (update == "updatePartnerStatus") {
    await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"allowPartners": partnerStatusBool}})
    return res.send("Success")
  }

  else if (update == "updateAdvertisingChannel") {
    await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"advertisement_channel": advertisingChannel}})
    return res.send("Success")
  }

  else if (update == "autoAccept") {
    if (db.collection('guild-data').findOne({guildId: guildId})?.autoAccept == true) {
        return res.send({error: "Error, autoAccept is already true"})
    }

    if (isGuildPremium(guildId) == false) {
        return res.send({error: "Error, guild is not premium"})
    }

    await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"autoAccept": autoAccept}})
    return res.send("Success")
  }

  else if (update == "autoAdvertise") {
    if (db.collection('guild-data').findOne({guildId: guildId})?.autoAdvertise == true) {
        return res.send({error: "Error, autoAccept is already true"})
    }

    if (isGuildPremium(guildId) == false) {
        return res.send({error: "Error, guild is not premium"})
    }

    await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"autoAdvertise": autoAdvertise}})
    return res.send("Success")
  }


  else if (update == "autoBump") {
    if (db.collection('guild-data').findOne({guildId: guildId})?.autoBump == true) {
        return res.send({error: "Error, autoAccept is already true"})
    }

    if (isGuildPremium(guildId) == false) {
        return res.send({error: "Error, guild is not premium"})
    }

    await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"autoBump": autoBump}})
    return res.send("Success")
  }

  else if (update == "autoPartner") {
    if (db.collection('guild-data').findOne({guildId: guildId})?.autoPartner == true) {
        return res.send({error: "Error, autoAccept is already true"})
    }

    if (isGuildPremium(guildId) == false) {
        return res.send({error: "Error, guild is not premium"})
    }

    await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"autoPartner": autoPartner}})
    return res.send("Success")
  }

  else if (update == "allowDMs") {
    if (db.collection('guild-data').findOne({guildId: guildId})?.allowDms == true) {
        return res.send({error: "Error, allowDms is already true"})
    }

    await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"allowDms": allowDMs}})
    return res.send("Success")
  }

  else if (update == "all") {

    if (await isGuildPremium(guildId) == true) {
        if (!Ad || Ad == undefined || Ad == "undefined" || Ad == null) {
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"autoAccept": autoAccept}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"autoAdvertise": autoAdvertise}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"autoBump": autoBump}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"autoPartner": autoPartner}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"autoMass": autoMass}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"allowDms": allowDMs}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"allowPartners": partnerStatusBool}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"advertisement.banner2": bannerUrl}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"advertisement_channel": advertisingChannel}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"partnerChannel": partnerChannel}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"partnerRequestsChannel": requestChannel}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"language": language}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"category": category}})  
            return res.send("Success")
        }
        else {
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"autoAccept": autoAccept}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"autoAdvertise": autoAdvertise}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"autoBump": autoBump}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"autoPartner": autoPartner}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"autoMass": autoMass}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"allowDms": allowDMs}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"allowPartners": partnerStatusBool}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"advertisement.message": Ad}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"advertisement.banner2": bannerUrl}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"advertisement_channel": advertisingChannel}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"partnerChannel": partnerChannel}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"partnerRequestsChannel": requestChannel}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"language": language}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"category": category}})
            return res.send("Success")
        }
    }

    else {
        if (!Ad || Ad == undefined || Ad == "undefined" || Ad == null) {
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"allowDms": allowDMs}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"allowPartners": partnerStatusBool}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"advertisement.banner2": bannerUrl}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"advertisement_channel": advertisingChannel}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"partnerChannel": partnerChannel}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"partnerRequestsChannel": requestChannel}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"language": language}})
            await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"category": category}})
            return res.send("Success")
        }
        else {
        await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"allowDms": allowDMs}})
        await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"allowPartners": partnerStatusBool}})
        await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"advertisement.message": Ad}})
        await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"advertisement.banner2": bannerUrl}})
        await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"advertisement_channel": advertisingChannel}})
        await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"partnerChannel": partnerChannel}})
        await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"partnerRequestsChannel": requestChannel}})
        await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"language": language}})
        await db.collection('guild-data').updateOne({guildId: guildId}, {$set: {"category": category}})
        }

    }



    return res.send("Success")
  }
  else {
    return res.send({error: "Error, query not found"})
  }}

  else {
    return res.send({error: "Not Authorized"})
  }
})

app.post('/getGuild', async (req, res) => {
    const { guildId, password } = req.query;

    const guildData = await db.collection('guild-data').findOne({ guildId });
    if (!guildData) {
        return res.send({ error: "Error, guildId not found" });
    }



    const body = {
        guildId: guildData.guildId,
        adText: guildData.advertisement.message,
        banner: guildData.advertisement.banner2,
        dmStatus: guildData.allowDms,
        partnerStatus: guildData.allowPartners,
        autoAccept: guildData.autoAccept,
        autoAdvertise: guildData.autoAdvertise,
        autoBump: guildData.autoBump,
        autoPartner: guildData.autoPartner,
        autoMass: guildData.autoMass,
        advertisingChannel: guildData.advertisement_channel,
        partnershipChannel: guildData.partnerChannel,
        partnerRequestChannel: guildData.partnerRequestsChannel,
        language: guildData.language,
        category: guildData.category,
        premium: await isGuildPremium(guildData.guildId) 
    };

    console.log(body.premium);

    return res.status(200).json(body);
});

app.post('/getChannels', async (req, res) => {
    const { password, guildId } = req.query;

    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).send({ error: "Guild not found." });
        }

        const channels = await guild.channels.fetch(); 
        let channelsArray = [];

        console.log("Available Channels:", channels.map(channel => ({ id: channel.id, name: channel.name, type: channel.type })));

        if (password === "Bridgify") {
            channels.forEach(channel => {
                try {
                if (channel.type === 0 && 
                    channel.permissionsFor(client.user).has([
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ])
                ) {
                    channelsArray.push({
                        id: channel.id,
                        name: channel.name
                    });
                } else {
                    console.log(`Skipping channel ${channel.name}: Type: ${channel.type}, Permissions: ${channel.permissionsFor(client.user).toArray()}`);
                }}
                catch (error) {
                    console.error("Error fetching channel: No channels");
                    channelsArray = [];
                }
            });

            console.log("Filtered Channels:", channelsArray);

            return res.status(200).json(channelsArray);
        } else {
            return res.status(403).send({ error: "Not Authorized" });
        }
    } catch (error) {
        console.error("Error fetching channels:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    }
});
app.post('/getLeaderboard', async (req, res) => {
    const { password } = req.query;

    if (password === "Bridgify") {
        const leaderboardRaw = await db.collection("guild-data").find().sort({ partnersSent: -1 }).toArray();

        const leaderboardData = [];

        for (let i = 0; i < Math.min(10, leaderboardRaw.length); i++) {
            let guildName = client.guilds.cache.get(leaderboardRaw[i].guildId)?.name || "Unknown Guild";
            guildName = guildName.replace(/(\*|_|`|~|\\|\||>|#|\[|\]|:|@|&|\/|\{|\}|<|-|\+|=)/g, "");
            leaderboardData.push({
                rank: i + 1,
                server: guildName,
                partners: leaderboardRaw[i].partnersSent || 0,
            });
        }

        return res.status(200).json(leaderboardData);
    } else {
        return res.status(403).send({ error: "Not Authorized" });
    }
});