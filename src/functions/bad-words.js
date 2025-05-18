const bad_words = [
    "nigger",
    "nigga",
    "faggot",
    "faggot",
    "faggit",
    "niglet",
    "nigga",
    "niglet",
    "penis",
    "pussy",
    "pussy",
    "cunt",
    "dick",
    "nazi",
    "jew",
    "n133r",
    "ni33er",
    "n1gga",
    "n1gga",
    "n1gg3r",
    "n1gg3r",
    "n1gg33r",
    "n1gg33r",
    "n1gg33r",
]

function badWords(text) {
    for (let i = 0; i < bad_words.length; i++) {
        if (text.includes(bad_words[i])) {
            return true
        }
    }
    return false
}

module.exports = { badWords}