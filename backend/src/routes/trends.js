import express from 'express';
import { body, query, validationResult } from 'express-validator';
import TrendService from '../services/trendService.js';
import ArticleService from '../services/articleService.js';
import { createLogger } from '../utils/logger.js';

const router = express.Router();
const logger = createLogger('TrendsRouter');
const trendService = new TrendService();
const articleService = new ArticleService();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Mock admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Admin authentication required'
    });
  }
  
  // Mock admin user (in production, verify JWT and check role)
  req.user = {
    _id: '507f1f77bcf86cd799439012',
    name: 'Admin User',
    email: 'admin@trendwise.com',
    role: 'admin'
  };
  
  next();
};

// Get current trending topics (cached for performance)
let trendsCache = {
  data: null,
  timestamp: null,
  ttl: 30 * 60 * 1000 // 30 minutes cache
};

router.get('/', [
  query('source').optional().isIn(['google', 'twitter', 'reddit', 'all']),
  query('category').optional().isString().trim(),
  query('geo').optional().isString().trim(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('fresh').optional().isBoolean().toBoolean(),
  handleValidationErrors
], async (req, res) => {
  try {
    const {
      source = 'all',
      category = null,
      geo = 'US',
      limit = 20,
      fresh = false
    } = req.query;

    // Check cache unless fresh data is requested
    if (!fresh && trendsCache.data && trendsCache.timestamp) {
      const cacheAge = Date.now() - trendsCache.timestamp;
      if (cacheAge < trendsCache.ttl) {
        logger.info('Returning cached trends data');
        return res.json({
          success: true,
          data: trendsCache.data.slice(0, limit),
          cached: true,
          cacheAge: Math.floor(cacheAge / 1000 / 60) // minutes
        });
      }
    }

    logger.info(`Fetching fresh trends data: source=${source}, category=${category}, geo=${geo}`);

    // Determine which sources to include
    const includeGoogle = source === 'all' || source === 'google';
    const includeTwitter = source === 'all' || source === 'twitter';
    const includeReddit = source === 'all' || source === 'reddit';

    // Fetch trends
    const trends = await trendService.getAllTrends({
      includeGoogle,
      includeTwitter,
      includeReddit,
      geo,
      category,
      limit: limit * 2 // Get more to filter and sort
    });

    // Update cache
    trendsCache = {
      data: trends,
      timestamp: Date.now(),
      ttl: trendsCache.ttl
    };

    res.json({
      success: true,
      data: trends.slice(0, limit),
      cached: false,
      totalFetched: trends.length
    });

  } catch (error) {
    logger.error('Error fetching trends:', error);
    res.status(500).json({
      error: 'Failed to fetch trends',
      message: error.message
    });
  }
});

// Get trends by specific source
router.get('/source/:source', [
  query('geo').optional().isString().trim(),
  query('category').optional().isString().trim(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { source } = req.params;
    const { geo = 'US', category = null, limit = 20 } = req.query;

    let trends = [];

    switch (source.toLowerCase()) {
      case 'google':
        trends = await trendService.fetchGoogleTrends(geo, category);
        break;
      case 'twitter':
        trends = await trendService.fetchTwitterTrends();
        break;
      case 'reddit':
        trends = await trendService.fetchRedditTrends();
        break;
      default:
        return res.status(400).json({
          error: 'Invalid source',
          message: 'Source must be one of: google, twitter, reddit'
        });
    }

    res.json({
      success: true,
      data: trends.slice(0, limit),
      source: source,
      totalFetched: trends.length
    });

  } catch (error) {
    logger.error(`Error fetching ${req.params.source} trends:`, error);
    res.status(500).json({
      error: `Failed to fetch ${req.params.source} trends`,
      message: error.message
    });
  }
});

// Manually fetch new trends (admin only)
router.post('/fetch', [
  body('sources').optional().isArray(),
  body('sources.*').optional().isIn(['google', 'twitter', 'reddit']),
  body('geo').optional().isString().trim(),
  body('categories').optional().isArray(),
  body('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  handleValidationErrors,
  authenticateAdmin
], async (req, res) => {
  try {
    const {
      sources = ['google', 'twitter'],
      geo = 'US',
      categories = [],
      limit = 50
    } = req.body;

    logger.info(`Admin triggered manual trend fetch: sources=${sources.join(',')}, geo=${geo}`);

    const includeGoogle = sources.includes('google');
    const includeTwitter = sources.includes('twitter');
    const includeReddit = sources.includes('reddit');

    const trends = await trendService.getAllTrends({
      includeGoogle,
      includeTwitter,
      includeReddit,
      geo,
      limit
    });

    // Filter by categories if specified
    const filteredTrends = categories.length > 0
      ? trends.filter(trend => categories.includes(trend.category))
      : trends;

    // Update cache
    trendsCache = {
      data: filteredTrends,
      timestamp: Date.now(),
      ttl: trendsCache.ttl
    };

    res.json({
      success: true,
      data: filteredTrends,
      message: `Successfully fetched ${filteredTrends.length} trends`,
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error in manual trend fetch:', error);
    res.status(500).json({
      error: 'Failed to fetch trends manually',
      message: error.message
    });
  }
});

// Generate articles from current trends (admin only)
router.post('/generate-articles', [
  body('maxArticles').optional().isInt({ min: 1, max: 10 }).toInt(),
  body('categories').optional().isArray(),
  body('useCache').optional().isBoolean(),
  body('articleOptions').optional().isObject(),
  handleValidationErrors,
  authenticateAdmin
], async (req, res) => {
  try {
    const {
      maxArticles = 3,
      categories = ['technology', 'business', 'health'],
      useCache = true,
      articleOptions = {}
    } = req.body;

    logger.info(`Admin triggered article generation: maxArticles=${maxArticles}, categories=${categories.join(',')}`);

    // Get trends (from cache or fresh)
    let trends = [];
    if (useCache && trendsCache.data && trendsCache.timestamp) {
      const cacheAge = Date.now() - trendsCache.timestamp;
      if (cacheAge < trendsCache.ttl) {
        trends = trendsCache.data;
        logger.info('Using cached trends for article generation');
      }
    }

    // Fetch fresh trends if cache is empty or expired
    if (trends.length === 0) {
      logger.info('Fetching fresh trends for article generation');
      trends = await trendService.getAllTrends({
        includeGoogle: true,
        includeTwitter: true,
        includeReddit: false,
        limit: maxArticles * 3
      });
    }

    // Generate articles
    const articles = await articleService.generateArticlesFromTrends({
      maxArticles,
      categories,
      trends: trends.slice(0, maxArticles * 2) // Provide more trends to choose from
    });

    res.json({
      success: true,
      data: articles,
      message: `Successfully generated ${articles.length} articles`,
      generatedAt: new Date().toISOString(),
      trendsUsed: trends.slice(0, maxArticles).map(t => t.keyword)
    });

  } catch (error) {
    logger.error('Error generating articles from trends:', error);
    res.status(500).json({
      error: 'Failed to generate articles',
      message: error.message
    });
  }
});

// Get trend statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      cacheStatus: {
        hasCache: !!trendsCache.data,
        cacheAge: trendsCache.timestamp ? Date.now() - trendsCache.timestamp : null,
        cacheSize: trendsCache.data ? trendsCache.data.length : 0,
        lastUpdated: trendsCache.timestamp ? new Date(trendsCache.timestamp).toISOString() : null
      },
      sources: {
        google: 'Available',
        twitter: 'Available',
        reddit: 'Available'
      },
      categories: [
        'technology', 'business', 'health', 'entertainment',
        'sports', 'politics', 'science', 'lifestyle',
        'travel', 'food', 'fashion', 'education',
        'finance', 'environment', 'other'
      ]
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Error getting trend stats:', error);
    res.status(500).json({
      error: 'Failed to fetch trend statistics',
      message: error.message
    });
  }
});

// Clear trends cache (admin only)
router.delete('/cache', [
  authenticateAdmin
], async (req, res) => {
  try {
    trendsCache = {
      data: null,
      timestamp: null,
      ttl: trendsCache.ttl
    };

    logger.info('Admin cleared trends cache');

    res.json({
      success: true,
      message: 'Trends cache cleared successfully'
    });

  } catch (error) {
    logger.error('Error clearing trends cache:', error);
    res.status(500).json({
      error: 'Failed to clear cache',
      message: error.message
    });
  }
});

export default router;

