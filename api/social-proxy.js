import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    } catch (error) {
        console.error('Firebase Admin initialization error:', error);
    }
}

const db = admin.firestore();

const BOT_UA_PATTERNS = [
    'facebookexternalhit',
    'facebot',
    'twitterbot',
    'whatsapp',
    'telegrambot',
    'linkedinbot',
    'slackbot',
    'discordbot',
    'skypeuripreview',
    'redditbot',
    'pinterestbot'
];

export default async function handler(req, res) {
    const { slug } = req.query;
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const isBot = BOT_UA_PATTERNS.some(pattern => userAgent.includes(pattern));

    // 1. IF BOT: Fetch Data & Serve HTML
    if (isBot && slug) {
        try {
            let postData = null;

            // Try slug first
            const slugQuery = await db.collection('posts')
                .where('slug', '==', slug)
                .where('published', '!=', false)
                .limit(1)
                .get();

            if (!slugQuery.empty) {
                postData = slugQuery.docs[0].data();
            } else {
                // Try ID
                const docRef = db.collection('posts').doc(slug);
                const docSnap = await docRef.get();
                if (docSnap.exists && docSnap.data().published !== false) {
                    postData = docSnap.data();
                }
            }

            if (postData) {
                const title = postData.title || 'Blog Post';
                const excerpt = postData.excerpt || 'Read this post on David Garcia Saragih portfolio.';
                const image = postData.image || 'https://davidgrcias-github-io.vercel.app/komilet.png';
                const url = `https://davidgrcias-github-io.vercel.app/blog/${slug}`;

                const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title} — David Garcia Saragih</title>
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${title} — David Garcia Saragih" />
  <meta property="og:description" content="${excerpt}" />
  <meta property="og:image" content="${image}" />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:title" content="${title} — David Garcia Saragih" />
  <meta property="twitter:description" content="${excerpt}" />
  <meta property="twitter:image" content="${image}" />
  <meta http-equiv="refresh" content="0;url=${url}" />
</head>
<body>
  <h1>${title}</h1>
  <p>${excerpt}</p>
  <img src="${image}" alt="${title}" style="max-width:100%;" />
</body>
</html>`;

                res.setHeader('Content-Type', 'text/html');
                res.setHeader('Cache-Control', 'public, max-age=3600');
                return res.send(html);
            }
        } catch (error) {
            console.error('Social Proxy Error:', error);
        }
    }

    // 2. IF HUMAN (or Bot fallback): Redirect to SPA
    // Since we are inside a rewriting rule, we must serve content or redirect loop?
    // If we redirect to /blog/slug, Vercel Rewrite rule triggers again -> Loop.

    // Solution: Serve the 'index.html' content directly.
    try {
        // Fetch index.html from deployment public URL
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['host'];
        // Append random query param to bust cache? No, index.html should be cached.
        const listUrl = `${protocol}://${host}/index.html`;

        const response = await fetch(listUrl);
        if (!response.ok) throw new Error('Failed to fetch index.html');

        const indexHtml = await response.text();
        res.setHeader('Content-Type', 'text/html');
        return res.send(indexHtml);
    } catch (error) {
        console.error('Index fetch error:', error);
        return res.status(500).send('<h1>500 Error Loading App</h1><p>Please refresh.</p>');
    }
}
