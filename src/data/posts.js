// src/data/posts.js
import { translateObject } from "../contexts/TranslationContext";
import { getCollection } from "../services/firestore";

// Static fallback data - sample posts
const postsBase = [
    {
        id: 'post-1',
        title: 'How I Built This OS-Style Portfolio',
        excerpt: 'A deep dive into creating an interactive desktop experience using React, Framer Motion, and modern web technologies.',
        content: `
# Building an OS-Style Portfolio

This portfolio was built with the goal of creating something unique and memorable. Instead of a traditional portfolio layout, I wanted to recreate the familiar experience of using a desktop operating system.

## Tech Stack
- **React 18** for component architecture
- **Framer Motion** for smooth animations
- **Tailwind CSS** for styling
- **Vite** for blazing fast development

## Key Features
1. Draggable windows with minimize/maximize
2. Functional taskbar with system tray
3. Desktop icons with context menus
4. Voice commands integration
5. Achievement system for engagement

Stay tuned for more technical deep-dives!
    `.trim(),
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
        category: 'Tech',
        date: '2026-01-30',
        readTime: 5,
        featured: true,
        externalLink: null, // null = show in-app, or set LinkedIn URL
    },
    {
        id: 'post-2',
        title: 'My Journey as a Software Developer',
        excerpt: 'From learning HTML basics to building full-stack applications — lessons learned along the way.',
        content: `
# My Journey as a Developer

It all started with curiosity about how websites work. Today, I'm building complex systems that serve real users.

## The Beginning
I remember my first "Hello World" — it felt magical seeing code come to life in the browser.

## Key Milestones
- First freelance project
- Building real-world applications
- Contributing to open source
- Leading development teams

## What I've Learned
1. **Never stop learning** — technology evolves fast
2. **Build, build, build** — experience beats theory
3. **Community matters** — connect with other developers
4. **Soft skills count** — communication is key

The journey continues...
    `.trim(),
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
        category: 'Life',
        date: '2026-01-25',
        readTime: 4,
        featured: false,
        externalLink: null,
    },
    {
        id: 'post-3',
        title: 'Building Scalable Systems with Next.js',
        excerpt: 'Best practices for architecting Next.js applications that can handle thousands of users.',
        content: `
# Scalable Next.js Architecture

After building several production applications, here are patterns that work.

## Key Principles
1. **Separation of Concerns** — keep logic modular
2. **Caching Strategy** — leverage ISR and SWR
3. **Database Optimization** — index wisely
4. **Error Boundaries** — fail gracefully

## Folder Structure
\`\`\`
src/
├── app/          # App Router pages
├── components/   # Reusable UI
├── lib/          # Utilities
├── services/     # API calls
└── hooks/        # Custom hooks
\`\`\`

## Performance Tips
- Use dynamic imports for code splitting
- Optimize images with next/image
- Implement skeleton loading states
- Monitor with analytics

Happy coding!
    `.trim(),
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
        category: 'Tech',
        date: '2026-01-20',
        readTime: 6,
        featured: false,
        externalLink: null,
    },
    {
        id: 'post-4',
        title: 'Why I Love Open Source',
        excerpt: 'Contributing to open source has transformed my career and connected me with amazing developers worldwide.',
        content: `
# Open Source Changed My Life

Open source is more than free software — it's a community and a mindset.

## Benefits I've Experienced
- **Learning** from world-class developers
- **Networking** with the global community
- **Building** a public portfolio
- **Giving back** to tools I use daily

## Getting Started
1. Find projects you use and love
2. Start with documentation fixes
3. Move to small bug fixes
4. Eventually tackle features

## My Contributions
- Bug fixes in popular libraries
- Documentation improvements
- Small utility packages

Join the movement! 🚀
    `.trim(),
        image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&q=80',
        category: 'Life',
        date: '2026-01-15',
        readTime: 3,
        featured: false,
        externalLink: null,
    },
];

// Cache for fetched data
let cachedPosts = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper for timeout
const withTimeout = (promise, ms) => {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out')), ms)
        )
    ]);
};

// Function to get posts (tries Firestore first, falls back to static)
export const getPosts = async (currentLanguage = "en") => {
    // Check cache
    if (cachedPosts && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)) {
        return translateData(cachedPosts, currentLanguage);
    }

    // Default placeholder images for posts without images
    const defaultImages = [
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
        'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&q=80',
    ];

    try {
        const firestoreData = await withTimeout(
            getCollection('posts', { orderByField: 'date', orderDirection: 'desc' }),
            1500
        );

        if (firestoreData && firestoreData.length > 0) {
            // Filter only published posts for frontend
            const publishedPosts = firestoreData.filter(post => post.published !== false);

            // Add default images to posts without images
            const postsWithImages = publishedPosts.map((post, index) => ({
                ...post,
                image: post.image || defaultImages[index % defaultImages.length]
            }));

            cachedPosts = postsWithImages;
            cacheTimestamp = Date.now();
            return translateData(postsWithImages, currentLanguage);
        }
    } catch (error) {
        if (error.message !== 'Request timed out') {
            console.warn('Failed to fetch posts from Firestore, using fallback:', error);
        }
    }

    // Fallback to static data
    return translateData(postsBase, currentLanguage);
};

// Synchronous version for components that can't use async
export const getPostsSync = (currentLanguage = "en") => {
    if (cachedPosts) {
        return translateData(cachedPosts, currentLanguage);
    }
    return translateData(postsBase, currentLanguage);
};

// Get featured post
export const getFeaturedPost = async (currentLanguage = "en") => {
    const posts = await getPosts(currentLanguage);
    return posts.find(p => p.featured) || posts[0];
};

// Get post by ID
export const getPostById = async (id, currentLanguage = "en") => {
    const posts = await getPosts(currentLanguage);
    return posts.find(p => p.id === id);
};

// Get posts by category
export const getPostsByCategory = async (category, currentLanguage = "en") => {
    const posts = await getPosts(currentLanguage);
    if (category === 'All') return posts;
    return posts.filter(p => p.category === category);
};

// Get all categories
export const getCategories = async () => {
    const posts = await getPosts();
    const categories = [...new Set(posts.map(p => p.category))];
    return ['All', ...categories];
};

// Helper to translate data
const translateData = (data, language) => {
    if (language === "en") return data;
    return translateObject(data, language);
};

// Clear cache to force re-fetch
export const clearPostsCache = () => {
    cachedPosts = null;
    cacheTimestamp = null;
};

// Initialize cache on module load
getPosts().catch(() => { });
