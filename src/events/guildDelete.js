const { Events, EmbedBuilder } = require("discord.js");
const { db } = require("../database.js");


module.exports = {
    name: Events.GuildDelete,
    once: false,
    async execute(guild) {
        if (db.collection("guild-data").findOne({ guildId: guild.id })) {

            console.log(`[MONGO]  >>>  guildDelete event has been triggered, deleting data. . .`)
            await db.collection("guild-data").deleteOne({ guildId: guild.id })
            console.log(`[MONGO]  >>>  Guild Data deleted for: ${guild.name} | ${guild.id}`);
        } else {
            if (!db.collection("guild-data")) {
                console.warn("[MONGO]  >>>  The guild I just left had no data, resolving. . .");
                return;
            }
        }
    }
}