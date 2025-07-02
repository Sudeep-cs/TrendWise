import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import Article from '../models/Article.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import ArticleService from '../services/articleService.js';
import TrendService from '../services/trendService.js';
import OpenAIService from '../services/openaiService.js';
import { createLogger } from '../utils/logger.js';

const router = express.Router();
const logger = createLogger('AdminRouter');
const articleService = new ArticleService();
const trendService = new TrendService();
const openaiService = new OpenAIService();

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

// Admin authentication middleware
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
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Admin privileges required'
    });
  }
  
  next();
};

// Get dashboard statistics
router.get('/stats', [authenticateAdmin], async (req, res) => {
  try {
    logger.info('Admin requested dashboard statistics');

    const [
      articleStats,
      userStats,
      commentStats,
      systemStats
    ] = await Promise.all([
      getArticleStats(),
      getUserStats(),
      getCommentStats(),
      getSystemStats()
    ]);

    const dashboardStats = {
      articles: articleStats,
      users: userStats,
      comments: commentStats,
      system: systemStats,
      generatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: dashboardStats
    });

  } catch (error) {
    logger.error('Error getting admin stats:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard statistics',
      message: error.message
    });
  }
});

// Get all articles for admin management
router.get('/articles', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(['draft', 'published', 'archived']),
  query('category').optional().isString().trim(),
  query('sortBy').optional().isIn(['createdAt', 'publishedAt', 'views', 'title']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  handleValidationErrors,
  authenticateAdmin
], async (req, res) => {
  try {
    const options = {
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      status: req.query.status,
      category: req.query.category,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc'
    };

    // Remove status filter to get all articles for admin
    if (!options.status) {
      delete options.status;
    }

    const result = await articleService.getArticles(options);
    
    res.json({
      success: true,
      data: result.articles,
      pagination: result.pagination
    });

  } catch (error) {
    logger.error('Error getting admin articles:', error);
    res.status(500).json({
      error: 'Failed to fetch articles',
      message: error.message
    });
  }
});

// Get pending comments for moderation
router.get('/comments/pending', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  handleValidationErrors,
  authenticateAdmin
], async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const skip = (page - 1) * limit;

    const [comments, totalComments] = await Promise.all([
      Comment.findPending().skip(skip).limit(limit),
      Comment.countDocuments({ status: 'pending' })
    ]);

    const totalPages = Math.ceil(totalComments / limit);

    res.json({
      success: true,
      data: comments,
      pagination: {
        currentPage: page,
        totalPages,
        totalComments,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    logger.error('Error getting pending comments:', error);
    res.status(500).json({
      error: 'Failed to fetch pending comments',
      message: error.message
    });
  }
});

// Get reported comments
router.get('/comments/reported', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  handleValidationErrors,
  authenticateAdmin
], async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const skip = (page - 1) * limit;

    const [comments, totalComments] = await Promise.all([
      Comment.findReported().skip(skip).limit(limit),
      Comment.countDocuments({ 'reports.0': { $exists: true } })
    ]);

    const totalPages = Math.ceil(totalComments / limit);

    res.json({
      success: true,
      data: comments,
      pagination: {
        currentPage: page,
        totalPages,
        totalComments,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    logger.error('Error getting reported comments:', error);
    res.status(500).json({
      error: 'Failed to fetch reported comments',
      message: error.message
    });
  }
});

// Moderate comment (approve/reject/spam)
router.put('/comments/:id/moderate', [
  param('id').isMongoId(),
  body('action').isIn(['approve', 'reject', 'spam']),
  body('reason').optional().isString().trim(),
  handleValidationErrors,
  authenticateAdmin
], async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        error: 'Comment not found',
        message: 'The specified comment does not exist'
      });
    }

    switch (action) {
      case 'approve':
        await comment.approve();
        break;
      case 'reject':
        await comment.reject();
        break;
      case 'spam':
        await comment.markAsSpam();
        break;
    }

    logger.info(`Admin ${action}ed comment ${id}${reason ? ` with reason: ${reason}` : ''}`);

    res.json({
      success: true,
      data: comment,
      message: `Comment ${action}ed successfully`
    });

  } catch (error) {
    logger.error('Error moderating comment:', error);
    res.status(500).json({
      error: 'Failed to moderate comment',
      message: error.message
    });
  }
});

