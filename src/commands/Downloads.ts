// noinspection JSUnusedGlobalSymbols

import { ApplicationCommandRegistry, Command } from "@sapphire/framework";
import { ChatInputCommandInteraction } from "discord.js";
import * as process from "process";
import shortNumber from "short-number";
import { numberWithCommas } from "../util";

const APPS = [
    "OpenCord",
    "Gloom",
    "Dimett",
    "Upvote",
];

export class Downloads extends Command {
    public constructor(ctx: Command.LoaderContext, options: Command.Options) {
        super(ctx, {
            ...options,
            name: "downloads",
            description: "Retrieve the download counts for our apps.",
            requiredClientPermissions: ["SendMessages"],
        });
    }

    override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand(builder => builder
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option => option
                .setName("app")
                .setDescription("The app to retrieve the total download count for.")
                .setRequired(true)
                .setChoices(...APPS.map(o => ({ name: o, value: o }))))
            .addBooleanOption(option => option
                .setName("silent")
                .setDescription("Make this interaction ephemeral")))
    }

    override async chatInputRun(interaction: ChatInputCommandInteraction) {
        const silent = interaction.options.getBoolean("silent") ?? false;
        const app = interaction.options.getString("app", true);
        const owner = "MateriiApps";

        await interaction.deferReply({
            ephemeral: silent,
        });

        try {
            var count = await this.fetchDownloadCount(owner, app);
        } catch (e) {
            await interaction.editReply("An error has occurred!");
            throw e;
        }

        const repoIdent = `${owner}/${app}`;
        if (count === null) {
            var reply = `${repoIdent} does not exist!`;
        } else {
            const url = `<https://github.com/${repoIdent}>`;
            var reply = `[${repoIdent}](${url}) ${shortNumber(count)} (${numberWithCommas(count)})`;
        }

        await interaction.editReply(reply);
    }

    private async fetchDownloadCount(owner: string, repo: string, cursor?: string): Promise<number | null> {
        const gql = `
          query ($owner: String!, $repo: String!, $cursor: String) {
            repository(owner: $owner, name: $repo) {
              releases(first: 100, after: $cursor, orderBy: { field: CREATED_AT, direction: DESC }) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  releaseAssets(first: 100) {
                    nodes {
                      downloadCount
                    }
                  }
                }
              }
            }
          }
        `;

        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        if (!GITHUB_TOKEN) throw "missing env GITHUB_TOKEN";

        const res: any = await fetch("https://api.github.com/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GITHUB_TOKEN}`,
            },
            body: JSON.stringify({
                query: gql,
                variables: { owner, repo, cursor }
            }),
        }).then(r => r.json());

        const repository = res.data.repository;
        if (!repository) return null;

        const downloadCount = repository.releases.nodes.reduce(
            (acc: number, release: any) => acc + release.releaseAssets.nodes.reduce(
                (acc: number, asset: any) => acc + (asset.downloadCount ?? 0), 0), 0);
        const { hasNextPage, endCursor: nextCursor } = repository.releases.pageInfo;

        if (hasNextPage) {
            return downloadCount + await this.fetchDownloadCount(owner, repo, nextCursor);
        } else {
            return downloadCount;
        }
    }
}
