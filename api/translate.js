// Vercel Serverless Function - Proxy to LibreTranslate

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { q, source = "en", target = "en" } = req.body || {};
    if (!q || !target) {
        return res.status(400).json({ error: "Missing translation payload" });
    }

    try {
        const response = await fetch("https://libretranslate.de/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ q, source, target, format: "text" }),
        });

        if (!response.ok) {
            const text = await response.text();
            return res.status(500).json({ error: "Translation failed", details: text });
        }

        const data = await response.json();
        return res.status(200).json({ translatedText: data.translatedText || q });
    } catch (error) {
        return res.status(500).json({ error: error.message || "Translation error" });
    }
}
