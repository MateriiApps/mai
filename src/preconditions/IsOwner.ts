import { Command, Precondition } from "@sapphire/framework";
import { CommandInteraction, Message, Snowflake } from "discord.js";
import * as process from "process";
import ContextMenuCommandInteraction = Command.ContextMenuCommandInteraction;

if (!process.env.OWNERS) throw "missing env OWNERS";
const OWNERS = (process.env.OWNERS as string).split(",");

export class IsOwner extends Precondition {
    public override async messageRun(message: Message) {
        return this.checkOwner(message.author.id);
    }

    public override async chatInputRun(interaction: CommandInteraction) {
        return this.checkOwner(interaction.user.id);
    }

    public override async contextMenuRun(interaction: ContextMenuCommandInteraction) {
        return this.checkOwner(interaction.user.id);
    }

    private async checkOwner(userId: Snowflake) {
        return OWNERS.includes(userId)
            ? this.ok()
            : this.error();
    }
}

declare module '@sapphire/framework' {
    // noinspection JSUnusedGlobalSymbols
    interface Preconditions {
        "IsOwner": never;
    }
}
