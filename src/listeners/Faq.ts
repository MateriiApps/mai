// noinspection JSUnusedGlobalSymbols

import { Events, Listener } from "@sapphire/framework";
import { Message } from "discord.js";
import { getFaq } from "../faq";

export class FaqListener extends Listener {
    public constructor(ctx: Listener.Context, options: Listener.Options) {
        super(ctx, {
            ...options,
            event: Events.MessageCreate,
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
