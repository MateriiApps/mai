import { Command, Precondition } from "@sapphire/framework";
import { CommandInteraction, Message, Snowflake } from "discord.js";
import ContextMenuCommandInteraction = Command.ContextMenuCommandInteraction;

const OWNERS = [
    "295190422244950017", // Wing
    "423915768191647755", // Xinto
    "295190422244950017", // rushii
]

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
    interface Preconditions {
        "IsOwner": never;
    }
}
