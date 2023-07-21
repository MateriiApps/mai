// noinspection JSUnusedGlobalSymbols

import { Listener } from "@sapphire/framework";
import { Message } from "discord.js";
import { getFaq } from "../faq.js";

export class FaqListener extends Listener {
    public constructor(ctx: Listener.Context, options: Listener.Options) {
        super(ctx, {
            ...options,
            event: "messageCreate",
        });
    }

    override async run(message: Message) {
        if (!message.content.startsWith("?")) return;

        const target = message.content.slice(1).trim();
        if (!target) return;

        const faq = await getFaq(target, true);
        if (!faq) return;

        await message.reply(faq);
    }
}
