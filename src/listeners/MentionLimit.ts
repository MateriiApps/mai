// noinspection JSUnusedGlobalSymbols

import { Events, Listener } from "@sapphire/framework";
import { Message, Snowflake } from "discord.js";
import parseDuration from "parse-duration";

const SUS_AGE_LIMIT = parseDuration("1", "week")!;
const SUS_MENTION_COUNT = 10;

export class MentionLimit extends Listener {
    // Author user id -> mention count
    readonly MENTIONS: Record<Snowflake, number> = {};

    public constructor(ctx: Listener.Context, options: Listener.Options) {
        super(ctx, {
            ...options,
            event: Events.MessageCreate,
        });

        setInterval(() => {
            for (const user in this.MENTIONS) {
                let count = this.MENTIONS[user] -= 5;
                if (count <= 0) delete this.MENTIONS[user];
            }
        }, parseDuration("30m"));
    }

    override async run(message: Message<true>) {
        if (message.author.bot) return;
        if (!message.inGuild()) return;

        let newMentions = message.mentions.roles.size + message.mentions.users.size;
        if (!newMentions) return;

        if (message.member!.permissions.has("ManageMessages")) return;

        if (Date.now() - message.member!.joinedTimestamp! <= SUS_AGE_LIMIT) {
            const id = message.author.id;
            const count = !this.MENTIONS[id]
                ? this.MENTIONS[id] = 1
                : this.MENTIONS[id] += newMentions;

            if (count >= SUS_MENTION_COUNT) {
                delete this.MENTIONS[id];
                await message.member!.ban({
                    deleteMessageSeconds: 600,
                    reason: "Low join age; too many mentions",
                });
            }
        }
    }
}
