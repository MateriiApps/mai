import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits as GatewayIntents, Options } from 'discord.js'
import * as process from "process";
import { initAndroidxRssTimer } from "./androidxRss.js";

if (!process.env.TOKEN) throw "missing env variables";

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

client.on("ready", initAndroidxRssTimer)

await client.login(process.env.TOKEN);
