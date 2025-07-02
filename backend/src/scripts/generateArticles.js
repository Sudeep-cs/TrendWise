#!/usr/bin/env node

import dotenv from 'dotenv';
import database from '../utils/database.js';
import ArticleService from '../services/articleService.js';
import TrendService from '../services/trendService.js';
import { createLogger } from '../utils/logger.js';

// Load environment variables
dotenv.config();

const logger = createLogger('GenerateArticlesScript');
const articleService = new ArticleService();
const trendService = new TrendService();

/**
 * Generate articles from trending topics
 */
async function generateArticles(options = {}) {
  try {
    logger.info('Starting article generation process...');

    // Connect to database
    await database.connect();
    logger.info('Database connected');

    // Default configuration
    const config = {
      maxArticles: parseInt(process.env.MAX_ARTICLES_PER_RUN) || 3,
      categories: process.env.ARTICLE_CATEGORIES 
        ? process.env.ARTICLE_CATEGORIES.split(',')
        : ['technology', 'business', 'health'],
      geo: process.env.TRENDS_GEO || 'US',
      useCache: process.env.USE_TRENDS_CACHE !== 'false',
      wordCount: parseInt(process.env.ARTICLE_WORD_COUNT) || 1200,
      tone: process.env.ARTICLE_TONE || 'informative',
      ...options
    };

    logger.info('Generation configuration:', config);

    // Check if we should use cached trends
    let trends = [];
    if (config.useCache) {
      trends = await loadCachedTrends();
    }

    // Fetch fresh trends if no cache or cache is empty
    if (trends.length === 0) {
      logger.info('Fetching fresh trends...');
      trends = await trendService.getAllTrends({
        includeGoogle: true,
        includeTwitter: true,
        includeReddit: false,
        geo: config.geo,
        limit: config.maxArticles * 3 // Get more trends to choose from
      });
    }

    if (trends.length === 0) {
      logger.warn('No trends available for article generation');
      return [];
    }

    logger.info(`Using ${trends.length} trends for article generation`);

    // Filter trends by categories if specified
    const filteredTrends = config.categories.length > 0
      ? trends.filter(trend => config.categories.includes(trend.category))
      : trends;

    if (filteredTrends.length === 0) {
      logger.warn(`No trends found for categories: ${config.categories.join(', ')}`);
      return [];
    }

    // Select top trends for article generation
    const selectedTrends = filteredTrends.slice(0, config.maxArticles);
    logger.info(`Selected ${selectedTrends.length} trends for article generation:`);
    selectedTrends.forEach((trend, index) => {
      logger.info(`${index + 1}. ${trend.keyword} (${trend.source}, score: ${trend.trendScore})`);
    });

    // Generate articles
    const articles = await articleService.generateArticlesFromTrends({
      maxArticles: config.maxArticles,
      categories: config.categories,
      trends: selectedTrends
    });

    if (articles.length === 0) {
      logger.warn('No articles were generated');
      return [];
    }

    logger.info(`Successfully generated ${articles.length} articles:`);
    articles.forEach((article, index) => {
      logger.info(`${index + 1}. ${article.title} (${article.category})`);
    });

    // Save generation report
    await saveGenerationReport(articles, selectedTrends, config);

    logger.info('Article generation process completed successfully');
    return articles;

  } catch (error) {
    logger.error('Error in article generation process:', error);
    throw error;
  } finally {
    await database.disconnect();
    await trendService.closeBrowser();
  }
}

/**
 * Load cached trends from file
 */
async function loadCachedTrends() {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const cacheFile = path.join(process.cwd(), 'cache', 'trends.json');
    
    // Check if cache file exists
    try {
      await fs.access(cacheFile);
    } catch {
      logger.info('No trends cache file found');
      return [];
    }

    const cacheData = JSON.parse(await fs.readFile(cacheFile, 'utf8'));
    const cacheAge = Date.now() - new Date(cacheData.fetchedAt).getTime();
    const maxCacheAge = 2 * 60 * 60 * 1000; // 2 hours

    if (cacheAge > maxCacheAge) {
      logger.info('Trends cache is too old, will fetch fresh trends');
      return [];
    }

    logger.info(`Loaded ${cacheData.trends.length} trends from cache (age: ${Math.floor(cacheAge / 1000 / 60)} minutes)`);
    return cacheData.trends;

  } catch (error) {
    logger.error('Error loading cached trends:', error);
    return [];
  }
}

/**
 * Save generation report
 */
async function saveGenerationReport(articles, trends, config) {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const reportsDir = path.join(process.cwd(), 'reports');
    await fs.mkdir(reportsDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportsDir, `generation-report-${timestamp}.json`);
    
    const report = {
      timestamp: new Date().toISOString(),
      config: config,
      trendsUsed: trends.map(t => ({
        keyword: t.keyword,
        source: t.source,
        category: t.category,
        trendScore: t.trendScore
      })),
      articlesGenerated: articles.map(a => ({
        title: a.title,
        slug: a.slug,
        category: a.category,
        wordCount: a.content.split(' ').length,
        tags: a.tags
      })),
      summary: {
        trendsProcessed: trends.length,
        articlesGenerated: articles.length,
        successRate: `${Math.round((articles.length / trends.length) * 100)}%`
      }
    };
    
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    logger.info(`Generation report saved to ${reportFile}`);

  } catch (error) {
    logger.error('Error saving generation report:', error);
  }
}

/**
 * Clean up old articles (maintenance task)
 */
async function cleanupOldArticles() {
  try {
    logger.info('Starting article cleanup...');
    
    const daysOld = parseInt(process.env.CLEANUP_DAYS_OLD) || 365;
    const deletedCount = await articleService.cleanupOldArticles(daysOld);
    
    logger.info(`Cleaned up ${deletedCount} old articles`);
    
  } catch (error) {
    logger.error('Error in article cleanup:', error);
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const options = {};
    let command = 'generate';
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === '--cleanup') {
        command = 'cleanup';
      } else if (arg.startsWith('--')) {
        const key = arg.replace('--', '');
        const value = args[i + 1];
        
        if (key === 'max-articles') options.maxArticles = parseInt(value);
        else if (key === 'categories') options.categories = value.split(',');
        else if (key === 'geo') options.geo = value;
        else if (key === 'word-count') options.wordCount = parseInt(value);
        else if (key === 'tone') options.tone = value;
        else if (key === 'no-cache') options.useCache = false;
        
        i++; // Skip the value
      }
    }

    if (command === 'cleanup') {
      await cleanupOldArticles();
    } else {
      const articles = await generateArticles(options);
      
      if (articles.length > 0) {
        logger.info(`\nGenerated articles:`);
        articles.forEach((article, index) => {
          logger.info(`${index + 1}. ${article.title}`);
          logger.info(`   Category: ${article.category}`);
          logger.info(`   Slug: ${article.slug}`);
          logger.info(`   Word count: ${article.content.split(' ').length}`);
          logger.info('');
        });
      }
    }
    
    logger.info('Script completed successfully');
    process.exit(0);
    
  } catch (error) {
    logger.error('Script failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await database.disconnect();
  await trendService.closeBrowser();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await database.disconnect();
  await trendService.closeBrowser();
  process.exit(0);
});

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateArticles };

