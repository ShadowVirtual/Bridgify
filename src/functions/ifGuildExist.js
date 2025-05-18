const { db } = require(`../database`)


async function ifGuildExist(guildId) {

    const data = await db.collection('guild-data').findOne({guildId: guildId})
    

    if (!data || data == null || data == undefined || data == NaN) {
        return false
    }
    else {
        return true
    }

}

module.exports = {
    ifGuildExist
}