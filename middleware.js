// Vercel Edge Middleware - Bot Detection & Prerendering
import { NextResponse } from 'next/server';

// Social media bot user agents
const BOT_UA_PATTERNS = [
    'facebookexternalhit',
    'Facebot',
    'Twitterbot',
    'WhatsApp',
    'TelegramBot',
    'LinkedInBot',
    'Slackbot',
    'Discordbot',
    'SkypeUriPreview',
    'redditbot',
    'Pinterestbot'
];

export async function middleware(request) {
    const { pathname } = request.nextUrl;
    const userAgent = request.headers.get('user-agent') || '';

    // Only intercept /blog/* routes
    if (!pathname.startsWith('/blog/') || pathname === '/blog/') {
        return NextResponse.next();
    }

    // Check if it's a bot
    const isBot = BOT_UA_PATTERNS.some(pattern =>
        userAgent.toLowerCase().includes(pattern.toLowerCase())
    );

    if (!isBot) {
        return NextResponse.next();
    }

    // Extract slug from /blog/my-post-slug
    const slug = pathname.replace('/blog/', '');

    try {
        // Fetch post metadata from our API
        const baseUrl = request.nextUrl.origin;
        const metaResponse = await fetch(`${baseUrl}/api/post-meta/${slug}`, {
            headers: { 'x-middleware': 'true' }
        });

        if (!metaResponse.ok) {
            return NextResponse.next();
        }

        const postMeta = await metaResponse.json();

        // Generate static HTML with proper meta tags
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- Primary Meta Tags -->
  <title>${postMeta.title} — David Garcia Saragih</title>
  <meta name="title" content="${postMeta.title} — David Garcia Saragih" />
  <meta name="description" content="${postMeta.excerpt}" />
  <link rel="canonical" href="https://davidgrcias-github-io.vercel.app/blog/${slug}" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://davidgrcias-github-io.vercel.app/blog/${slug}" />
  <meta property="og:title" content="${postMeta.title} — David Garcia Saragih" />
  <meta property="og:description" content="${postMeta.excerpt}" />
  <meta property="og:image" content="${postMeta.image || 'https://davidgrcias-github-io.vercel.app/komilet.png'}" />
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://davidgrcias-github-io.vercel.app/blog/${slug}" />
  <meta property="twitter:title" content="${postMeta.title} — David Garcia Saragih" />
  <meta property="twitter:description" content="${postMeta.excerpt}" />
  <meta property="twitter:image" content="${postMeta.image || 'https://davidgrcias-github-io.vercel.app/komilet.png'}" />
  
  <!-- Redirect to full app after bots read meta -->
  <meta http-equiv="refresh" content="0;url=https://davidgrcias-github-io.vercel.app/blog/${slug}" />
</head>
<body>
  <h1>${postMeta.title}</h1>
  <p>${postMeta.excerpt}</p>
  <p>Redirecting to full article...</p>
</body>
</html>`;

        return new NextResponse(html, {
            headers: {
                'content-type': 'text/html',
                'cache-control': 'public, max-age=3600, s-maxage=3600'
            }
        });

    } catch (error) {
        console.error('Middleware error:', error);
        return NextResponse.next();
    }
}

// Configure which routes the middleware runs on
export const config = {
    matcher: '/blog/:slug*'
};
