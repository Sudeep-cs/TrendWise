import { NextRequest, NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const robotsTxt = `# TrendWise Robots.txt
# Generated automatically

User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /_next/
Disallow: /private/

# Allow specific API endpoints for SEO
Allow: /api/sitemap
Allow: /api/rss

# Crawl delay (optional)
Crawl-delay: 1

# Sitemap location
Sitemap: ${SITE_URL}/sitemap.xml

# Additional sitemaps
Sitemap: ${SITE_URL}/sitemap-articles.xml
Sitemap: ${SITE_URL}/sitemap-categories.xml

# Google-specific directives
User-agent: Googlebot
Allow: /
Crawl-delay: 1

# Bing-specific directives
User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Social media crawlers
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

# SEO tools
User-agent: AhrefsBot
Allow: /

User-agent: SemrushBot
Allow: /

User-agent: MJ12bot
Allow: /

# Block unwanted bots
User-agent: SemrushBot-SA
Disallow: /

User-agent: AhrefsBot
Crawl-delay: 10

User-agent: MJ12bot
Crawl-delay: 10

# Block AI training bots (optional)
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

# Archive crawlers
User-agent: ia_archiver
Allow: /

User-agent: Wayback
Allow: /

# News crawlers
User-agent: Googlebot-News
Allow: /
Crawl-delay: 1

# Image crawlers
User-agent: Googlebot-Image
Allow: /

# Video crawlers
User-agent: Googlebot-Video
Allow: /

# Mobile crawlers
User-agent: Googlebot-Mobile
Allow: /

# Block spam bots
User-agent: SiteBot
Disallow: /

User-agent: WebCopier
Disallow: /

User-agent: WebZIP
Disallow: /

User-agent: larbin
Disallow: /

User-agent: b2w/0.1
Disallow: /

User-agent: psbot
Disallow: /

User-agent: Python-urllib
Disallow: /

User-agent: netEstate NE Crawler
Disallow: /

User-agent: Wget
Disallow: /

User-agent: curl
Disallow: /

# Host directive (if needed)
# Host: ${SITE_URL.replace(/^https?:\/\//, '')}

# Clean-param directive for dynamic URLs
Clean-param: utm_source&utm_medium&utm_campaign&utm_term&utm_content

# Additional notes:
# This robots.txt file is generated dynamically
# Last updated: ${new Date().toISOString()}
# Contact: hello@trendwise.com`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
    },
  });
}

