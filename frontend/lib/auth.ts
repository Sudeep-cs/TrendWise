import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import type { AuthUser, AuthToken } from '@/types/user';

// MongoDB client for NextAuth
const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Allow sign in
        return true;
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      }
    },
    
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (account && user) {
        token.role = 'user'; // Default role
        
        // Check if user is admin (you can customize this logic)
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
        if (user.email && adminEmails.includes(user.email)) {
          token.role = 'admin';
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        (session.user as AuthUser).id = token.sub!;
        (session.user as AuthUser).role = token.role as 'user' | 'admin';
      }
      
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      
      return baseUrl;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', user.email);
      
      // Update user's last login time
      try {
        const db = (await clientPromise).db();
        await db.collection('users').updateOne(
          { email: user.email },
          { 
            $set: { 
              lastLogin: new Date(),
              isActive: true 
            } 
          }
        );
      } catch (error) {
        console.error('Error updating last login:', error);
      }
    },
    
    async signOut({ token }) {
      console.log('User signed out:', token.email);
    },
    
    async createUser({ user }) {
      console.log('New user created:', user.email);
      
      // Initialize user preferences and stats
      try {
        const db = (await clientPromise).db();
        await db.collection('users').updateOne(
          { email: user.email },
          {
            $set: {
              role: 'user',
              isActive: true,
              preferences: {
                emailNotifications: true,
                theme: 'auto'
              },
              stats: {
                commentsCount: 0,
                articlesRead: 0
              },
              lastLogin: new Date()
            }
          }
        );
      } catch (error) {
        console.error('Error initializing user:', error);
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

// Helper functions for authentication
export async function getCurrentUser(token: AuthToken | null): Promise<AuthUser | null> {
  if (!token?.sub) return null;
  
  try {
    const db = (await clientPromise).db();
    const user = await db.collection('users').findOne({ 
      _id: token.sub 
    });
    
    if (!user) return null;
    
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role || 'user'
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

export async function isAdmin(token: AuthToken | null): Promise<boolean> {
  if (!token?.sub) return false;
  
  try {
    const user = await getCurrentUser(token);
    return user?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function requireAuth(token: AuthToken | null): Promise<AuthUser> {
  const user = await getCurrentUser(token);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function requireAdmin(token: AuthToken | null): Promise<AuthUser> {
  const user = await requireAuth(token);
  if (user.role !== 'admin') {
    throw new Error('Admin privileges required');
  }
  return user;
}

