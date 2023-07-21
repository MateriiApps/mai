// noinspection JSUnusedGlobalSymbols

import { ApplicationCommandRegistry, Args, Command } from "@sapphire/framework";
import { ChatInputCommandInteraction, Message, TextChannel } from "discord.js";
import { sleep } from "../util.js";

export class Purge extends Command {
    public constructor(ctx: Command.Context, options: Command.Options) {
        super(ctx, {
            ...options,
            name: "purge",
            aliases: ["prune", "delete", "nuke"],
            description: "Purge up to 100 messages at once",
            runIn: "GUILD_ANY",
            requiredClientPermissions: ["ManageMessages"],
            requiredUserPermissions: ["ManageMessages"],
        });
    }

    override async registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand(builder => builder
            .setName(this.name)
            .setDescription(this.description)
            .addIntegerOption(option => option
                .setName("count")
                .setDescription("The amount of messages to delete")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
            .addBooleanOption(option => option
                .setName("silent")
                .setDescription("Make this interaction ephemeral")))
    }

    // FIXME: doesn't get called for some reason
    override async messageRun(message: Message, args: Args) {
        console.log("here");
        const count = (await args.pickResult('integer')).unwrapOr(0)
        if (count < 1 || count > 100) return;

        const deleted = (await (message.channel as TextChannel).bulkDelete(count)).size;

        const replyMsg = await message.channel.send(`Deleted ${deleted} messages!`);
        await sleep(2000);

        await replyMsg.delete().catch(_ => null);
    }

    override async chatInputRun(interaction: ChatInputCommandInteraction) {
        const count = interaction.options.getInteger("count", true);
        const silent = interaction.options.getBoolean("silent") ?? false;

        // If send non-ephemeral then it gets purged too
        if (silent) {
            await interaction.deferReply({
                ephemeral: true,
            });
        }

        const deleted = (await (interaction.channel as TextChannel).bulkDelete(count)).size;
        const reply = `Deleted ${deleted} messages!`;

        if (silent) {
            await interaction.editReply(reply);
        } else {
            const response = await interaction.reply(reply);
            await sleep(2000);

            const replyMsg = await response.fetch().catch(_ => null);
            if (!replyMsg) return;

            await interaction.deleteReply(replyMsg).catch(_ => null);
        }
    }
}
