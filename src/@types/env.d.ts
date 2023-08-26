// noinspection JSUnusedGlobalSymbols

declare namespace NodeJS {
    export interface ProcessEnv {
        DISCORD_TOKEN?: string;
        GITHUB_TOKEN?: string;
        OWNERS?: string;
        ANDROIDX_CHANNEL?: string;
        ANDROIDX_ROLE?: string;
        AGE_REQUIREMENT?: string;
        LOG_LEVEL?: string;
    }
}
