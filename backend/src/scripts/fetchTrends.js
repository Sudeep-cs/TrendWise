#!/usr/bin/env node

import dotenv from 'dotenv';
import database from '../utils/database.js';
import TrendService from '../services/trendService.js';
import { createLogger } from '../utils/logger.js';

// Load environment variables
dotenv.config();

const logger = createLogger('FetchTrendsScript');
const trendService = new TrendService();

/**
 * Fetch trending topics and save to cache/database
 */
async function fetchTrends() {
  try {
    logger.info('Starting trend fetching process...');

    // Connect to database
    await database.connect();
    logger.info('Database connected');

    // Configuration
    const config = {
      includeGoogle: process.env.FETCH_GOOGLE_TRENDS !== 'false',
      includeTwitter: process.env.FETCH_TWITTER_TRENDS !== 'false',
      includeReddit: process.env.FETCH_REDDIT_TRENDS === 'true',
      geo: process.env.TRENDS_GEO || 'US',
      limit: parseInt(process.env.TRENDS_LIMIT) || 50,
      categories: process.env.TRENDS_CATEGORIES 
        ? process.env.TRENDS_CATEGORIES.split(',')
        : ['technology', 'business', 'health', 'entertainment']
    };

    logger.info('Fetch configuration:', config);

    // Fetch trends from all sources
    const allTrends = await trendService.getAllTrends(config);
    
    if (allTrends.length === 0) {
      logger.warn('No trends were fetched');
      return;
    }

    logger.info(`Successfully fetched ${allTrends.length} trending topics`);

    // Log top trends
    const topTrends = allTrends.slice(0, 10);
    logger.info('Top 10 trends:');
    topTrends.forEach((trend, index) => {
      logger.info(`${index + 1}. ${trend.keyword} (${trend.source}, score: ${trend.trendScore})`);
    });

    // Save trends to a JSON file for caching
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const cacheDir = path.join(process.cwd(), 'cache');
    await fs.mkdir(cacheDir, { recursive: true });
    
    const cacheFile = path.join(cacheDir, 'trends.json');
    const cacheData = {
      trends: allTrends,
      fetchedAt: new Date().toISOString(),
      config: config
    };
    
    await fs.writeFile(cacheFile, JSON.stringify(cacheData, null, 2));
    logger.info(`Trends cached to ${cacheFile}`);

    // Optionally save to database (implement if needed)
    // await saveTrendsToDatabase(allTrends);

    logger.info('Trend fetching process completed successfully');

  } catch (error) {
    logger.error('Error in trend fetching process:', error);
    throw error;
  } finally {
    await database.disconnect();
    await trendService.closeBrowser();
  }
}

/**
 * Save trends to database (optional)
 */
async function saveTrendsToDatabase(trends) {
  // This could be implemented to save trends to a dedicated collection
  // for historical analysis and tracking
  logger.info('Saving trends to database...');
  
  // Example implementation:
  // const TrendHistory = mongoose.model('TrendHistory');
  // await TrendHistory.create({
  //   trends: trends,
  //   fetchedAt: new Date(),
  //   source: 'automated'
  // });
  
  logger.info('Trends saved to database');
}

/**
 * Main execution
 */
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const options = {};
    
    for (let i = 0; i < args.length; i += 2) {
      const key = args[i].replace('--', '');
      const value = args[i + 1];
      options[key] = value;
    }

    // Override config with command line options
    if (options.geo) process.env.TRENDS_GEO = options.geo;
    if (options.limit) process.env.TRENDS_LIMIT = options.limit;
    if (options.categories) process.env.TRENDS_CATEGORIES = options.categories;

    await fetchTrends();
    
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

export { fetchTrends };

