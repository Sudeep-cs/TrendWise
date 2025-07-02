import { Metadata } from 'next';
import { HeroSection } from '@/components/home/hero-section';
import { FeaturedArticles } from '@/components/home/featured-articles';
import { TrendingTopics } from '@/components/home/trending-topics';
import { CategoryGrid } from '@/components/home/category-grid';
import { NewsletterSection } from '@/components/home/newsletter-section';
import { StatsSection } from '@/components/home/stats-section';

export const metadata: Metadata = {
  title: 'TrendWise - AI-Powered Blog Platform',
  description: 'Discover trending topics and AI-generated articles on technology, business, health, and more. Stay ahead with TrendWise.',
  openGraph: {
    title: 'TrendWise - AI-Powered Blog Platform',
    description: 'Discover trending topics and AI-generated articles on technology, business, health, and more.',
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrendWise - AI-Powered Blog Platform',
    description: 'Discover trending topics and AI-generated articles on technology, business, health, and more.',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Trending Topics */}
      <TrendingTopics />
      
      {/* Featured Articles */}
      <FeaturedArticles />
      
      {/* Category Grid */}
      <CategoryGrid />
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* Newsletter Section */}
      <NewsletterSection />
    </div>
  );
}

