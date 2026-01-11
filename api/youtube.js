// Vercel Serverless Function - Proxy to YouTube Data API
// This keeps the API key secure on the server side

export default async function handler(req, res) {
    // CORS Headers for cross-origin requests
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Only allow GET
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { channelId } = req.query;
    if (!channelId) {
        return res.status(400).json({ error: "Channel ID is required" });
    }

    // API Key stored securely in Vercel Environment Variables
    const API_KEY = process.env.YOUTUBE_API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ error: "YouTube API key not configured on server" });
    }

    try {
        const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            return res.status(404).json({ error: "Channel not found" });
        }

        const stats = data.items[0].statistics;
        return res.status(200).json({
            subscriberCount: stats.subscriberCount,
            viewCount: stats.viewCount,
            videoCount: stats.videoCount,
        });
    } catch (error) {
        console.error("YouTube API Error:", error);
        return res.status(500).json({ error: error.message || "YouTube API error" });
    }
}
