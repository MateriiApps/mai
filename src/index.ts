import { GatewayIntentBits as GatewayIntents, Options } from 'discord.js'
import { LogLevel, SapphireClient } from "@sapphire/framework";
import { initAndroidxTimer } from "./androidx";
import { PlainLogger } from "./utils/logger";

const loggerLevel = LogLevel[process.env.LOG_LEVEL || "Info"] ?? null;
if (loggerLevel === null) throw "invalid env LOG_LEVEL";

const client = new SapphireClient({
    defaultPrefix: ["v", "m", "~"],
    loadMessageCommandListeners: true,
    caseInsensitiveCommands: true,
    caseInsensitivePrefixes: true,
    intents: [
        GatewayIntents.Guilds,
        GatewayIntents.GuildMembers,
        GatewayIntents.GuildMessages,
        GatewayIntents.MessageContent
    ],
    makeCache: Options.cacheWithLimits({
        GuildMemberManager: 10,
        MessageManager: 0,
    }),
    logger: { instance: new PlainLogger(loggerLevel) },
})

process.on("uncaughtException", client.logger.error);
process.on("unhandledRejection", client.logger.error);

client.on("ready", initAndroidxTimer)

if (!process.env.DISCORD_TOKEN) throw "missing env DISCORD_TOKEN";
await client.login(process.env.DISCORD_TOKEN);
