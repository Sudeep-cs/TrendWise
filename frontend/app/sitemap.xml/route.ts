import { NextRequest, NextResponse } from 'next/server';
import { articleApi } from '@/lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Static pages
const staticPages = [
  {
    url: '',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  },
  {
    url: '/about',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  },
  {
    url: '/contact',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  },
  {
    url: '/trending',
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  },
  {
    url: '/search',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  },
];

// Category pages
const categories = [
  'technology',
  'business',
  'health',
  'entertainment',
  'sports',
  'politics',
  'science',
  'lifestyle',
  'travel',
  'food',
  'fashion',
  'education',
  'finance',
  'environment',
];

const categoryPages = categories.map(category => ({
  url: `/category/${category}`,
  lastModified: new Date(),
  changeFrequency: 'daily' as const,
  priority: 0.8,
}));

export async function GET(request: NextRequest) {
  try {
    // Fetch articles for sitemap
    let articles: any[] = [];
    try {
      const response = await articleApi.getSitemapData();
      articles = response.data || [];
    } catch (error) {
      console.error('Error fetching articles for sitemap:', error);
      // Continue with empty articles array
    }

    // Generate article URLs
    const articlePages = articles.map(article => ({
      url: `/article/${article.slug}`,
      lastModified: new Date(article.lastModified || article.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Combine all pages
    const allPages = [...staticPages, ...categoryPages, ...articlePages];

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${allPages
  .map(
    page => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${page.lastModified.toISOString()}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return a basic sitemap with static pages only
    const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticPages, ...categoryPages]
  .map(
    page => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${page.lastModified.toISOString()}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    return new NextResponse(basicSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  }
}

