// Vercel Serverless Function - Post Metadata API
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

export default async function handler(req, res) {
    const { slug } = req.query;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (!slug) {
        return res.status(400).json({ error: 'Slug is required' });
    }

    try {
        // Try to find post by slug field first
        const slugQuery = await db.collection('posts')
            .where('slug', '==', slug)
            .where('published', '!=', false)
            .limit(1)
            .get();

        let postData = null;

        if (!slugQuery.empty) {
            postData = slugQuery.docs[0].data();
        } else {
            // Fallback: try to get by document ID
            const docRef = db.collection('posts').doc(slug);
            const docSnap = await docRef.get();

            if (docSnap.exists) {
                const data = docSnap.data();
                if (data.published !== false) {
                    postData = data;
                }
            }
        }

        if (!postData) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Return only necessary metadata for social preview
        return res.status(200).json({
            title: postData.title || 'Blog Post',
            excerpt: postData.excerpt || '',
            image: postData.image || '',
            date: postData.date || new Date().toISOString(),
            slug: postData.slug || slug
        });

    } catch (error) {
        console.error('Error fetching post metadata:', error);
        return res.status(500).json({ error: 'Failed to fetch post metadata' });
    }
}
