const { Events, ActivityType, REST, Routes } = require("discord.js");
const { db } = require("../database");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const token = process.env.botToken;
const clientId = process.env.CLIENT_ID;
const supportServer = "1205936602787094589";

const commands = [];
const devCommands = [];

// Function to recursively load commands
function loadCommands(dir, commandList) {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
            loadCommands(fullPath, commandList);
        } else if (item.isFile() && item.name.endsWith(".js")) {
            const command = require(fullPath);
            if (command?.data) {
                commandList.push(command.data.toJSON());
                console.log(`[COMMAND] Loaded: ${item.name}`);
            } else {
                console.warn(`[WARNING] Skipping invalid command file: ${item.name}`);
            }
        }
    }
}

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log("[BOT] Client is ready!");
        
    // Load commands from the commands folder (including subdirectories)
    loadCommands(path.join(__dirname, "..", "/src/commands"), commands);

    // Load dev commands (non-recursive, assuming no subfolders in devCommands)
    const devCommandsPath = path.join(__dirname, "..", "/src/devCommands");
    const devCommandFiles = fs.readdirSync(devCommandsPath).filter(file => file.endsWith(".js"));

    for (const file of devCommandFiles) {
        const devCommand = require(path.join(devCommandsPath, file));
        if (devCommand?.data) {
            devCommands.push(devCommand.data.toJSON());
            console.log(`[DEV COMMAND] Loaded: ${file}`);
        } else {
            console.warn(`[WARNING] Skipping invalid dev command file: ${file}`);
        }
    }

    // Register commands
    const rest = new REST({ version: "10" }).setToken(token);

    try {
        console.log(`[DISCORD] Registering ${commands.length} global commands...`);
        await rest.put(Routes.applicationCommands(clientId), { body: commands });

        console.log(`[DISCORD] Registering ${devCommands.length} dev commands for guild ${supportServer}...`);
        await rest.put(Routes.applicationGuildCommands(clientId, supportServer), { body: devCommands });

        console.log("[DISCORD] Commands successfully registered.");
    } catch (error) {
        console.error("[ERROR] Failed to register commands:", error);
    }
    }
};
