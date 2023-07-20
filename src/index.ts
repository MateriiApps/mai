import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits as GatewayIntents, Options } from 'discord.js'
import * as process from "process";

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
        GuildMemberManager: 0,
        MessageManager: 0,
    })
})

await client.login(process.env.TOKEN);
