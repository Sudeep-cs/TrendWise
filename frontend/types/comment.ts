export interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  article: string;
  parentComment?: string;
  status: CommentStatus;
  isEdited: boolean;
  editedAt?: string;
  likes: number;
  likedBy: string[];
  replies?: Comment[];
  repliesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam';

export interface CommentListResponse {
  success: boolean;
  data: Comment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalComments: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CommentResponse {
  success: boolean;
  data: Comment;
  message?: string;
}

export interface CreateCommentData {
  content: string;
  article: string;
  parentComment?: string;
}

export interface UpdateCommentData {
  content: string;
}

export interface CommentFilters {
  page?: number;
  limit?: number;
  includeReplies?: boolean;
  status?: CommentStatus;
}

export interface CommentStats {
  approved: number;
  pending: number;
  rejected: number;
  spam: number;
  total: number;
}

export interface CommentStatsResponse {
  success: boolean;
  data: CommentStats;
}

export interface LikeCommentResponse {
  success: boolean;
  data: {
    commentId: string;
    likes: number;
    action: 'liked' | 'unliked';
  };
  message: string;
}

export interface ReportCommentData {
  reason: 'spam' | 'inappropriate' | 'harassment' | 'other';
  details?: string;
}

export interface ModerateCommentData {
  action: 'approve' | 'reject' | 'spam';
  reason?: string;
}

