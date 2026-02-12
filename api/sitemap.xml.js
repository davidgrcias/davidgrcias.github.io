// Vercel Serverless Function - Dynamic Sitemap Generation
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK (uses service account from environment variables)
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
const BASE_URL = 'https://davidgrcias-github-io.vercel.app';

// Static routes with priorities
const staticRoutes = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/blog', priority: '0.9', changefreq: 'daily' },
    { path: '/portfolio', priority: '0.9', changefreq: 'weekly' },
    { path: '/about', priority: '0.8', changefreq: 'monthly' },
    { path: '/projects', priority: '0.8', changefreq: 'weekly' },
    { path: '/terminal', priority: '0.6', changefreq: 'monthly' },
    { path: '/files', priority: '0.5', changefreq: 'monthly' },
    { path: '/notes', priority: '0.5', changefreq: 'monthly' },
    { path: '/chat', priority: '0.7', changefreq: 'monthly' },
];

export default async function handler(req, res) {
    // Set proper headers
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');

    try {
        // Fetch published blog posts from Firestore
        const postsSnapshot = await db.collection('posts')
            .where('published', '!=', false)
            .orderBy('published')
            .orderBy('date', 'desc')
            .get();

        const blogPosts = [];
        postsSnapshot.forEach(doc => {
            const post = doc.data();
            // Use slug if available, otherwise use document ID
            const slug = post.slug || doc.id;
            blogPosts.push({
                path: `/blog/${slug}`,
                lastmod: post.date || new Date().toISOString().split('T')[0],
                priority: '0.8',
                changefreq: 'monthly'
            });
        });

        // Generate XML sitemap
        const currentDate = new Date().toISOString().split('T')[0];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes.map(route => `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
${blogPosts.map(post => `  <url>
    <loc>${BASE_URL}${post.path}</loc>
    <lastmod>${post.lastmod}</lastmod>
    <changefreq>${post.changefreq}</changefreq>
    <priority>${post.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

        return res.status(200).send(xml);
    } catch (error) {
        console.error('Sitemap generation error:', error);

        // Return fallback sitemap with just static routes if Firestore fails
        const currentDate = new Date().toISOString().split('T')[0];
        const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes.map(route => `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

        return res.status(200).send(fallbackXml);
    }
}
