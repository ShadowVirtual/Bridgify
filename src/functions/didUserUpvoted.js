require("dotenv").config();

async function didUserUpvoted4(userid) {
    const response = await fetch(`https://top.gg/api/bots/1193672589428654120/check?userId=${userid}`, {
        method: 'GET',
        headers: {
            Authorization: process.env.TOPGG_TOKEN
        }
    });

    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        console.error(`Server responded with ${response.status}: ${response.statusText}`);
    }
}


module.exports = {
    didUserUpvoted4}