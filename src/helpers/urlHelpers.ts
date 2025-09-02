export type UrlPart = QueryParams | Other;

type QueryParams = {
    type: "query";
    key: string;
    value: string;
    start: number;
    end: number;
};

type Other = {
    type: "other";
    value: string;
    start: number;
    end: number;
};

export type ParsedUrl = {
    parts: UrlPart[];
    normalisedUrl: string;
};

export function parseUrl(urlStr: string): ParsedUrl | null {
    try {
        const parsedUrl = new URL(urlStr);
        const normalisedUrl = urlStr.toString();

        if (!parsedUrl.search) {
            return { parts: [{ type: "other", value: normalisedUrl, start: 0, end: normalisedUrl.length }], normalisedUrl };
        }

        const parts: UrlPart[] = [];

        const [before, after] = normalisedUrl.split(parsedUrl.search);
        parts.push({ type: "other", value: before, start: 0, end: before.length });

        // Path + ?
        let startSearchParams = before.length + 1;
        for (const queryParam of parsedUrl.search.substring(1).split("&")) {
            const [key, value] = queryParam.split("=");
            const endPos = startSearchParams + queryParam.length;
            parts.push({ type: "query", key, value, start: startSearchParams, end: endPos });
            startSearchParams = endPos;
        }

        if (after) parts.push({ type: "other", value: after, start: after.length, end: after.length });

        return { parts, normalisedUrl };
    } catch (error) {
        console.error("Invalid URL:", error);
        return null;
    }
}
