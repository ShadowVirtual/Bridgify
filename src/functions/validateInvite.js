// /src/functions/validateInvite.js

const {Client} = require('discord.js')
const { db } = require('../database')

/**
 * 
 * @param {Client} client 
 * @param {string} inviteCode 
 * @param {string} guildId
 * @returns {string}
 */
function validateInvite(client, inviteCode, guildId) {
    return new Promise(async(resolve, reject) => {
        
        try {
            const invite = await client.fetchInvite(inviteCode)
            
            resolve(invite.url)
        } catch (error) {
            if (error.code === 10006 || error.code === 0) { // invite is invalid
                const guild = client.guilds.cache.get(guildId)
                const invite = await guild.channels.cache
                .filter(c => c.type === 0) 
                .first().createInvite({ maxUses: 0, maxAge: 0, unique: true }) //make an invite with no expiry
                await db.collection("guild-data").updateOne({guildId}, {$set: {"advertisement.invite": invite.url}})

                resolve(invite.url) 
            }
            
            else resolve(inviteCode) //return the og invite if the error is anything else
        }
    })
}

module.exports = {validateInvite}


// const inviteCache = new Map();

// async function validateInvite(client, inviteCode, guildId) {
//     if (!inviteCode) {
//         console.error('No invite code provided');
//         return inviteCode;
//     }

//     const cleanInviteCode = inviteCode.replace('https://discord.gg/', '').replace('discord.gg/', '');
//     console.log(`Processing invite: ${cleanInviteCode}`);

//     // Check cache first
//     if (inviteCache.has(cleanInviteCode)) {
//         console.log(`Cache hit for invite: ${cleanInviteCode}`);
//         return inviteCache.get(cleanInviteCode);
//     }

//     try {
//         // Fetch invite and guild in parallel to save time
//         const [invite, guild] = await Promise.all([
//             fetchInviteWithBackoff(client, cleanInviteCode),
//             client.guilds.fetch(guildId)
//         ]);

//         // If invite is valid, return it and cache it
//         if (invite) {
//             inviteCache.set(cleanInviteCode, invite.url);
//             console.log('Valid invite:', invite.url);
//             return invite.url;
//         }

//         // If invite is not valid, create a new invite
//         console.log('No valid invite, creating new invite for guild...');
//         const textChannels = guild.channels.cache.filter(c => c.type === 'GUILD_TEXT');

//         if (textChannels.size === 0) {
//             console.log('No text channels found, returning original invite');
//             inviteCache.set(cleanInviteCode, inviteCode); // Cache the original invite if no channels found
//             return inviteCode;
//         }

//         const newInvite = await textChannels.first().createInvite({
//             maxAge: 0,  // Never expires
//             maxUses: 0, // No use limit
//             unique: true
//         });

//         // Cache the new invite
//         inviteCache.set(cleanInviteCode, newInvite.url);
//         console.log('New invite created:', newInvite.url);

//         // Update database with the new invite
//         await db.collection("guild-data").updateOne(
//             { guildId },
//             { $set: { "advertisement.invite": newInvite.url } }
//         );

//         return newInvite.url;
//     } catch (error) {
//         console.error('Error validating invite:', error);
//         inviteCache.set(cleanInviteCode, inviteCode); // Cache the original invite in case of error
//         return inviteCode;
//     }
// }

// async function fetchInviteWithBackoff(client, code, retries = 1, timeout = 2000) {
//     for (let i = 0; i < retries; i++) {
//         try {
//             const invitePromise = client.fetchInvite(code);
//             const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Fetch timed out')), timeout));
//             return await Promise.race([invitePromise, timeoutPromise]);
//         } catch (error) {
//             console.error(`Attempt ${i + 1} - Fetch invite error:`, error.stack || error);
//             if (i === retries - 1) {
//                 // If last retry fails, just break
//                 return null;
//             }
//         }
//     }
//     return null;
// }

// function delay(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// module.exports = { validateInvite };
