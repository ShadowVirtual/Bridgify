const fs = require("fs");
const path = require("path");

function startEvents(client) {
  const eventsPath = path.join(__dirname, "../events");
  const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".js"));

  console.log(`[DEBUG] Loading event files: ${eventFiles}`);

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    console.log(`[DEBUG] Registering event: ${event.name}`);

    const handler = (...args) => {
      console.log(`[DEBUG] Event triggered: ${event.name}`);
      event.execute(...args, client);
    };

    if (event.once) {
      client.once(event.name, handler);
    } else {
      client.on(event.name, handler);
    }
  }
}

module.exports = {startEvents};