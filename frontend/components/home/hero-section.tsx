'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  TrendingUpIcon, 
  ClockIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

const trendingKeywords = [
  'Artificial Intelligence',
  'Climate Change',
  'Cryptocurrency',
  'Space Exploration',
  'Quantum Computing',
  'Renewable Energy',
  'Biotechnology',
  'Virtual Reality',
];

export function HeroSection() {
  const [currentKeyword, setCurrentKeyword] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentKeyword((prev) => (prev + 1) % trendingKeywords.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-accent-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-brand-200/20 blur-3xl dark:bg-brand-800/20" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent-200/20 blur-3xl dark:bg-accent-800/20" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="inline-flex items-center rounded-full bg-brand-100 px-4 py-2 text-sm font-medium text-brand-800 dark:bg-brand-900/50 dark:text-brand-200">
              <SparklesIcon className="mr-2 h-4 w-4" />
              AI-Powered Content Platform
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl dark:text-neutral-100"
          >
            Discover What's{' '}
            <span className="relative">
              <span className="gradient-text">Trending</span>
              <motion.div
                className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-brand-500 to-accent-500"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </span>
          </motion.h1>

          {/* Animated keyword */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-xl text-neutral-600 dark:text-neutral-400 sm:text-2xl"
          >
            Stay ahead with AI-generated insights on{' '}
            <motion.span
              key={currentKeyword}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="font-semibold text-brand-600 dark:text-brand-400"
            >
              {trendingKeywords[currentKeyword]}
            </motion.span>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-400"
          >
            Get the latest trending articles powered by AI, covering technology, business, health, 
            and more. Join thousands of readers staying informed with TrendWise.
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10"
          >
            <form onSubmit={handleSearch} className="mx-auto max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <input
                  type="search"
                  placeholder="Search trending topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-neutral-300 bg-white/80 py-4 pl-12 pr-32 text-neutral-900 placeholder-neutral-500 backdrop-blur-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-100 dark:placeholder-neutral-400 dark:focus:border-brand-400"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-brand-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                  Search
                </button>
              </div>
            </form>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
          >
            <Link
              href="/trending"
              className="group inline-flex items-center rounded-full bg-brand-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-brand-700 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              <TrendingUpIcon className="mr-2 h-5 w-5" />
              Explore Trending
              <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link
              href="/category/technology"
              className="group inline-flex items-center rounded-full border border-neutral-300 bg-white/80 px-8 py-4 text-lg font-semibold text-neutral-700 backdrop-blur-sm transition-all duration-200 hover:bg-neutral-50 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 dark:border-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              <ClockIcon className="mr-2 h-5 w-5" />
              Latest Articles
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">10K+</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Articles Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">50+</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Trending Topics Daily</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">24/7</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">AI Content Updates</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-6 w-4 rounded-full border-2 border-neutral-400 dark:border-neutral-600"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mx-auto mt-1 h-2 w-1 rounded-full bg-neutral-400 dark:bg-neutral-600"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

