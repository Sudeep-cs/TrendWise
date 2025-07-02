import Article from '../models/Article.js';
import TrendService from './trendService.js';
import OpenAIService from './openaiService.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('ArticleService');

class ArticleService {
  constructor() {
    this.trendService = new TrendService();
    this.openaiService = new OpenAIService();
  }

  /**
   * Generate and save articles from trending topics
   * @param {Object} options - Generation options
   * @returns {Promise<Array>} Generated articles
   */
  async generateArticlesFromTrends(options = {}) {
    try {
      const {
        maxArticles = 5,
        categories = ['technology', 'business', 'health', 'entertainment'],
        geo = 'US',
        includeGoogle = true,
        includeTwitter = true,
        includeReddit = false
      } = options;

      logger.info('Starting article generation from trends');

      // Fetch trending topics
      const trends = await this.trendService.getAllTrends({
        includeGoogle,
        includeTwitter,
        includeReddit,
        geo,
        limit: maxArticles * 2 // Get more trends to filter from
      });

      if (trends.length === 0) {
        logger.warn('No trends found');
        return [];
      }

      // Filter trends by categories if specified
      const filteredTrends = categories.length > 0 
        ? trends.filter(trend => categories.includes(trend.category))
        : trends;

      // Select top trends for article generation
      const selectedTrends = filteredTrends.slice(0, maxArticles);
      
      logger.info(`Selected ${selectedTrends.length} trends for article generation`);

      // Generate articles
      const generatedArticles = await this.openaiService.generateMultipleArticles(
        selectedTrends,
        { delay: 3000 } // 3 second delay between requests
      );

      // Save articles to database
      const savedArticles = [];
      for (const articleData of generatedArticles) {
        try {
          const article = await this.createArticle(articleData);
          savedArticles.push(article);
          logger.info(`Saved article: ${article.title}`);
        } catch (error) {
          logger.error(`Failed to save article: ${articleData.title}`, error);
        }
      }

      logger.info(`Successfully generated and saved ${savedArticles.length} articles`);
      return savedArticles;

    } catch (error) {
      logger.error('Error generating articles from trends:', error);
      throw error;
    }
  }

  /**
   * Create a new article
   * @param {Object} articleData - Article data
   * @returns {Promise<Object>} Created article
   */
  async createArticle(articleData) {
    try {
      // Check if article with similar title already exists
      const existingArticle = await Article.findOne({
        title: { $regex: new RegExp(articleData.title, 'i') }
      });

      if (existingArticle) {
        logger.warn(`Article with similar title already exists: ${articleData.title}`);
        return existingArticle;
      }

      // Create new article
      const article = new Article(articleData);
      await article.save();

      logger.info(`Created new article: ${article.title}`);
      return article;

    } catch (error) {
      logger.error('Error creating article:', error);
      throw error;
    }
  }

  /**
   * Get articles with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Articles with pagination info
   */
  async getArticles(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        category = null,
        tags = null,
        status = 'published',
        sortBy = 'publishedAt',
        sortOrder = 'desc',
        search = null
      } = options;

      const skip = (page - 1) * limit;
      let query = { status };

