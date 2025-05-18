async function getServerMemberCount(guildId, client) {
    try {
        const guild = await client.guilds.fetch(guildId);
        
        if (!guild) {
            console.error(`Guild with ID ${guildId} not found.`);
            return null; // Guild not found
        }

        const results = await client.shard.broadcastEval(async (client, {
            guildId
        }) => {
            const guild = client.guilds.cache.get(guildId);
            if (guild) {
                return guild.memberCount;
            }
            const fetchedGuild = await client.guilds.fetch(guildId);
            return fetchedGuild ? fetchedGuild.memberCount : 0;
        }, { context: {guildId} }); // Pass the guildId as context

        const totalMembers = results.reduce((acc, memberCount) => acc + memberCount, 0);
        return totalMembers; 
    } catch (error) {
        console.error(`Failed to fetch member count for guild ${guildId}:`, error);
        return null; 
    }
}

module.exports = { getServerMemberCount };
