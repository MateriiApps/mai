import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits as GatewayIntents, Options } from 'discord.js'
import { initAndroidxTimer } from "./androidx";

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

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
    })
})

client.on("ready", initAndroidxTimer)

if (!process.env.TOKEN) throw "missing env variables";
await client.login(process.env.TOKEN);
