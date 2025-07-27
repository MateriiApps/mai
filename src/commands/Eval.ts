// noinspection JSUnusedGlobalSymbols

import { Args, Command } from "@sapphire/framework";
import { IsOwner } from "../preconditions/IsOwner";
import { codeBlock, Message } from "discord.js";
import { inspect } from "util";
import { log } from "node:console"

// Credit: https://codeberg.org/Ven/Vaius/src/commit/cd42a0ec59b03783cec678c911651f3ef02174ad/src/commands/eval.ts

export class Eval extends Command {
    public constructor(ctx: Command.LoaderContext, options: Command.Options) {
        super(ctx, {
            ...options,
            name: "eval",
            preconditions: ["IsOwner"],
            requiredClientPermissions: ["SendMessages"],
        });
    }

    override async messageRun(message: Message, args: Args) {
        if (!message.channel.isSendable()) return;
        await message.channel.sendTyping();

        let code = await args.rest('string').catch(_ => null);
        if (!code) return;
        if (code.includes("await")) code = `(async () => { ${code} })()`;

        log(`Running eval by ${message.author.username} (${message.author.id}): ${code}`);

        // Provide utils in eval context
        const console: any = {
            _lines: [] as string[],
            _log(...things: string[]) {
                this._lines.push(
                    ...things
                        .map(x => inspect(x, { getters: true }))
                        .join(" ")
                        .split("\n")
                );
            }
        };
        console.log = console.error = console.warn = console.info = console._log.bind(console);
        // noinspection JSUnusedLocalSymbols
        const { client, channel, author, content, guild, member } = message;
        // noinspection JSUnusedLocalSymbols
        const Discord = await import("discord.js");

        let result: any;
        try {
            result = await eval(code)
        } catch (e: any) {
            result = e;
        }

        let output = codeBlock(inspect(result).slice(0, 1990));

        const consoleOutput = console._lines.join("\n").slice(0, Math.max(0, 1990 - output.length));
        if (consoleOutput) output += `\n${codeBlock(consoleOutput)}`;

        await message.reply(output);
    }
}
