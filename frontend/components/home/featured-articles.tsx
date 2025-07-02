'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  EyeIcon, 
  ChatBubbleLeftIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { formatRelativeTime, calculateReadingTime } from '@/lib/utils';
import { articleApi } from '@/lib/api';
import type { Article } from '@/types/article';

// Mock data for development
const mockArticles: Article[] = [
  {
    _id: '1',
    title: 'The Future of Artificial Intelligence in Healthcare',
    slug: 'future-ai-healthcare',
    content: 'Artificial intelligence is revolutionizing healthcare...',
    excerpt: 'Discover how AI is transforming medical diagnosis, treatment, and patient care in ways we never imagined possible.',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
      alt: 'AI in Healthcare',
    },
    category: 'technology',
    tags: ['AI', 'Healthcare', 'Technology'],
    status: 'published',
    isAIGenerated: true,
    stats: {
      views: 15420,
      likes: 234,
      shares: 89,
      commentsCount: 45,
      readTime: 8,
    },
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastModified: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    seo: {
      metaTitle: 'The Future of AI in Healthcare',
      metaDescription: 'Discover how AI is transforming medical diagnosis and treatment.',
    },
  },
  {
    _id: '2',
    title: 'Sustainable Energy Solutions for 2024',
    slug: 'sustainable-energy-2024',
    content: 'The renewable energy sector is experiencing unprecedented growth...',
    excerpt: 'Explore the latest breakthroughs in renewable energy technology and their impact on our sustainable future.',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=400&fit=crop',
      alt: 'Renewable Energy',
    },
    category: 'business',
    tags: ['Energy', 'Sustainability', 'Environment'],
    status: 'published',
    isAIGenerated: true,
    stats: {
      views: 12890,
      likes: 189,
      shares: 67,
      commentsCount: 32,
      readTime: 6,
    },
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    lastModified: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    seo: {
      metaTitle: 'Sustainable Energy Solutions for 2024',
      metaDescription: 'Latest breakthroughs in renewable energy technology.',
    },
  },
  {
    _id: '3',
    title: 'Mental Health in the Digital Age',
    slug: 'mental-health-digital-age',
    content: 'As our lives become increasingly digital...',
    excerpt: 'Understanding the impact of technology on mental health and strategies for maintaining wellbeing in a connected world.',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=400&fit=crop',
      alt: 'Mental Health',
    },
    category: 'health',
    tags: ['Mental Health', 'Technology', 'Wellbeing'],
    status: 'published',
    isAIGenerated: true,
    stats: {
      views: 9876,
      likes: 156,
      shares: 43,
      commentsCount: 28,
      readTime: 5,
    },
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastModified: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    seo: {
      metaTitle: 'Mental Health in the Digital Age',
      metaDescription: 'Impact of technology on mental health and wellbeing strategies.',
    },
  },
];

export function FeaturedArticles() {
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFeaturedArticles = async () => {
      try {
        setLoading(true);
        // In production, this would fetch from the API
        // const response = await articleApi.getTrending(6);
        // setArticles(response.data);
        
        // For now, use mock data
        setArticles(mockArticles);
      } catch (error) {
        console.error('Error fetching featured articles:', error);
        // Fallback to mock data
        setArticles(mockArticles);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedArticles();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  if (loading) {
    return (
      <section className="py-24 bg-white dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mx-auto mb-4" />
            <div className="h-4 w-96 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mx-auto" />
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-video bg-neutral-200 dark:bg-neutral-700 rounded-lg mb-4" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-4" />
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div variants={itemVariants} className="mb-4">
            <div className="inline-flex items-center rounded-full bg-brand-100 px-4 py-2 text-sm font-medium text-brand-800 dark:bg-brand-900/50 dark:text-brand-200">
              <SparklesIcon className="mr-2 h-4 w-4" />
              Featured Content
            </div>
          </motion.div>
          
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-100"
          >
            Trending Articles
          </motion.h2>
          
          <motion.p
            variants={itemVariants}
            className="mt-4 text-lg leading-8 text-neutral-600 dark:text-neutral-400"
          >
            Discover the most popular AI-generated articles covering the latest trends and insights
            across technology, business, health, and more.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3"
        >
          {articles.map((article, index) => (
            <motion.article
              key={article._id}
              variants={itemVariants}
              className="group relative flex flex-col items-start"
            >
              <Link href={`/article/${article.slug}`} className="block w-full">
                <div className="relative w-full">
                  {article.featuredImage && (
                    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                      <Image
                        src={article.featuredImage.url}
                        alt={article.featuredImage.alt}
                        width={800}
                        height={400}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  
                  {/* Category badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-neutral-900 backdrop-blur-sm dark:bg-neutral-900/90 dark:text-neutral-100">
                      {article.category}
                    </span>
                  </div>

                  {/* AI badge */}
                  {article.isAIGenerated && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center rounded-full bg-brand-600/90 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                        <SparklesIcon className="mr-1 h-3 w-3" />
                        AI
                      </span>
                    </div>
                  )}
                </div>

                <div className="max-w-xl">
                  <div className="mt-8 flex items-center gap-x-4 text-xs">
                    <time
                      dateTime={article.publishedAt}
                      className="text-neutral-500 dark:text-neutral-400"
                    >
                      {formatRelativeTime(article.publishedAt)}
                    </time>
                    <div className="flex items-center gap-x-2 text-neutral-500 dark:text-neutral-400">
                      <ClockIcon className="h-3 w-3" />
                      {article.stats.readTime} min read
                    </div>
                  </div>
                  
                  <div className="group relative">
                    <h3 className="mt-3 text-lg font-semibold leading-6 text-neutral-900 group-hover:text-brand-600 dark:text-neutral-100 dark:group-hover:text-brand-400">
                      {article.title}
                    </h3>
                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                      {article.excerpt}
                    </p>
                  </div>
                  
                  <div className="mt-6 flex items-center gap-x-4 text-xs text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center gap-x-1">
                      <EyeIcon className="h-3 w-3" />
                      {article.stats.views.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-x-1">
                      <ChatBubbleLeftIcon className="h-3 w-3" />
                      {article.stats.commentsCount}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <Link
            href="/articles"
            className="group inline-flex items-center rounded-full bg-brand-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-brand-700 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            View All Articles
            <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

