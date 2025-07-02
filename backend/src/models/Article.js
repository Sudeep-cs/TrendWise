import mongoose from 'mongoose';
import slugify from 'slugify';

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 300
  },
  featuredImage: {
    url: String,
    alt: String,
    caption: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // For AI-generated articles
  },
  category: {
    type: String,
    required: true,
    enum: [
      'technology',
      'business',
      'health',
      'entertainment',
      'sports',
      'politics',
      'science',
      'lifestyle',
      'travel',
      'food',
      'fashion',
      'education',
      'finance',
      'environment',
      'other'
    ],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  isAIGenerated: {
    type: Boolean,
    default: true
  },
  trendData: {
    keyword: String,
    trendScore: Number,
    source: {
      type: String,
      enum: ['google-trends', 'twitter', 'manual'],
      default: 'google-trends'
    },
    fetchedAt: Date
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    canonicalUrl: String
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    commentsCount: {
      type: Number,
      default: 0
    },
    readTime: {
      type: Number, // in minutes
      default: 0
    }
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance and SEO
articleSchema.index({ slug: 1 });
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ 'trendData.keyword': 1 });
articleSchema.index({ 'stats.views': -1 });
articleSchema.index({ createdAt: -1 });
articleSchema.index({ publishedAt: -1 });

// Text search index
articleSchema.index({
  title: 'text',
  content: 'text',
  excerpt: 'text',
  tags: 'text'
});

// Virtual for full URL
articleSchema.virtual('url').get(function() {
  return `/article/${this.slug}`;
});

// Virtual for reading time calculation
articleSchema.virtual('estimatedReadTime').get(function() {
  if (this.stats.readTime > 0) return this.stats.readTime;
  
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Instance methods
articleSchema.methods.generateSlug = function() {
  let baseSlug = slugify(this.title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
  
  // Ensure uniqueness
  return baseSlug + '-' + Date.now();
};

articleSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  return this.save();
};

articleSchema.methods.incrementLikes = function() {
  this.stats.likes += 1;
  return this.save();
};

articleSchema.methods.incrementShares = function() {
  this.stats.shares += 1;
  return this.save();
};

articleSchema.methods.updateCommentsCount = async function() {
  const Comment = mongoose.model('Comment');
  const count = await Comment.countDocuments({ 
    article: this._id, 
    status: 'approved' 
  });
  this.stats.commentsCount = count;
  return this.save();
};

articleSchema.methods.generateSEO = function() {
  if (!this.seo.metaTitle) {
    this.seo.metaTitle = this.title;
  }
  if (!this.seo.metaDescription) {
    this.seo.metaDescription = this.excerpt;
  }
  if (!this.seo.ogTitle) {
    this.seo.ogTitle = this.title;
  }
  if (!this.seo.ogDescription) {
    this.seo.ogDescription = this.excerpt;
  }
  if (!this.seo.keywords || this.seo.keywords.length === 0) {
    this.seo.keywords = this.tags;
  }
};

// Static methods
articleSchema.statics.findPublished = function() {
  return this.find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .populate('author', 'name avatar');
};

articleSchema.statics.findByCategory = function(category) {
  return this.find({ category, status: 'published' })
    .sort({ publishedAt: -1 })
    .populate('author', 'name avatar');
};

articleSchema.statics.findByTag = function(tag) {
  return this.find({ tags: tag, status: 'published' })
    .sort({ publishedAt: -1 })
    .populate('author', 'name avatar');
};

articleSchema.statics.findTrending = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ 'stats.views': -1, publishedAt: -1 })
    .limit(limit)
    .populate('author', 'name avatar');
};

articleSchema.statics.findRecent = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .populate('author', 'name avatar');
};

articleSchema.statics.searchArticles = function(query, options = {}) {
  const { category, tags, limit = 20, skip = 0 } = options;
  
  let searchQuery = {
    $text: { $search: query },
    status: 'published'
  };
  
  if (category) searchQuery.category = category;
  if (tags && tags.length > 0) searchQuery.tags = { $in: tags };
  
  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, publishedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'name avatar');
};

// Pre-save middleware
articleSchema.pre('save', function(next) {
  // Generate slug if not exists
  if (!this.slug) {
    this.slug = this.generateSlug();
  }
  
  // Update lastModified
  this.lastModified = new Date();
  
  // Calculate read time
  if (this.content && this.stats.readTime === 0) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.stats.readTime = Math.ceil(wordCount / wordsPerMinute);
  }
  
  // Generate SEO data
  this.generateSEO();
  
  next();
});

// Create and export model
const Article = mongoose.model('Article', articleSchema);

export default Article;

