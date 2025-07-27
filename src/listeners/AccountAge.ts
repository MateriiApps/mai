// noinspection JSUnusedGlobalSymbols

import { Events, Listener } from "@sapphire/framework";
import { GuildMember, time, TimestampStyles } from "discord.js";
import parseDuration from 'parse-duration'
import * as process from "process";
import { PASSPORT_USERS } from "../commands/Passport";

export class AccountAge extends Listener {
    public constructor(ctx: Listener.LoaderContext, options: Listener.Options) {
        super(ctx, {
            ...options,
            event: Events.GuildMemberAdd,
        });
    }

    override async run(member: GuildMember) {
        if (PASSPORT_USERS.includes(member.id)) return;

        const rawRequirement = process.env.AGE_REQUIREMENT;
        if (!rawRequirement) throw "missing env AGE_REQUIREMENT";

        const ageRequirementMs = parseDuration(rawRequirement);
        if (!ageRequirementMs) throw "invalid env AGE_REQUIREMENT";

        const created = member.user.createdTimestamp;
        const now = Date.now()

        if (now - created < ageRequirementMs) {
            const timestamp = now + (ageRequirementMs - (now - created))
            const msg = `Your account is too new! Please come back ${time(timestamp, TimestampStyles.RelativeTime)}.\n` +
                "This has been implemented to avoid spam and bots.";

            await member.send(msg).catch(_ => null);
            await member.kick("Account age too low");
        }
    }
}
