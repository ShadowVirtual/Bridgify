const { db } = require( "../database" )

function isGuildOwner(userId, guildId, client) {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
        return false;
    }

    if (guild.ownerId === userId) {
        return true;
    }

    else {
        return false;
    }
}


async function isGuildPremium(guildID) {
    const data = await db.collection('guild-data').findOne({ guildId: guildID });

    if (!data || !data.premium || !data.premium.expiryDate) {
        return false;
    }

    if (data.premium.expiryDate < Date.now()) {
        return false;
    }

    return true; 
}

async function isUserPremium(userId, client, guildId) {
    const data = await db.collection('user-data').findOne({ userId: userId });

  
    if (data && data.premium && data.premium.expiryDate > Date.now() && isGuildOwner(userId, guildId, client)) {
        return true;
    }

    if (!data || !data.premium || !data.premium.expiryDate || data.premium.expiryDate < Date.now()) {
        return false;
    }

    return false;
}

module.exports = {
    isGuildPremium,
    isUserPremium
}