      // Add filters
      if (category) query.category = category;
      if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
      if (search) {
        query.$text = { $search: search };
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const [articles, total] = await Promise.all([
        Article.find(query)
          .populate('author', 'name avatar')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Article.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        articles,
        pagination: {
          currentPage: page,
          totalPages,
          totalArticles: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };

    } catch (error) {
      logger.error('Error getting articles:', error);
      throw error;
    }
  }

  /**
   * Get article by slug
   * @param {string} slug - Article slug
   * @returns {Promise<Object>} Article
   */
  async getArticleBySlug(slug) {
    try {
      const article = await Article.findOne({ slug, status: 'published' })
        .populate('author', 'name avatar')
        .lean();

      if (!article) {
        throw new Error('Article not found');
      }

      // Increment view count
      await Article.findByIdAndUpdate(article._id, {
        $inc: { 'stats.views': 1 }
      });

      return article;

    } catch (error) {
      logger.error('Error getting article by slug:', error);
      throw error;
    }
  }

  /**
   * Get trending articles
   * @param {number} limit - Number of articles to return
   * @returns {Promise<Array>} Trending articles
   */
  async getTrendingArticles(limit = 10) {
    try {
      const articles = await Article.findTrending(limit);
      return articles;
    } catch (error) {
      logger.error('Error getting trending articles:', error);
      throw error;
    }
  }

  /**
   * Get recent articles
   * @param {number} limit - Number of articles to return
   * @returns {Promise<Array>} Recent articles
   */
  async getRecentArticles(limit = 10) {
    try {
      const articles = await Article.findRecent(limit);
      return articles;
    } catch (error) {
      logger.error('Error getting recent articles:', error);
      throw error;
    }
  }

  /**
   * Get articles by category
   * @param {string} category - Category name
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Articles with pagination
   */
  async getArticlesByCategory(category, options = {}) {
    try {
      return await this.getArticles({ ...options, category });
    } catch (error) {
      logger.error('Error getting articles by category:', error);
      throw error;
    }
  }

  /**
   * Search articles
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchArticles(query, options = {}) {
    try {
      return await this.getArticles({ ...options, search: query });
    } catch (error) {
      logger.error('Error searching articles:', error);
      throw error;
    }
  }

  /**
   * Update article
   * @param {string} id - Article ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated article
   */
  async updateArticle(id, updateData) {
    try {
      const article = await Article.findByIdAndUpdate(
        id,
        { ...updateData, lastModified: new Date() },
        { new: true, runValidators: true }
      ).populate('author', 'name avatar');

      if (!article) {
        throw new Error('Article not found');
      }

      logger.info(`Updated article: ${article.title}`);
      return article;

    } catch (error) {
      logger.error('Error updating article:', error);
      throw error;
    }
  }

  /**
   * Delete article
   * @param {string} id - Article ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteArticle(id) {
    try {
      const article = await Article.findByIdAndDelete(id);
      
      if (!article) {
        throw new Error('Article not found');
      }

      logger.info(`Deleted article: ${article.title}`);
      return true;

    } catch (error) {
      logger.error('Error deleting article:', error);
      throw error;
    }
  }

  /**
   * Get article statistics
   * @returns {Promise<Object>} Article statistics
   */
  async getArticleStats() {
    try {
      const [
        totalArticles,
        publishedArticles,
        draftArticles,
        totalViews,
        categoryCounts,
        recentArticles
      ] = await Promise.all([
        Article.countDocuments(),
        Article.countDocuments({ status: 'published' }),
        Article.countDocuments({ status: 'draft' }),
        Article.aggregate([
          { $group: { _id: null, totalViews: { $sum: '$stats.views' } } }
        ]),
        Article.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        Article.find({ status: 'published' })
          .sort({ publishedAt: -1 })
          .limit(5)
          .select('title slug stats.views publishedAt')
      ]);

      return {
        totalArticles,
        publishedArticles,
        draftArticles,
        totalViews: totalViews[0]?.totalViews || 0,
        categoryCounts,
        recentArticles
      };

    } catch (error) {
      logger.error('Error getting article stats:', error);
      throw error;
    }
  }

  /**
   * Generate sitemap data
   * @returns {Promise<Array>} Sitemap entries
   */
  async generateSitemapData() {
    try {
      const articles = await Article.find({ status: 'published' })
        .select('slug lastModified publishedAt')
        .sort({ publishedAt: -1 })
        .lean();

      return articles.map(article => ({
        url: `/article/${article.slug}`,
        lastModified: article.lastModified || article.publishedAt,
        changeFreq: 'weekly',
        priority: 0.8
      }));

    } catch (error) {
      logger.error('Error generating sitemap data:', error);
      throw error;
    }
  }

  /**
   * Clean up old articles (optional maintenance task)
   * @param {number} daysOld - Days old threshold
   * @returns {Promise<number>} Number of articles cleaned
   */
  async cleanupOldArticles(daysOld = 365) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Article.deleteMany({
        publishedAt: { $lt: cutoffDate },
        'stats.views': { $lt: 100 } // Only delete articles with low views
      });

      logger.info(`Cleaned up ${result.deletedCount} old articles`);
      return result.deletedCount;

    } catch (error) {
      logger.error('Error cleaning up old articles:', error);
      throw error;
    }
  }
}

export default ArticleService;

