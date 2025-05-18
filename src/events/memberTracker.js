const { Events } = require("discord.js");
const { db } = require("../database");

module.exports = {
    name: Events.GuildMemberAdd,
    once: false,

    async execute(member) {
        try {
        const guildId = member.guild.id;

        const date = `joins-${String(new Date().getDate()).padStart(2, '0')}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${new Date().getFullYear()}`;
        const collection = db.collection(date)

        await collection.updateOne({ guildId: guildId }, { $inc: { "joined": 1 }, $set: { "lastJoin": Date.now() } }, { upsert: true });


        const collections = await db.listCollections({ name: /^joins-/ }).toArray();

        const now = new Date();

        for (const coll of collections) {
            const collName = coll.name;
            const [prefix, day, month, year] = collName.split('-');


            const collDate = new Date(`${year}-${month}-${day}`);

            const diffTime = now - collDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if (diffDays > 7) {
                await db.collection(collName).drop();
                console.log(`Dropped collection: ${collName}`);
            }
        }
    } catch (error) {
        console.error(error);
    }}
};

// if a new day, make a new collection under the day name (01-01-2024)
// for the current day, if a member joins a guild, increment joinsToday by 1 and also update the lastJoin
// if collections is over 7, delete the oldest collection so that only 7 collections are allowed