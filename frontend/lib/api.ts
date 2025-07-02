import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getSession } from 'next-auth/react';
import type {
  Article,
  ArticleListResponse,
  ArticleResponse,
  CreateArticleData,
  UpdateArticleData,
  ArticleFilters,
  ArticleStats,
  TrendsResponse,
  GenerateArticlesRequest,
  GenerateArticlesResponse,
} from '@/types/article';
import type {
  Comment,
  CommentListResponse,
  CommentResponse,
  CreateCommentData,
  UpdateCommentData,
  CommentFilters,
  CommentStats,
  LikeCommentResponse,
  ReportCommentData,
  ModerateCommentData,
} from '@/types/comment';
import type {
  User,
  UserListResponse,
  UserResponse,
  UpdateUserData,
  UserFilters,
  UserStats,
} from '@/types/user';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession();
      if (session?.user) {
        // In a real app, you'd get the JWT token from the session
        // For now, we'll use a mock token
        config.headers.Authorization = `Bearer mock-jwt-token`;
      }
    } catch (error) {
      console.error('Error getting session for API request:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Generic API request function
async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.request<T>({
      method,
      url: endpoint,
      data,
      ...config,
    });
    
    return response.data;
  } catch (error: any) {
    console.error(`API ${method} ${endpoint} error:`, error);
    throw error.response?.data || error;
  }
}

// Article API functions
export const articleApi = {
  // Get articles with filters
  getArticles: (filters?: ArticleFilters): Promise<ArticleListResponse> =>
    apiRequest('GET', '/articles', undefined, { params: filters }),

  // Get article by slug
  getArticle: (slug: string): Promise<ArticleResponse> =>
    apiRequest('GET', `/articles/${slug}`),

  // Get trending articles
  getTrending: (limit?: number): Promise<ArticleListResponse> =>
    apiRequest('GET', '/articles/trending', undefined, { params: { limit } }),

  // Get recent articles
  getRecent: (limit?: number): Promise<ArticleListResponse> =>
    apiRequest('GET', '/articles/recent', undefined, { params: { limit } }),

  // Get articles by category
  getByCategory: (category: string, filters?: ArticleFilters): Promise<ArticleListResponse> =>
    apiRequest('GET', `/articles/category/${category}`, undefined, { params: filters }),

  // Search articles
  search: (query: string, filters?: ArticleFilters): Promise<ArticleListResponse> =>
    apiRequest('GET', '/articles/search', undefined, { params: { q: query, ...filters } }),

  // Create article (admin only)
  create: (data: CreateArticleData): Promise<ArticleResponse> =>
    apiRequest('POST', '/articles', data),

  // Update article (admin only)
  update: (id: string, data: UpdateArticleData): Promise<ArticleResponse> =>
    apiRequest('PUT', `/articles/${id}`, data),

  // Delete article (admin only)
  delete: (id: string): Promise<{ success: boolean; message: string }> =>
    apiRequest('DELETE', `/articles/${id}`),

  // Get article statistics
  getStats: (): Promise<{ success: boolean; data: ArticleStats }> =>
    apiRequest('GET', '/articles/stats/overview'),

  // Get sitemap data
  getSitemapData: (): Promise<{ success: boolean; data: any[] }> =>
    apiRequest('GET', '/articles/sitemap/data'),
};

// Comment API functions
export const commentApi = {
  // Get comments for article
  getByArticle: (articleId: string, filters?: CommentFilters): Promise<CommentListResponse> =>
    apiRequest('GET', `/comments/article/${articleId}`, undefined, { params: filters }),

  // Get comments by user
  getByUser: (userId: string, filters?: CommentFilters): Promise<CommentListResponse> =>
    apiRequest('GET', `/comments/user/${userId}`, undefined, { params: filters }),

  // Create comment
  create: (data: CreateCommentData): Promise<CommentResponse> =>
    apiRequest('POST', '/comments', data),

  // Update comment
  update: (id: string, data: UpdateCommentData): Promise<CommentResponse> =>
    apiRequest('PUT', `/comments/${id}`, data),

  // Delete comment
  delete: (id: string): Promise<{ success: boolean; message: string }> =>
    apiRequest('DELETE', `/comments/${id}`),

  // Like/unlike comment
  toggleLike: (id: string): Promise<LikeCommentResponse> =>
    apiRequest('POST', `/comments/${id}/like`),

  // Report comment
  report: (id: string, data: ReportCommentData): Promise<{ success: boolean; message: string }> =>
    apiRequest('POST', `/comments/${id}/report`, data),

  // Get comment statistics
  getStats: (articleId: string): Promise<{ success: boolean; data: CommentStats }> =>
    apiRequest('GET', `/comments/stats/${articleId}`),
};

