const { db } = require("../database")

async function isToggled(guildID) {
    const data = await db.collection('guild-data').findOne({guildId: guildID})

    if (data?.allowDms) return true;
    if (data?.allowDms == undefined || null) return true;
    else return false;
}

module.exports = {
    isToggled
}
