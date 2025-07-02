import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import ArticleService from '../services/articleService.js';
import { createLogger } from '../utils/logger.js';

const router = express.Router();
const logger = createLogger('ArticlesRouter');
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

// Get all articles with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('category').optional().isString().trim(),
  query('tags').optional().isString(),
  query('search').optional().isString().trim(),
  query('sortBy').optional().isIn(['publishedAt', 'views', 'title', 'createdAt']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  handleValidationErrors
], async (req, res) => {
  try {
    const options = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      category: req.query.category,
      tags: req.query.tags ? req.query.tags.split(',') : null,
      search: req.query.search,
      sortBy: req.query.sortBy || 'publishedAt',
      sortOrder: req.query.sortOrder || 'desc'
    };

    const result = await articleService.getArticles(options);
    
    res.json({
      success: true,
      data: result.articles,
      pagination: result.pagination
    });

  } catch (error) {
    logger.error('Error getting articles:', error);
    res.status(500).json({
      error: 'Failed to fetch articles',
      message: error.message
    });
  }
});

// Get trending articles
router.get('/trending', [
  query('limit').optional().isInt({ min: 1, max: 20 }).toInt(),
  handleValidationErrors
], async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const articles = await articleService.getTrendingArticles(limit);
    
    res.json({
      success: true,
      data: articles
    });

  } catch (error) {
    logger.error('Error getting trending articles:', error);
    res.status(500).json({
      error: 'Failed to fetch trending articles',
      message: error.message
    });
  }
});

// Get recent articles
router.get('/recent', [
  query('limit').optional().isInt({ min: 1, max: 20 }).toInt(),
  handleValidationErrors
], async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const articles = await articleService.getRecentArticles(limit);
    
    res.json({
      success: true,
      data: articles
    });

  } catch (error) {
    logger.error('Error getting recent articles:', error);
    res.status(500).json({
      error: 'Failed to fetch recent articles',
      message: error.message
    });
  }
});

// Get articles by category
router.get('/category/:category', [
  param('category').isString().trim().isLength({ min: 1 }),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { category } = req.params;
    const options = {
      page: req.query.page || 1,
      limit: req.query.limit || 10
    };

    const result = await articleService.getArticlesByCategory(category, options);
    
    res.json({
      success: true,
      data: result.articles,
      pagination: result.pagination,
      category: category
    });

  } catch (error) {
    logger.error('Error getting articles by category:', error);
    res.status(500).json({
      error: 'Failed to fetch articles by category',
      message: error.message
    });
  }
});

// Search articles
router.get('/search', [
  query('q').isString().trim().isLength({ min: 1 }),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('category').optional().isString().trim(),
  handleValidationErrors
], async (req, res) => {
  try {
    const searchQuery = req.query.q;
    const options = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      category: req.query.category
    };

    const result = await articleService.searchArticles(searchQuery, options);
    
    res.json({
      success: true,
      data: result.articles,
      pagination: result.pagination,
      query: searchQuery
    });

  } catch (error) {
    logger.error('Error searching articles:', error);
    res.status(500).json({
      error: 'Failed to search articles',
      message: error.message
    });
  }
});

// Get article by slug
router.get('/:slug', [
  param('slug').isString().trim().isLength({ min: 1 }),
  handleValidationErrors
], async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await articleService.getArticleBySlug(slug);
    
    res.json({
      success: true,
      data: article
    });

  } catch (error) {
    logger.error('Error getting article by slug:', error);
    
    if (error.message === 'Article not found') {
      return res.status(404).json({
        error: 'Article not found',
        message: `No article found with slug: ${req.params.slug}`
      });
    }
    
    res.status(500).json({
      error: 'Failed to fetch article',
      message: error.message
    });
  }
});

// Create new article (admin only - will be protected by auth middleware in production)
router.post('/', [
  body('title').isString().trim().isLength({ min: 1, max: 200 }),
  body('content').isString().trim().isLength({ min: 100 }),
  body('excerpt').isString().trim().isLength({ min: 10, max: 300 }),
  body('category').isString().trim().isIn([
    'technology', 'business', 'health', 'entertainment', 'sports',
    'politics', 'science', 'lifestyle', 'travel', 'food', 'fashion',
    'education', 'finance', 'environment', 'other'
  ]),
  body('tags').optional().isArray(),
  body('tags.*').optional().isString().trim(),
  body('featuredImage').optional().isObject(),
  body('seo').optional().isObject(),
  handleValidationErrors
], async (req, res) => {
  try {
    const articleData = req.body;
    const article = await articleService.createArticle(articleData);
    
    res.status(201).json({
      success: true,
      data: article,
      message: 'Article created successfully'
    });

  } catch (error) {
    logger.error('Error creating article:', error);
    res.status(500).json({
      error: 'Failed to create article',
      message: error.message
    });
  }
});

// Update article (admin only)
router.put('/:id', [
  param('id').isMongoId(),
  body('title').optional().isString().trim().isLength({ min: 1, max: 200 }),
  body('content').optional().isString().trim().isLength({ min: 100 }),
  body('excerpt').optional().isString().trim().isLength({ min: 10, max: 300 }),
  body('category').optional().isString().trim(),
  body('tags').optional().isArray(),
  body('status').optional().isIn(['draft', 'published', 'archived']),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const article = await articleService.updateArticle(id, updateData);
    
    res.json({
      success: true,
      data: article,
      message: 'Article updated successfully'
    });

  } catch (error) {
    logger.error('Error updating article:', error);
    
    if (error.message === 'Article not found') {
      return res.status(404).json({
        error: 'Article not found',
        message: `No article found with ID: ${req.params.id}`
      });
    }
    
    res.status(500).json({
      error: 'Failed to update article',
      message: error.message
    });
  }
});

// Delete article (admin only)
router.delete('/:id', [
  param('id').isMongoId(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    await articleService.deleteArticle(id);
    
    res.json({
      success: true,
      message: 'Article deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting article:', error);
    
    if (error.message === 'Article not found') {
      return res.status(404).json({
        error: 'Article not found',
        message: `No article found with ID: ${req.params.id}`
      });
    }
    
    res.status(500).json({
      error: 'Failed to delete article',
      message: error.message
    });
  }
});

// Get article statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await articleService.getArticleStats();
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Error getting article stats:', error);
    res.status(500).json({
      error: 'Failed to fetch article statistics',
      message: error.message
    });
  }
});

// Generate sitemap data
router.get('/sitemap/data', async (req, res) => {
  try {
    const sitemapData = await articleService.generateSitemapData();
    
    res.json({
      success: true,
      data: sitemapData
    });

  } catch (error) {
    logger.error('Error generating sitemap data:', error);
    res.status(500).json({
      error: 'Failed to generate sitemap data',
      message: error.message
    });
  }
});

export default router;

