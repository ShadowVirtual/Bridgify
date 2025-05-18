const { ShardingManager } = require("discord.js");
const path = require("path");
require("dotenv").config();

// Configuration
const SHARD_SETTINGS = {
    totalShards: 1,
    token: process.env.botToken,
    respawn: true,
    timeout: -1, // Disable timeout
    waitForReady: true,
    retryDelay: 5000,
    retryLimit: 3
};

class EnhancedShardingManager {
    constructor() {
        this.manager = new ShardingManager(path.join(__dirname, "./bot.js"), SHARD_SETTINGS);
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Shard creation logging
        this.manager.on("shardCreate", shard => {
            console.log(`[BRIDGIFY] >>> Launched shard ${shard.id}`);

            // Handle shard-specific events
            shard.on("ready", () => {
                console.log(`[BRIDGIFY] >>> Shard ${shard.id} is ready`);
            });

            shard.on("disconnect", () => {
                console.warn(`[BRIDGIFY] >>> Shard ${shard.id} disconnected. Attempting to reconnect...`);
            });

            shard.on("reconnecting", () => {
                console.log(`[BRIDGIFY] >>> Shard ${shard.id} is reconnecting...`);
            });

            shard.on("death", (process) => {
                console.error(`[BRIDGIFY] >>> Shard ${shard.id} died with exit code: ${process.exitCode}`);
                if (process.exitCode === null) {
                    console.warn(`[BRIDGIFY] >>> Shard ${shard.id} exited with null exit code. Possible timeout.`);
                }
            });

            shard.on("error", (error) => {
                console.error(`[BRIDGIFY] >>> Shard ${shard.id} encountered error:`, error);
            });
        });
    }

    async spawn() {
        try {
            // Spawn with extended timeout and retry logic
            const shards = await this.manager.spawn({
                amount: SHARD_SETTINGS.totalShards,
                delay: 15500,
                timeout: 120000, // 2 minutes
                retryLimit: SHARD_SETTINGS.retryLimit
            });

            console.log(`[BRIDGIFY] >>> Successfully spawned ${shards.size} shards`);
            return shards;

        } catch (error) {
            console.error('[BRIDGIFY] >>> Error spawning shards:', error);
            
            if (error.message.includes('ShardingReadyTimeout')) {
                console.log('[BRIDGIFY] >>> Attempting to recover from timeout...');
                await this.handleTimeoutError();
            } else {
                throw error;
            }
        }
    }

    async handleTimeoutError() {
        console.log('[BRIDGIFY] >>> Running timeout recovery procedure...');

        try {
            // Kill all existing shards
            await this.manager.broadcastEval('process.exit()').catch(() => null);

            // Wait a moment before respawning
            await new Promise(resolve => setTimeout(resolve, 10000));

            // Attempt to respawn shards
            console.log('[BRIDGIFY] >>> Respawning shards...');
            return await this.spawn();

        } catch (error) {
            console.error('[BRIDGIFY] >>> Recovery failed:', error);
            throw error;
        }
    }
}

// Create and start the manager
const shardManager = new EnhancedShardingManager();

// Initialize with error handling
(async () => {
    try {
        await shardManager.spawn();
    } catch (error) {
        console.error('[BRIDGIFY] >>> Fatal error in shard manager:', error);
        process.exit(1);
    }
})();

// Handle process errors
process.on('unhandledRejection', error => {
    console.error('[BRIDGIFY] >>> Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('[BRIDGIFY] >>> Uncaught exception:', error);
});
