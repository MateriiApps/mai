// noinspection JSUnusedGlobalSymbols

import { Events, Listener } from "@sapphire/framework";
import { Message } from "discord.js";
import { readdir, readFile } from "node:fs/promises";

// Credit: https://codeberg.org/Ven/Vaius/src/commit/cd42a0ec59b03783cec678c911651f3ef02174ad/src/moderate.ts

export class ImageHostsListener extends Listener {
    imageHostRegex?: RegExp

    public constructor(ctx: Listener.LoaderContext, options: Listener.Options) {
        super(ctx, {
            ...options,
            event: Events.MessageCreate,
        });

        (async () => {
            await this.loadImageHosts();
        })();
    }

    async loadImageHosts() {
        const files = (await readdir("./data/domains"))
            .filter(f => f.endsWith(".txt"));

        const lines = await Promise.all(files.map(async file => {
            const path = `./data/domains/${file}`;
            const content = await readFile(path, "utf-8");
            return content
                .trim()
                .split("\n")
                .filter(Boolean);
        }))

        const domainRegex = /[-[\]{}()*+?.,\\^$|#\s]/g;
        const domains = lines
            .flat()
            .map(d => d.replace(domainRegex, "\\$&"));

        this.imageHostRegex = new RegExp(`https?://(\\w+\\.)?(${domains.join("|")})`, "i");
        console.log(`Loaded ${domains.length} dumb image hosts`);
    }

    override async run(message: Message) {
        if (!this.imageHostRegex?.test(message.content)) return;

        await message.delete().catch(_ => null);
        await message.author.send("cdn.discordapp.com is a free and great way to share images! (please stop using stupid image hosts)")
            .catch(_ => null)
    }
}
