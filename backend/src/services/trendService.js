import googleTrends from 'google-trends-api';
import puppeteer from 'puppeteer';
import axios from 'axios';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('TrendService');

class TrendService {
  constructor() {
    this.browser = null;
    this.categories = {
      'technology': 'TECHNOLOGY',
      'business': 'BUSINESS',
      'health': 'HEALTH',
      'entertainment': 'ENTERTAINMENT',
      'sports': 'SPORTS',
      'politics': 'POLITICS',
      'science': 'SCIENCE'
    };
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Fetch trending topics from Google Trends
   * @param {string} geo - Geographic location (default: 'US')
   * @param {string} category - Category filter
   * @returns {Promise<Array>} Array of trending topics
   */
  async fetchGoogleTrends(geo = 'US', category = null) {
    try {
      logger.info(`Fetching Google Trends for ${geo}${category ? ` in ${category}` : ''}`);
      
      const options = {
        geo: geo,
        hl: 'en-US',
        timezone: 360,
        category: category ? this.categories[category] : undefined
      };

      // Get daily trending searches
      const dailyTrends = await googleTrends.dailyTrends(options);
      const trendsData = JSON.parse(dailyTrends);
      
      const trends = [];
      
      if (trendsData.default && trendsData.default.trendingSearchesDays) {
        const latestDay = trendsData.default.trendingSearchesDays[0];
        
        if (latestDay && latestDay.trendingSearches) {
          for (const trend of latestDay.trendingSearches) {
            trends.push({
              keyword: trend.title.query,
              traffic: trend.formattedTraffic,
              relatedQueries: trend.relatedQueries?.map(q => q.query) || [],
              articles: trend.articles?.map(article => ({
                title: article.title,
                url: article.url,
                source: article.source,
                snippet: article.snippet
              })) || [],
              source: 'google-trends',
              category: category || 'general',
              fetchedAt: new Date(),
              trendScore: this.calculateTrendScore(trend.formattedTraffic)
            });
          }
        }
      }

      logger.info(`Fetched ${trends.length} trending topics from Google Trends`);
      return trends;
      
    } catch (error) {
      logger.error('Error fetching Google Trends:', error);
      throw new Error(`Failed to fetch Google Trends: ${error.message}`);
    }
  }

  /**
   * Fetch trending topics from Twitter/X using web scraping
   * @param {string} location - Location for trends
   * @returns {Promise<Array>} Array of trending topics
   */
  async fetchTwitterTrends(location = 'United States') {
    try {
      logger.info(`Fetching Twitter trends for ${location}`);
      
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigate to Twitter trends (public endpoint)
      await page.goto('https://trends24.in/united-states/', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Extract trending topics
      const trends = await page.evaluate(() => {
        const trendElements = document.querySelectorAll('.trend-card__list li');
        const trends = [];
        
        trendElements.forEach((element, index) => {
          if (index < 20) { // Limit to top 20
            const keyword = element.textContent?.trim();
            if (keyword && keyword.length > 2) {
              trends.push({
                keyword: keyword,
                position: index + 1,
                source: 'twitter',
                category: 'general',
                fetchedAt: new Date(),
                trendScore: Math.max(100 - (index * 5), 10) // Decreasing score by position
              });
            }
          }
        });
        
        return trends;
      });

      await page.close();
      
      logger.info(`Fetched ${trends.length} trending topics from Twitter`);
      return trends;
      
    } catch (error) {
      logger.error('Error fetching Twitter trends:', error);
      // Return empty array instead of throwing to not break the entire process
      return [];
    }
  }

  /**
   * Fetch trending topics from Reddit
   * @param {string} subreddit - Subreddit to fetch from (default: 'all')
   * @returns {Promise<Array>} Array of trending topics
   */
  async fetchRedditTrends(subreddit = 'all') {
    try {
      logger.info(`Fetching Reddit trends from r/${subreddit}`);
      
      const response = await axios.get(`https://www.reddit.com/r/${subreddit}/hot.json?limit=25`, {
        headers: {
          'User-Agent': 'TrendWise Bot 1.0'
        }
      });

      const posts = response.data.data.children;
      const trends = [];

      posts.forEach((post, index) => {
        const data = post.data;
        if (data.title && data.ups > 100) { // Filter by upvotes
          trends.push({
            keyword: data.title,
            traffic: `${data.ups} upvotes`,
            url: `https://reddit.com${data.permalink}`,
            subreddit: data.subreddit,
            source: 'reddit',
            category: this.mapSubredditToCategory(data.subreddit),
            fetchedAt: new Date(),
            trendScore: Math.min(data.ups / 100, 100) // Score based on upvotes
          });
        }
      });

      logger.info(`Fetched ${trends.length} trending topics from Reddit`);
      return trends;
      
    } catch (error) {
      logger.error('Error fetching Reddit trends:', error);
      return [];
    }
  }

  /**
   * Get comprehensive trending topics from multiple sources
   * @param {Object} options - Fetching options
   * @returns {Promise<Array>} Combined trending topics
   */
  async getAllTrends(options = {}) {
    const {
      includeGoogle = true,
      includeTwitter = true,
      includeReddit = true,
      geo = 'US',
      category = null,
      limit = 50
    } = options;

    try {
      logger.info('Fetching trends from all sources');
      
      const allTrends = [];
      
      // Fetch from Google Trends
      if (includeGoogle) {
        try {
          const googleTrends = await this.fetchGoogleTrends(geo, category);
          allTrends.push(...googleTrends);
        } catch (error) {
          logger.warn('Google Trends fetch failed:', error.message);
        }
      }

      // Fetch from Twitter
      if (includeTwitter) {
        try {
          const twitterTrends = await this.fetchTwitterTrends();
          allTrends.push(...twitterTrends);
        } catch (error) {
          logger.warn('Twitter trends fetch failed:', error.message);
        }
      }

      // Fetch from Reddit
      if (includeReddit) {
        try {
          const redditTrends = await this.fetchRedditTrends();
          allTrends.push(...redditTrends);
        } catch (error) {
          logger.warn('Reddit trends fetch failed:', error.message);
        }
      }

      // Sort by trend score and remove duplicates
      const uniqueTrends = this.deduplicateTrends(allTrends);
      const sortedTrends = uniqueTrends
        .sort((a, b) => b.trendScore - a.trendScore)
        .slice(0, limit);

      logger.info(`Fetched ${sortedTrends.length} unique trending topics`);
      return sortedTrends;
      
    } catch (error) {
      logger.error('Error fetching all trends:', error);
      throw error;
    } finally {
      await this.closeBrowser();
    }
  }

  /**
   * Calculate trend score based on traffic
   * @param {string} traffic - Traffic string
   * @returns {number} Trend score
   */
  calculateTrendScore(traffic) {
    if (!traffic) return 10;
    
    // Extract numbers from traffic string
    const numbers = traffic.match(/[\d,]+/g);
    if (!numbers) return 10;
    
    const num = parseInt(numbers[0].replace(/,/g, ''));
    
    if (num >= 1000000) return 100;
    if (num >= 500000) return 90;
    if (num >= 100000) return 80;
    if (num >= 50000) return 70;
    if (num >= 10000) return 60;
    if (num >= 5000) return 50;
    if (num >= 1000) return 40;
    return 30;
  }

  /**
   * Remove duplicate trends based on keyword similarity
   * @param {Array} trends - Array of trends
   * @returns {Array} Deduplicated trends
   */
  deduplicateTrends(trends) {
    const unique = [];
    const seen = new Set();
    
    for (const trend of trends) {
      const normalizedKeyword = trend.keyword.toLowerCase().trim();
      
      // Check for exact matches or very similar keywords
      let isDuplicate = false;
      for (const seenKeyword of seen) {
        if (this.calculateSimilarity(normalizedKeyword, seenKeyword) > 0.8) {
          isDuplicate = true;
          break;
        }
      }
      
      if (!isDuplicate) {
        seen.add(normalizedKeyword);
        unique.push(trend);
      }
    }
    
    return unique;
  }

  /**
   * Calculate similarity between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity score (0-1)
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Edit distance
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Map subreddit to category
   * @param {string} subreddit - Subreddit name
   * @returns {string} Category
   */
  mapSubredditToCategory(subreddit) {
    const categoryMap = {
      'technology': 'technology',
      'programming': 'technology',
      'science': 'science',
      'worldnews': 'politics',
      'politics': 'politics',
      'business': 'business',
      'sports': 'sports',
      'entertainment': 'entertainment',
      'movies': 'entertainment',
      'music': 'entertainment',
      'health': 'health',
      'fitness': 'health',
      'travel': 'travel',
      'food': 'food',
      'fashion': 'fashion'
    };
    
    return categoryMap[subreddit.toLowerCase()] || 'other';
  }
}

export default TrendService;

