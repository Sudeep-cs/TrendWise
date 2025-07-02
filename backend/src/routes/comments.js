import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import Comment from '../models/Comment.js';
import Article from '../models/Article.js';
import { createLogger } from '../utils/logger.js';

const router = express.Router();
const logger = createLogger('CommentsRouter');

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

// Mock authentication middleware (replace with real auth in production)
const authenticateUser = (req, res, next) => {
  // In production, this would verify JWT token and set req.user
  // For now, we'll use a mock user for testing
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please provide a valid authentication token'
    });
  }
  
  // Mock user (in production, decode JWT and fetch user)
  req.user = {
    _id: '507f1f77bcf86cd799439011', // Mock user ID
    name: 'Test User',
    email: 'test@example.com',
    role: 'user'
  };
  
  next();
};

// Optional authentication (for features that work with or without auth)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    req.user = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user'
    };
  }
  
  next();
};

// Get comments for an article
router.get('/article/:articleId', [
  param('articleId').isMongoId(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('includeReplies').optional().isBoolean().toBoolean(),
  handleValidationErrors,
  optionalAuth
], async (req, res) => {
  try {
    const { articleId } = req.params;
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const includeReplies = req.query.includeReplies !== false;
    const skip = (page - 1) * limit;

    // Verify article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        error: 'Article not found',
        message: 'The specified article does not exist'
      });
    }

    // Get comments
    const comments = await Comment.findByArticle(articleId, {
      includeReplies,
      limit,
      skip
    });

    // Get total count for pagination
    const totalComments = await Comment.countDocuments({
      article: articleId,
      status: 'approved',
      parentComment: null
    });

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
    logger.error('Error getting comments:', error);
    res.status(500).json({
      error: 'Failed to fetch comments',
      message: error.message
    });
  }
});

// Get comments by user
router.get('/user/:userId', [
  param('userId').isMongoId(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { userId } = req.params;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    const comments = await Comment.findByUser(userId, { limit, skip });
    
    const totalComments = await Comment.countDocuments({
      author: userId,
      status: 'approved'
    });

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
    logger.error('Error getting user comments:', error);
    res.status(500).json({
      error: 'Failed to fetch user comments',
      message: error.message
    });
  }
});

// Create new comment
router.post('/', [
  body('content').isString().trim().isLength({ min: 1, max: 1000 }),
  body('article').isMongoId(),
  body('parentComment').optional().isMongoId(),
  handleValidationErrors,
  authenticateUser
], async (req, res) => {
  try {
    const { content, article, parentComment } = req.body;

    // Verify article exists
    const articleDoc = await Article.findById(article);
    if (!articleDoc) {
      return res.status(404).json({
        error: 'Article not found',
        message: 'The specified article does not exist'
      });
    }

    // If replying to a comment, verify parent comment exists
    if (parentComment) {
      const parentCommentDoc = await Comment.findById(parentComment);
      if (!parentCommentDoc) {
        return res.status(404).json({
          error: 'Parent comment not found',
          message: 'The comment you are replying to does not exist'
        });
      }
    }

    // Create comment
    const comment = new Comment({
      content,
      article,
      parentComment: parentComment || null,
      author: req.user._id,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        isFromMobile: /Mobile|Android|iPhone|iPad/.test(req.get('User-Agent'))
      }
    });

    await comment.save();

    // Populate author information
    await comment.populate('author', 'name avatar');

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment created successfully'
    });

  } catch (error) {
    logger.error('Error creating comment:', error);
    res.status(500).json({
      error: 'Failed to create comment',
      message: error.message
    });
  }
});

// Update comment
router.put('/:id', [
  param('id').isMongoId(),
  body('content').isString().trim().isLength({ min: 1, max: 1000 }),
  handleValidationErrors,
  authenticateUser
], async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        error: 'Comment not found',
        message: 'The specified comment does not exist'
      });
    }

    // Check if user owns the comment or is admin
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only edit your own comments'
      });
    }

    // Update comment
    await comment.edit(content);
    await comment.populate('author', 'name avatar');

    res.json({
      success: true,
      data: comment,
      message: 'Comment updated successfully'
    });

  } catch (error) {
    logger.error('Error updating comment:', error);
    res.status(500).json({
      error: 'Failed to update comment',
      message: error.message
    });
  }
});

// Delete comment
router.delete('/:id', [
  param('id').isMongoId(),
  handleValidationErrors,
  authenticateUser
], async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        error: 'Comment not found',
        message: 'The specified comment does not exist'
      });
    }

    // Check if user owns the comment or is admin
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own comments'
      });
    }

    await comment.remove();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting comment:', error);
    res.status(500).json({
      error: 'Failed to delete comment',
      message: error.message
    });
  }
});

// Like/unlike comment
router.post('/:id/like', [
  param('id').isMongoId(),
  handleValidationErrors,
  authenticateUser
], async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        error: 'Comment not found',
        message: 'The specified comment does not exist'
      });
    }

    let action;
    if (comment.isLikedBy(userId)) {
      await comment.unlike(userId);
      action = 'unliked';
    } else {
      await comment.like(userId);
      action = 'liked';
    }

    res.json({
      success: true,
      data: {
        commentId: id,
        likes: comment.likes,
        action: action
      },
      message: `Comment ${action} successfully`
    });

  } catch (error) {
    logger.error('Error liking/unliking comment:', error);
    res.status(500).json({
      error: 'Failed to like/unlike comment',
      message: error.message
    });
  }
});

// Report comment
router.post('/:id/report', [
  param('id').isMongoId(),
  body('reason').isIn(['spam', 'inappropriate', 'harassment', 'other']),
  body('details').optional().isString().trim().isLength({ max: 500 }),
  handleValidationErrors,
  authenticateUser
], async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        error: 'Comment not found',
        message: 'The specified comment does not exist'
      });
    }

    await comment.report(userId, reason);

    res.json({
      success: true,
      message: 'Comment reported successfully'
    });

  } catch (error) {
    logger.error('Error reporting comment:', error);
    res.status(500).json({
      error: 'Failed to report comment',
      message: error.message
    });
  }
});

// Get comment statistics for an article
router.get('/stats/:articleId', [
  param('articleId').isMongoId(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { articleId } = req.params;

    const stats = await Comment.getCommentStats(articleId);
    
    // Transform aggregation result to object
    const statsObject = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        approved: statsObject.approved || 0,
        pending: statsObject.pending || 0,
        rejected: statsObject.rejected || 0,
        spam: statsObject.spam || 0,
        total: Object.values(statsObject).reduce((sum, count) => sum + count, 0)
      }
    });

  } catch (error) {
    logger.error('Error getting comment stats:', error);
    res.status(500).json({
      error: 'Failed to fetch comment statistics',
      message: error.message
    });
  }
});

export default router;

