import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cron from 'node-cron';

// Import utilities and services
import database from './utils/database.js';
import logger from './utils/logger.js';
import ArticleService from './services/articleService.js';

// Import routes
import articlesRouter from './routes/articles.js';
import commentsRouter from './routes/comments.js';
import trendsRouter from './routes/trends.js';
import adminRouter from './routes/admin.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize services
const articleService = new ArticleService();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://trendwise.vercel.app']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: database.isConnected() ? 'connected' : 'disconnected'
  });
});

// API routes
app.use('/api/articles', articlesRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/trends', trendsRouter);
app.use('/api/admin', adminRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'TrendWise API Server',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health'
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'TrendWise API Documentation',
    version: '1.0.0',
    endpoints: {
      articles: {
        'GET /api/articles': 'Get all articles with pagination',
        'GET /api/articles/:slug': 'Get article by slug',
        'GET /api/articles/category/:category': 'Get articles by category',
        'GET /api/articles/trending': 'Get trending articles',
        'POST /api/articles': 'Create new article (admin only)',
        'PUT /api/articles/:id': 'Update article (admin only)',
        'DELETE /api/articles/:id': 'Delete article (admin only)'
      },
      comments: {
        'GET /api/comments/article/:articleId': 'Get comments for article',
        'POST /api/comments': 'Create new comment (auth required)',
        'PUT /api/comments/:id': 'Update comment (auth required)',
        'DELETE /api/comments/:id': 'Delete comment (auth required)',
        'POST /api/comments/:id/like': 'Like/unlike comment (auth required)'
      },
      trends: {
        'GET /api/trends': 'Get current trending topics',
        'POST /api/trends/fetch': 'Fetch new trends (admin only)',
        'POST /api/trends/generate-articles': 'Generate articles from trends (admin only)'
      },
      admin: {
        'GET /api/admin/stats': 'Get dashboard statistics (admin only)',
        'GET /api/admin/articles': 'Get all articles for admin (admin only)',
        'GET /api/admin/comments/pending': 'Get pending comments (admin only)',
        'POST /api/admin/articles/generate': 'Generate articles manually (admin only)'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist.`,
    availableEndpoints: [
      '/health',
      '/api/docs',
      '/api/articles',
      '/api/comments',
      '/api/trends',
      '/api/admin'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(error.status || 500).json({
    error: 'Internal Server Error',
    message: isDevelopment ? error.message : 'Something went wrong',
    ...(isDevelopment && { stack: error.stack })
  });
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Close database connection
    await database.disconnect();
    logger.info('Database connection closed');
    
    // Close server
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
    
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Setup cron jobs for automated article generation
const setupCronJobs = () => {
  // Generate articles daily at 6 AM
  cron.schedule('0 6 * * *', async () => {
    try {
      logger.info('Starting scheduled article generation');
      await articleService.generateArticlesFromTrends({
        maxArticles: 3,
        categories: ['technology', 'business', 'health']
      });
      logger.info('Scheduled article generation completed');
    } catch (error) {
      logger.error('Scheduled article generation failed:', error);
    }
  }, {
    scheduled: process.env.ENABLE_CRON_JOBS === 'true',
    timezone: 'America/New_York'
  });

  // Generate articles every 6 hours (optional, for high-frequency sites)
  cron.schedule('0 */6 * * *', async () => {
    try {
      logger.info('Starting frequent article generation');
      await articleService.generateArticlesFromTrends({
        maxArticles: 1,
        categories: ['technology']
      });
      logger.info('Frequent article generation completed');
    } catch (error) {
      logger.error('Frequent article generation failed:', error);
    }
  }, {
    scheduled: process.env.ENABLE_FREQUENT_GENERATION === 'true',
    timezone: 'America/New_York'
  });

  logger.info('Cron jobs configured');
};

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await database.connect();
    logger.info('Database connected successfully');
    
    // Setup cron jobs
    setupCronJobs();
    
    // Start HTTP server
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`TrendWise API Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`API docs: http://localhost:${PORT}/api/docs`);
    });

    // Setup graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    return server;
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
const server = await startServer();

export default app;

