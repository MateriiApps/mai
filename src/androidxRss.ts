import { AttachmentBuilder, Client, EmbedBuilder, TextChannel } from "discord.js";
import { Element, xml2js } from "xml-js";
import nodeHtmlToImage from "node-html-to-image";

const ANDROIDX_CHANNEL = "1131820006208979047";
const ANDROIDX_NOTIFICATIONS_ROLE = "1131999257294028950";

export function initAndroidxRssTimer(discord: Client) {
    const HALF_DAY = 1000 * 60 * 60 * 12;
    setInterval(function run() {
        checkRss(discord).catch(e => console.error("Failed to process androidx rss!", e))
        return run;
    }(), HALF_DAY)
}

async function checkRss(discord: Client) {
    console.log("Checking androidx rss");

    // Fetch channel
    const androidxChannel = await discord.channels.fetch(ANDROIDX_CHANNEL)
        .catch(_ => console.error("Unable to get androidx channel!")) as TextChannel;
    if (!androidxChannel) return;
    await androidxChannel.sendTyping();

    const xml = await fetch("https://developer.android.com/feeds/androidx-release-notes.xml")
        .then(r => r.text())
        .then(txt => xml2js(txt))
        .catch(console.error)
    if (!xml) return;

    try {
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

        // Render the html to an image
        const image = await renderHtml(html);

        // Post update to channel
        const attachment = new AttachmentBuilder(image, { name: "changelog.png" });
        const embed = new EmbedBuilder()
            .setTitle("Found a new update!")
            .setDescription(title)
            .setURL(url)
            .setImage("attachment://changelog.png");
        await androidxChannel.send({
            content: `<@&${ANDROIDX_NOTIFICATIONS_ROLE}>`,
            embeds: [embed],
            files: [attachment],
            allowedMentions: {
                roles: [ANDROIDX_NOTIFICATIONS_ROLE],
            },
        });
        await androidxChannel.setTopic(newTopic);

        console.log("Posted new androidx update!");
    } catch (e) {
        console.error(e);
    }
}

async function renderHtml(html: string): Promise<Buffer> {
    const styles: string = `<style>
        a {
            color: white;
            text-decoration: none;
            font-family: Arial,sans-serif;
            font-size: 1.5em;
        }
        ul {
            list-style: none;
        }
        li::before {
            content: "\\2022";
            color: lightgray;
            font-weight: bold;
            display: inline-block;
            width: 1em;
            font-size: 2em;
            margin-left: -1em;
        }
    </style>`;

    return await nodeHtmlToImage({
        type: "png",
        transparent: true,
        waitUntil: "domcontentloaded",
        selector: "ul",
        html: styles + html,
    }) as Buffer;
}
