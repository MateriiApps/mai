// noinspection JSUnusedGlobalSymbols

import { ApplicationCommandRegistry, Args, Command, MessageCommand } from "@sapphire/framework";
import { ChatInputCommandInteraction, Message } from "discord.js";

export class Ping extends Command {
    public constructor(ctx: Command.Context, options: Command.Options) {
        super(ctx, {
            ...options,
            name: "ping",
            aliases: ["wing"],
            description: "ping pong wing wong",
        });
    }

    override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand(builder => builder
            .setName(this.name)
            .setDescription(this.description))
    }

    override async messageRun(message: Message, _: Args, context: MessageCommand.RunContext) {
        const pongContent = context.commandName === "wing" ? "Wong" : "Pong";

        const startTime = Date.now();
        const reply = await message.reply({ content: pongContent });
        const elapsedTime = (Date.now() - startTime) / 2;

        await reply.edit(`${pongContent}! ${~~elapsedTime}ms`)
    }

    override async chatInputRun(interaction: ChatInputCommandInteraction) {
        const startTime = Date.now();
        const reply = await interaction.deferReply({ ephemeral: true });
        const elapsedTime = Date.now() - startTime;

        await reply.edit(`Pong! ${~~elapsedTime}ms`)
    }
}
