import sanitize from "sanitize-filename";
import { readdir, readFile } from "node:fs/promises";

const INLINE_LINK_REGEX = /\[(.+?)\]\((.+?)\)/g;

export async function getFaq(name: string, stripInlineLinks: boolean = false): Promise<string | null> {
    const path = `./data/faq/${sanitize(name)}.md`

    try {
        let content = await readFile(path, "utf-8");

        if (stripInlineLinks) {
            content = content.replaceAll(INLINE_LINK_REGEX, "$1: $2");
        }

        return content
    } catch (_) {
        return null
    }
}

export async function getAllFaqs(): Promise<string[]> {
    return (await readdir("./data/faq"))
        .filter(f => f.endsWith(".md"))
        .map(f => f.slice(0, -3))
}
