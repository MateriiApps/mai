// noinspection JSUnusedGlobalSymbols

import { ApplicationCommandRegistry, Args, ChatInputCommand, Command } from "@sapphire/framework";
import { ChatInputCommandInteraction, Message } from "discord.js";
import { getAllFaqs, getFaq } from "../faq.js";

export class Faq extends Command {
    public constructor(ctx: Command.Context, options: Command.Options) {
        super(ctx, {
            ...options,
            name: "faq",
            description: "Retrieve an faq",
            requiredClientPermissions: ["SendMessages"],
        });
    }

    override async registerApplicationCommands(registry: ApplicationCommandRegistry) {
        const choices = (await getAllFaqs()).map(faq => ({
            name: faq,
            value: faq,
        }));

        registry.registerChatInputCommand(builder => builder
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option => option
                .setName("name")
                .setDescription("The name of the faq to retrieve")
                .setRequired(true)
                .setChoices(...choices)));
    }

    override async messageRun(message: Message, args: Args) {
        const target = (await args.pickResult('string')).unwrapOr(null)
        if (!target) return;

        const reply = await getFaq(target, true) || "No such faq found!";
        await message.reply(reply);
    }

    override async chatInputRun(interaction: ChatInputCommandInteraction, context: ChatInputCommand.RunContext) {
        const target = interaction.options.getString("name", true);

        const faq = await getFaq(target);

        if (!faq) {
            await interaction.reply({
                content: "No such faq found!",
                ephemeral: true,
            });
        } else {
            await interaction.reply(faq);
        }
    }
}
