const { Client, IntentsBitField } = require("discord.js");
const { startAutomations } = require("./handlers/automationHandler");
const { startEvents } = require("./handlers/eventHandler");
const { startAutoPoster } = require("./handlers/topggPoster");
require("dotenv").config();
const token = process.env.botToken;
const {db} = require("./database");
let shardRespawnAttempts = 0;
const MAX_RESPAWN_ATTEMPTS = 5;

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMembers,
  ],
  rest: {
    timeout: 15000
  }

});


client.on("shardReady", async (shardId) => {
  console.log(`Shard ${shardId} is ready`);
  console.log(shardId);
  if (Number(shardId) == 0) {
    
    if (!await db.collection("dev-settings").findOne({ trustedManagers: client.user.id })) {
      await db.collection("dev-settings").insertOne({ trustedManagers: client.user.id });
      await db.collection("dev-settings").updateOne({ trustedManagers: client.user.id }, { $set: { surveyButton: false} });
      await db.collection("dev-settings").updateOne({ trustedManagers: client.user.id }, { $set: { saleAlert: false} });
      await db.collection("dev-settings").updateOne({ trustedManagers: client.user.id }, { $set: { staffAppButton: false} });
    }
    startEvents(client);

    startAutoPoster(client);

    startAutomations(client);
  }

});

client.on("shardError", async (error, shardId) => {
  console.log(`[SHARD ERROR] Shard ${shardId} encountered an error: ${error}`);

  if (error.code === "ShardingReadyTimeout") {
    shardRespawnAttempts += 1;
    if (shardRespawnAttempts <= MAX_RESPAWN_ATTEMPTS) {
      console.log(`Retrying shard ${shardId}...`);
      client.shards.get(shardId).respawn();
    } else {
      console.error(
        `[SHARD ERROR] Max respawn attempts reached for shard ${shardId}.`
      );
    }
  }
});



client.on("error", (error) => {
  console.log(`[ERROR] >>> ${error}`);
 return;
});

client.on("warning", (warning) => {
  console.log(`[WARNING] >>> ${warning}`);
  return;
});

process.on("uncaughtException", (error) => {
  console.log(`[ERROR] >>> ${error} \n ${error.stack} \n ${error.message}`);
  return;
});

process.on("unhandledRejection", (error) => {
  console.log(`[ERROR] >>> ${error} \n ${error.stack} \n ${error.message}`);
  return;
});

client.rest.on("rateLimited", (info) => {
  console.log(`[RATE LIMITED] >>> ${info}`);
  return;
});

client.login(token).then(() => {
  console.log(`[BRIDGIFY] >>> Logged in as ${client.user.tag}`);
});
