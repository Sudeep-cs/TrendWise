export interface Article {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: {
    url: string;
    alt: string;
    caption?: string;
  };
  author?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  category: ArticleCategory;
  tags: string[];
  status: ArticleStatus;
  isAIGenerated: boolean;
  trendData?: {
    keyword: string;
    trendScore: number;
    source: TrendSource;
    fetchedAt: string;
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
  };
  stats: {
    views: number;
    likes: number;
    shares: number;
    commentsCount: number;
    readTime: number;
  };
  publishedAt: string;
  lastModified: string;
  createdAt: string;
  updatedAt: string;
}

export type ArticleCategory = 
  | 'technology'
  | 'business'
  | 'health'
  | 'entertainment'
  | 'sports'
  | 'politics'
  | 'science'
  | 'lifestyle'
  | 'travel'
  | 'food'
  | 'fashion'
  | 'education'
  | 'finance'
  | 'environment'
  | 'other';

export type ArticleStatus = 'draft' | 'published' | 'archived';

export type TrendSource = 'google-trends' | 'twitter' | 'reddit' | 'manual';

export interface ArticleListResponse {
  success: boolean;
  data: Article[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalArticles: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ArticleResponse {
  success: boolean;
  data: Article;
}

export interface CreateArticleData {
  title: string;
  content: string;
  excerpt: string;
  category: ArticleCategory;
  tags?: string[];
  featuredImage?: {
    url: string;
    alt: string;
    caption?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };
  status?: ArticleStatus;
}

export interface UpdateArticleData extends Partial<CreateArticleData> {
  _id: string;
}

export interface ArticleFilters {
  page?: number;
  limit?: number;
  category?: ArticleCategory;
  tags?: string[];
  search?: string;
  sortBy?: 'publishedAt' | 'views' | 'title' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  status?: ArticleStatus;
}

export interface ArticleStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  totalViews: number;
  recent: Article[];
  topViewed: Article[];
}

export interface TrendingTopic {
  keyword: string;
  traffic?: string;
  relatedQueries?: string[];
  articles?: {
    title: string;
    url: string;
    source: string;
    snippet: string;
  }[];
  source: TrendSource;
  category: ArticleCategory;
  fetchedAt: string;
  trendScore: number;
  position?: number;
  url?: string;
  subreddit?: string;
}

export interface TrendsResponse {
  success: boolean;
  data: TrendingTopic[];
  cached?: boolean;
  cacheAge?: number;
  totalFetched?: number;
}

export interface GenerateArticlesRequest {
  maxArticles?: number;
  categories?: ArticleCategory[];
  useCache?: boolean;
  articleOptions?: {
    wordCount?: number;
    tone?: string;
    includeImages?: boolean;
  };
}

export interface GenerateArticlesResponse {
  success: boolean;
  data: Article[];
  message: string;
  generatedAt: string;
  trendsUsed?: string[];
}