// Trends API functions
export const trendsApi = {
  // Get current trends
  getTrends: (params?: {
    source?: 'google' | 'twitter' | 'reddit' | 'all';
    category?: string;
    geo?: string;
    limit?: number;
    fresh?: boolean;
  }): Promise<TrendsResponse> =>
    apiRequest('GET', '/trends', undefined, { params }),

  // Get trends by source
  getBySource: (source: string, params?: {
    geo?: string;
    category?: string;
    limit?: number;
  }): Promise<TrendsResponse> =>
    apiRequest('GET', `/trends/source/${source}`, undefined, { params }),

  // Fetch new trends (admin only)
  fetch: (data?: {
    sources?: string[];
    geo?: string;
    categories?: string[];
    limit?: number;
  }): Promise<TrendsResponse> =>
    apiRequest('POST', '/trends/fetch', data),

  // Generate articles from trends (admin only)
  generateArticles: (data?: GenerateArticlesRequest): Promise<GenerateArticlesResponse> =>
    apiRequest('POST', '/trends/generate-articles', data),

  // Get trend statistics
  getStats: (): Promise<{ success: boolean; data: any }> =>
    apiRequest('GET', '/trends/stats'),

  // Clear trends cache (admin only)
  clearCache: (): Promise<{ success: boolean; message: string }> =>
    apiRequest('DELETE', '/trends/cache'),
};

// Admin API functions
export const adminApi = {
  // Get dashboard statistics
  getStats: (): Promise<{ success: boolean; data: any }> =>
    apiRequest('GET', '/admin/stats'),

  // Get all articles for admin
  getArticles: (filters?: ArticleFilters): Promise<ArticleListResponse> =>
    apiRequest('GET', '/admin/articles', undefined, { params: filters }),

  // Get pending comments
  getPendingComments: (filters?: { page?: number; limit?: number }): Promise<CommentListResponse> =>
    apiRequest('GET', '/admin/comments/pending', undefined, { params: filters }),

  // Get reported comments
  getReportedComments: (filters?: { page?: number; limit?: number }): Promise<CommentListResponse> =>
    apiRequest('GET', '/admin/comments/reported', undefined, { params: filters }),

  // Moderate comment
  moderateComment: (id: string, data: ModerateCommentData): Promise<CommentResponse> =>
    apiRequest('PUT', `/admin/comments/${id}/moderate`, data),

  // Generate articles manually
  generateArticles: (data?: GenerateArticlesRequest): Promise<GenerateArticlesResponse> =>
    apiRequest('POST', '/admin/articles/generate', data),

  // Get system health
  getSystemHealth: (): Promise<{ success: boolean; data: any }> =>
    apiRequest('GET', '/admin/system/health'),

  // Get users
  getUsers: (filters?: UserFilters): Promise<UserListResponse> =>
    apiRequest('GET', '/admin/users', undefined, { params: filters }),

  // Update user
  updateUser: (id: string, data: UpdateUserData): Promise<UserResponse> =>
    apiRequest('PUT', `/admin/users/${id}`, data),
};

// Health check
export const healthApi = {
  check: (): Promise<{ status: string; timestamp: string; uptime: number }> =>
    apiRequest('GET', '/health'),
};

// Export the main API client for custom requests
export { apiClient };

// Error handling utility
export function handleApiError(error: any): string {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

