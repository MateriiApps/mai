// noinspection JSUnusedGlobalSymbols

import { Events, Listener } from "@sapphire/framework";
import { Message } from "discord.js";
import { readdir, readFile } from "node:fs/promises";
import parseDuration from "parse-duration";

interface FilterGroup {
    name: string;
    filters: Filter[];
}

type Filter = MatchFilter | RegexFilter;

interface MatchFilter {
    match: string;
    result: Result;
}

interface RegexFilter {
    regex: RegExp;
    result: Result;
}

type Result = { action: ResultAction.Mute, duration: string | null } |
    { action: Exclude<ResultAction, ResultAction.Mute> };

enum ResultAction {
    Delete,
    Mute,
    Kick,
    Ban,
}

export class MessageFilters extends Listener {
    readonly FILTERS: FilterGroup[] = [];

    public constructor(ctx: Listener.LoaderContext, options: Listener.Options) {
        super(ctx, {
            ...options,
            event: Events.MessageCreate,
        });

        (async () => await this.loadFilters())()
    }

    override async run(message: Message<true>) {
        if (message.author.bot) return;
        if (!message.inGuild()) return;
        if (!message.content.length) return;

        if (message.member!.permissions.has("ManageMessages")) return;

        for (const { name: groupName, filters } of this.FILTERS) {
            for (const filter of filters) {
                let matches = false;
                let filterName: string;

                if ("match" in filter) {
                    matches = message.content.includes(filter.match);
                    filterName = filter.match;
                } else {
                    matches = filter.regex.test(message.content);
                    filterName = filter.regex.source;
                }
                if (!matches) continue;

                const reason = `Triggered filter "${filterName}" from ${groupName}`;

                switch (filter.result.action) {
                    case ResultAction.Ban:
                        await message.member!.ban({ reason });
                        break;
                    case ResultAction.Kick:
                        await message.member!.kick(reason);
                        break;
                    case ResultAction.Mute:
                        const durationMs = parseDuration(filter.result.duration ?? "5m");
                        await message.member!.timeout(durationMs, reason);
                        break;
                }

                await message.delete();
            }
        }
    }

    private async loadFilters() {
        const files = (await readdir("./data/filters"))
            .filter(f => f.endsWith(".jsonl"));

        const groups: [string, Filter[]][] = await Promise.all(files.map(async file => {
            const path = `./data/filters/${file}`;
            const filters = (await readFile(path, "utf-8"))
                .trim()
                .split("\n")
                .filter(Boolean)
                .map(line => JSON.parse(line))
                .map((filter: any) => {
                    let action: ResultAction;
                    switch (filter.result.toLowerCase()) {
                        case "ban":
                            action = ResultAction.Ban;
                            break;
                        case "kick":
                            action = ResultAction.Kick;
                            break;
                        case "mute":
                            action = ResultAction.Mute;
                            break;
                        case "delete":
                            action = ResultAction.Delete;
                            break;
                        default:
                            throw `Invalid result type ${filter.result} in ${file}!`;
                    }

                    return {
                        result: {
                            action,
                            ...(action === ResultAction.Mute && { duration: filter.duration ?? null }),
                        },
                        ...(filter.match && { match: filter.match }),
                        ...(filter.regex && { regex: new RegExp(filter.regex, filter.flags) })
                    }
                });

            return [file, filters];
        }));

        for (const [group, filters] of groups) {
            this.FILTERS.push({
                name: group,
                filters: filters,
            })
        }
    }
}
