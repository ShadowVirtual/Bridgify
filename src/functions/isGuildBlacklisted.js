const { db } = require( "../database" )


async function isGuildBlacklisted(guildID) {
    const data = await db.collection('guild-data').findOne({guildId: guildID})

    if (data?.banned) {
        return true
    }
    else {
        return false
    }
}

module.exports = {isGuildBlacklisted}