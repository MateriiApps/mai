// noinspection JSUnusedGlobalSymbols

import { Events, Listener } from "@sapphire/framework";
import { GuildMember } from "discord.js";

export class NormalizeNick extends Listener {
    public constructor(ctx: Listener.Context, options: Listener.Options) {
        super(ctx, {
            ...options,
            event: Events.GuildMemberUpdate,
        });
    }

    override async run(_: any, member: GuildMember) {
        const me = member.guild.members.me;

        if (!member.nickname) return;
        if (member.roles.highest.rawPosition >= (me?.roles.highest.rawPosition ?? 0)) return;
        if (!me?.permissions?.has("ManageNicknames")) return;

        const normalized = member.nickname.normalize("NFKC");
        if (member.nickname === normalized) return;

        await member.setNickname(normalized, "Normalize nickname")
    }
}
