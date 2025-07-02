import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
    index: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'spam'],
    default: 'approved' // Auto-approve for authenticated users
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'other']
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    ipAddress: String,
    userAgent: String,
    isFromMobile: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      delete ret.metadata;
      delete ret.reports;
      return ret;
    }
  }
});

// Indexes for performance
commentSchema.index({ article: 1, status: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ status: 1 });
commentSchema.index({ createdAt: -1 });

// Virtual for replies count
commentSchema.virtual('repliesCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
  count: true,
  match: { status: 'approved' }
});

// Virtual for nested replies
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
  match: { status: 'approved' },
  options: { sort: { createdAt: 1 } }
});

// Instance methods
commentSchema.methods.like = function(userId) {
  if (!this.likedBy.includes(userId)) {
    this.likedBy.push(userId);
    this.likes += 1;
  }
  return this.save();
};

commentSchema.methods.unlike = function(userId) {
  const index = this.likedBy.indexOf(userId);
  if (index > -1) {
    this.likedBy.splice(index, 1);
    this.likes -= 1;
  }
  return this.save();
};

commentSchema.methods.isLikedBy = function(userId) {
  return this.likedBy.includes(userId);
};

commentSchema.methods.edit = function(newContent) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

commentSchema.methods.report = function(userId, reason) {
  // Check if user already reported this comment
  const existingReport = this.reports.find(
    report => report.user.toString() === userId.toString()
  );
  
  if (!existingReport) {
    this.reports.push({
      user: userId,
      reason: reason
    });
    
    // Auto-moderate if too many reports
    if (this.reports.length >= 3) {
      this.status = 'pending';
    }
  }
  
  return this.save();
};

commentSchema.methods.approve = function() {
  this.status = 'approved';
  return this.save();
};

commentSchema.methods.reject = function() {
  this.status = 'rejected';
  return this.save();
};

commentSchema.methods.markAsSpam = function() {
  this.status = 'spam';
  return this.save();
};

// Static methods
commentSchema.statics.findByArticle = function(articleId, options = {}) {
  const { status = 'approved', includeReplies = true, limit = 50, skip = 0 } = options;
  
  let query = this.find({ 
    article: articleId, 
    status: status,
    parentComment: null // Only top-level comments
  })
  .populate('author', 'name avatar')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
  
  if (includeReplies) {
    query = query.populate({
      path: 'replies',
      populate: {
        path: 'author',
        select: 'name avatar'
      }
    });
  }
  
  return query;
};

commentSchema.statics.findByUser = function(userId, options = {}) {
  const { status = 'approved', limit = 20, skip = 0 } = options;
  
  return this.find({ author: userId, status: status })
    .populate('article', 'title slug')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

commentSchema.statics.findPending = function() {
  return this.find({ status: 'pending' })
    .populate('author', 'name email avatar')
    .populate('article', 'title slug')
    .sort({ createdAt: -1 });
};

commentSchema.statics.findReported = function() {
  return this.find({ 
    'reports.0': { $exists: true },
    status: { $ne: 'spam' }
  })
  .populate('author', 'name email avatar')
  .populate('article', 'title slug')
  .sort({ 'reports.0.reportedAt': -1 });
};

commentSchema.statics.getCommentStats = function(articleId) {
  return this.aggregate([
    { $match: { article: mongoose.Types.ObjectId(articleId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Pre-save middleware
commentSchema.pre('save', async function(next) {
  // Update article's comment count if this is a new approved comment
  if (this.isNew && this.status === 'approved') {
    const Article = mongoose.model('Article');
    await Article.findByIdAndUpdate(
      this.article,
      { $inc: { 'stats.commentsCount': 1 } }
    );
    
    // Update user's comment count
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(
      this.author,
      { $inc: { 'stats.commentsCount': 1 } }
    );
  }
  
  next();
});

// Post-remove middleware
commentSchema.post('remove', async function(doc) {
  // Update article's comment count
  const Article = mongoose.model('Article');
  await Article.findByIdAndUpdate(
    doc.article,
    { $inc: { 'stats.commentsCount': -1 } }
  );
  
  // Update user's comment count
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(
    doc.author,
    { $inc: { 'stats.commentsCount': -1 } }
  );
  
  // Remove all replies to this comment
  await this.constructor.deleteMany({ parentComment: doc._id });
});

// Create and export model
const Comment = mongoose.model('Comment', commentSchema);

export default Comment;

