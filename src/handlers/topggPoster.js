const { AutoPoster } = require("topgg-autoposter");
require("dotenv").config();

function startAutoPoster(client) {
  const poster = AutoPoster(process.env.TOPGG_TOKEN, client);

  poster.on("error", (error) => {
    console.log(`[ERROR] >>> ${error} while posting stats to Top.gg`);
  });

  poster.on("posted", () => {
    console.log(`[TOPGG] >>> Successfully posted stats to Top.gg`);
  });
}

module.exports = {startAutoPoster};
