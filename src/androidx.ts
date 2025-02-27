import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { Element, xml2js } from "xml-js";
import { parse } from "node-html-parser";
import * as process from "process";

const ANDROIDX_CHANNEL = process.env.ANDROIDX_CHANNEL!;
const ANDROIDX_NOTIFICATIONS_ROLE = process.env.ANDROIDX_ROLE!;

if (!ANDROIDX_CHANNEL || !ANDROIDX_NOTIFICATIONS_ROLE) throw "missing env ANDROIDX_CHANNEL or ANDROIDX_NOTIFICATIONS_ROLE";

export function initAndroidxTimer(discord: Client) {
    const HALF_DAY = 1000 * 60 * 60 * 12;
    setInterval(function run() {
        checkRss(discord).catch(e => console.error("Failed to process androidx rss!", e))
        return run;
    }(), HALF_DAY)
}

async function checkRss(discord: Client) {
    console.log("Checking androidx release notes");

    // Fetch channel
    const androidxChannel = await discord.channels.fetch(ANDROIDX_CHANNEL) as TextChannel

    const xml = await fetch("https://developer.android.com/feeds/androidx-release-notes.xml")
        .then(r => r.text())
        .then(txt => xml2js(txt));

    // Extract root elements
    const feed = (xml.elements as Element[])
        .find(e => e.name === "feed")!
        .elements!;
    const updatedAt = feed
        .find(e => e.name === "updated")!
        .elements![0].text as string;
    const entry = feed.find(e => e.name === "entry")!;

    // Extract latest entry data
    const title = entry.elements!
        .find(e => e.name === "title")!
        .elements![0].text as string;
    const url = entry.elements!
        .find(e => e.name === "link")!
        .attributes!["href"] as string;
    const html = entry.elements!
        .find(e => e.name === "content" && e.attributes!["type"] === "html")!
        .elements![0].cdata as string;

    // Check if the channel already contains the latest notes based on topic
    const newTopic = `Last update: ${updatedAt}`;
    if (androidxChannel.topic === newTopic) return;

    // Extract the changelog items
    const changelog = parse(html).querySelectorAll("ul > li > a")
        .map(el => `- [${el.innerText}](${el.attributes["href"]})`)
        .join("\n")

    // Split the description to remain under the embed character limit
    const embeds: string[] = [""];
    for (const line of `**${title}**\n\n${changelog}`.split("\n")) {
        const lastEmbed = embeds.at(-1)!;

        if (lastEmbed.length + 1 + line.length <= 4096) {
            embeds[embeds.length - 1] = lastEmbed + "\n" + line;
        } else {
            embeds.push(line);
        }
    }

    // Post update to channel
    for (const [i, embedContent] of embeds.entries()) {
        const embed = new EmbedBuilder()
            .setTitle(i == 0 ? "Found a new update!" : null)
            .setURL(url)
            .setDescription(embedContent);
        await androidxChannel.send({
            content: i == 0 ? `<@&${ANDROIDX_NOTIFICATIONS_ROLE}>` : undefined,
            embeds: [embed],
            allowedMentions: {
                roles: [ANDROIDX_NOTIFICATIONS_ROLE],
            },
        });
    }

    await androidxChannel.setTopic(newTopic);

    console.log("Posted new androidx changelog!");
}
