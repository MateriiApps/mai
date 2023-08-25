# mai

the cutest materii bot

This is a specialized bot for the Materii discord so you likely will find no purpose for it.

## Running

### Docker

Soon.

### Manually

```shell
$ git clone https://github.com/MateriiApps/mai
$ npm i -g pnpm # pnpm better
$ pnpm i
# Set all env vars
$ export xxx=yyy
$ pnpm start
```

## Config

| name               | type        | description                                           |
|--------------------|-------------|-------------------------------------------------------|
| `DISCORD_TOKEN`    | string      | Discord bot token                                     |
| `GITHUB_TOKEN`     | string      | Readonly Github PAT for fetching MateriiApps info     |
| `OWNERS`           | Snowflake[] | User id list separated by comma                       |
| `ANDROIDX_CHANNEL` | Snowflake   | Channel id for sending androidx release changelogs in |
| `ANDROIDX_ROLE`    | Snowflake   | Role id to mention with the aforementioned changelogs |
| `AGE_REQUIREMENT`  | string      | Account age requirement to not be kicked. ex. `2d`    |
