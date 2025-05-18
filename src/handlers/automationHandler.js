const { autoPartner } = require("../automations/autoPartner");
const { autoAdvertise } = require("../automations/autoBump");
const { autoAdvertise2 } = require("../automations/autoAdvertise");
const { autoMass } = require("../automations/autoMass");

function startAutomations(client) {
  setInterval(() => {
    console.log("Triggering autoAdvertise...");
    autoAdvertise(client);
  }, 3600000); // 1 hour 3600000

  setInterval(() => {
    console.log("Triggering autoAdvertise2...");
    autoAdvertise2(client);
  }, 3600000); // 1 hour

  setInterval(() => {
    console.log("Triggering autoPartner...");
    autoPartner(client);
  }, 3600000 ); // 1 hour 

  setInterval(() => {
    console.log("Triggering autoMass...");
    autoMass(client);
  }, 14400000 ); // 4 hours 
}

module.exports = {startAutomations};
