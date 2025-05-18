function randomAd() {
    const randomAd = [
        "Need a website to host your bot or your website? Try [Lunes Hosting](https://lunes.host) !",
        "Connect with [Bump](https://discord.com/application-directory/1265343375054340160)[Me](https://discord.gg/A2ANr4tnTH)",
        "Want to put your ad here? Join the [support server](https://discord.gg/KgKJka3jE2) and make a ticket!",
        "Add [Partner](https://discord.gg/SmEEUxWfeG)[Cord](https://discord.com/application-directory/1310688990910742529 ) for more growth.",
        "Want to put your ad here? Join the [support server](https://discord.gg/KgKJka3jE2) and make a ticket!",
        "[Universal](https://discord.gg/AbwuPSTWhx) [Chatterbox](https://discord.com/application-directory/1367705149216391229): Connect Discord, Revolt & Guilded seamlessly! Chat across platforms, share media, and unite your communities with one powerful bot. #CrossPlatform"
    ]

    return randomAd[Math.floor(Math.random() * randomAd.length)];
}

module.exports = { randomAd }
