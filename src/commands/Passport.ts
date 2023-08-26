// noinspection JSUnusedGlobalSymbols

import { ApplicationCommandRegistry, Args, Command } from "@sapphire/framework";
import { ChatInputCommandInteraction, Message, Snowflake } from "discord.js";
import snowflakeRegexModule from "snowflake-regex";

// @ts-ignore Broken typings
const snowflakeRegex = snowflakeRegexModule.default;

export const PASSPORT_USERS: Snowflake[] = [];

export class Passport extends Command {
    public constructor(ctx: Command.Context, options: Command.Options) {
        super(ctx, {
            ...options,
            name: "passport",
            description: "Temporarily whitelist a user from all automod on join.",
            requiredClientPermissions: ["SendMessages"],
        });
    }

    override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand(builder => builder
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option => option
                .setName("id")
                .setDescription("The target user id")
                .setRequired(true)));
    }

    override async messageRun(message: Message, args: Args) {
        const rawId = await args.pickResult("string")
            .then(r => r.unwrapOr(null));

        if (!rawId) {
            return await message.reply("No user id supplied!");
        }

        if (!snowflakeRegex.test(rawId)) {
            return await message.reply("Supplied user id is invalid!");
        }

        PASSPORT_USERS.push(rawId);
    }

    override async chatInputRun(interaction: ChatInputCommandInteraction) {
        const rawId = interaction.options.getString("id", true);

        if (!snowflakeRegex.test(rawId)) {
            return await interaction.reply({
                content: "Supplied user id is invalid!",
                ephemeral: true,
            });
        }

        PASSPORT_USERS.push(rawId);
    }
}
