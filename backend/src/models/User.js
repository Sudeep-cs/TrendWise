import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    }
  },
  stats: {
    commentsCount: {
      type: Number,
      default: 0
    },
    articlesRead: {
      type: Number,
      default: 0
    }
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

// Indexes for performance
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user's full profile
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    role: this.role,
    stats: this.stats,
    createdAt: this.createdAt
  };
});

// Instance methods
userSchema.methods.toSafeObject = function() {
  const user = this.toObject();
  delete user.googleId;
  return user;
};

userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

userSchema.methods.incrementCommentsCount = function() {
  this.stats.commentsCount += 1;
  return this.save();
};

userSchema.methods.incrementArticlesRead = function() {
  this.stats.articlesRead += 1;
  return this.save();
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase(), isActive: true });
};

userSchema.statics.findByGoogleId = function(googleId) {
  return this.findOne({ googleId, isActive: true });
};

userSchema.statics.getActiveUsers = function() {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

userSchema.statics.getAdmins = function() {
  return this.find({ role: 'admin', isActive: true });
};

// Pre-save middleware
userSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

// Create and export model
const User = mongoose.model('User', userSchema);

export default User;

