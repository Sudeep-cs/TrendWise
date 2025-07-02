export interface User {
  _id: string;
  googleId?: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: string;
  preferences: {
    emailNotifications: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
  stats: {
    commentsCount: number;
    articlesRead: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  stats: {
    commentsCount: number;
    articlesRead: number;
  };
  createdAt: string;
}

export interface UserListResponse {
  success: boolean;
  data: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface UserResponse {
  success: boolean;
  data: User;
  message?: string;
}

export interface UpdateUserData {
  role?: UserRole;
  isActive?: boolean;
  preferences?: {
    emailNotifications?: boolean;
    theme?: 'light' | 'dark' | 'auto';
  };
}

export interface UserFilters {
  page?: number;
  limit?: number;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserStats {
  total: number;
  active: number;
  admins: number;
  recent: User[];
}

// NextAuth types
export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: UserRole;
}

export interface AuthSession {
  user: AuthUser;
  expires: string;
}

export interface AuthToken {
  sub?: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  role?: UserRole;
  iat?: number;
  exp?: number;
  jti?: string;
}

// Authentication responses
export interface LoginResponse {
  success: boolean;
  user: User;
  token: string;
  message: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface AuthError {
  error: string;
  message: string;
  details?: any;
}

