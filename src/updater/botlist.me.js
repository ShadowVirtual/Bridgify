


function topGG(serverCount) {
    fetch("https://top.gg/api/bots/1193672589428654120/stats", {
        method: "POST",
        headers: {
            Authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjExOTM2NzI1ODk0Mjg2NTQxMjAiLCJib3QiOnRydWUsImlhdCI6MTcxMjk2MTQwMX0.F4kyu26WI_hq8lNa_leEF0JLlfyAZBUWy_Sg82i6NQQ",
            
        },
        body: {
            server_count: serverCount
        }
    }).then(response => {
        response.json()
        console.log(response.ok)
    })
}

module.exports = {topGG}