// Generate articles manually
router.post('/articles/generate', [
  body('maxArticles').optional().isInt({ min: 1, max: 10 }).toInt(),
  body('categories').optional().isArray(),
  body('categories.*').optional().isString(),
  body('fetchFreshTrends').optional().isBoolean(),
  body('articleOptions').optional().isObject(),
  handleValidationErrors,
  authenticateAdmin
], async (req, res) => {
  try {
    const {
      maxArticles = 3,
      categories = ['technology', 'business', 'health'],
      fetchFreshTrends = false,
      articleOptions = {}
    } = req.body;

    logger.info(`Admin triggered manual article generation: ${maxArticles} articles, categories: ${categories.join(',')}`);

    const options = {
      maxArticles,
      categories,
      ...articleOptions
    };

    const articles = await articleService.generateArticlesFromTrends(options);

    res.json({
      success: true,
      data: articles,
      message: `Successfully generated ${articles.length} articles`,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error in manual article generation:', error);
    res.status(500).json({
      error: 'Failed to generate articles',
      message: error.message
    });
  }
});

// Get system health and configuration
router.get('/system/health', [authenticateAdmin], async (req, res) => {
  try {
    const health = {
      database: {
        connected: true, // This would be checked from database connection
        status: 'healthy'
      },
      openai: {
        configured: openaiService.isConfigured(),
        status: await openaiService.testConnection() ? 'healthy' : 'error'
      },
      services: {
        trendService: 'healthy',
        articleService: 'healthy'
      },
      environment: {
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      }
    };

    res.json({
      success: true,
      data: health
    });

  } catch (error) {
    logger.error('Error getting system health:', error);
    res.status(500).json({
      error: 'Failed to get system health',
      message: error.message
    });
  }
});

// Get users for admin management
router.get('/users', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('role').optional().isIn(['user', 'admin']),
  query('isActive').optional().isBoolean().toBoolean(),
  handleValidationErrors,
  authenticateAdmin
], async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.isActive !== undefined) query.isActive = req.query.isActive;

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select('-googleId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    logger.error('Error getting users:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});

// Update user role or status
router.put('/users/:id', [
  param('id').isMongoId(),
  body('role').optional().isIn(['user', 'admin']),
  body('isActive').optional().isBoolean(),
  handleValidationErrors,
  authenticateAdmin
], async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};
    
    if (req.body.role !== undefined) updateData.role = req.body.role;
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-googleId');

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist'
      });
    }

    logger.info(`Admin updated user ${id}: ${JSON.stringify(updateData)}`);

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });

  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: error.message
    });
  }
});

// Helper functions for statistics
async function getArticleStats() {
  const [
    totalArticles,
    publishedArticles,
    draftArticles,
    archivedArticles,
    totalViews,
    recentArticles,
    topArticles
  ] = await Promise.all([
    Article.countDocuments(),
    Article.countDocuments({ status: 'published' }),
    Article.countDocuments({ status: 'draft' }),
    Article.countDocuments({ status: 'archived' }),
    Article.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$stats.views' } } }
    ]),
    Article.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(5)
      .select('title slug stats publishedAt'),
    Article.find({ status: 'published' })
      .sort({ 'stats.views': -1 })
      .limit(5)
      .select('title slug stats')
  ]);

  return {
    total: totalArticles,
    published: publishedArticles,
    draft: draftArticles,
    archived: archivedArticles,
    totalViews: totalViews[0]?.totalViews || 0,
    recent: recentArticles,
    topViewed: topArticles
  };
}

async function getUserStats() {
  const [
    totalUsers,
    activeUsers,
    adminUsers,
    recentUsers
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'admin' }),
    User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt stats')
  ]);

  return {
    total: totalUsers,
    active: activeUsers,
    admins: adminUsers,
    recent: recentUsers
  };
}

async function getCommentStats() {
  const [
    totalComments,
    approvedComments,
    pendingComments,
    rejectedComments,
    spamComments
  ] = await Promise.all([
    Comment.countDocuments(),
    Comment.countDocuments({ status: 'approved' }),
    Comment.countDocuments({ status: 'pending' }),
    Comment.countDocuments({ status: 'rejected' }),
    Comment.countDocuments({ status: 'spam' })
  ]);

  return {
    total: totalComments,
    approved: approvedComments,
    pending: pendingComments,
    rejected: rejectedComments,
    spam: spamComments
  };
}

async function getSystemStats() {
  return {
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  };
}

export default router;

