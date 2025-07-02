# TrendWise Deployment Guide

This guide provides step-by-step instructions for deploying TrendWise to production environments.

## Overview

TrendWise uses a modern deployment architecture:
- **Frontend**: Next.js app deployed on Vercel
- **Backend**: Node.js/Express API deployed on Render or Heroku
- **Database**: MongoDB Atlas (cloud database)
- **Authentication**: Google OAuth via NextAuth.js
- **AI**: OpenAI API for content generation

## Prerequisites

Before deploying, ensure you have:
- [ ] GitHub account with your TrendWise repository
- [ ] Vercel account (for frontend)
- [ ] Render or Heroku account (for backend)
- [ ] MongoDB Atlas account (for database)
- [ ] Google Cloud Console project (for OAuth)
- [ ] OpenAI account with API access

## Step 1: Database Setup (MongoDB Atlas)

### 1.1 Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up or log in to your account
3. Click "Create a New Cluster"
4. Choose your preferred cloud provider and region
5. Select the free tier (M0) for development or appropriate tier for production
6. Click "Create Cluster"

### 1.2 Configure Database Access

1. **Network Access**:
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0) for production
   - Click "Confirm"

2. **Database User**:
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and secure password
   - Set role to "Atlas Admin" or "Read and write to any database"
   - Click "Add User"

### 1.3 Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" and version "4.1 or later"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `trendwise`

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/trendwise?retryWrites=true&w=majority
```

## Step 2: Google OAuth Setup

### 2.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click and enable it

### 2.2 Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in required information:
   - App name: "TrendWise"
   - User support email: your email
   - Developer contact information: your email
4. Add scopes: `email`, `profile`, `openid`
5. Save and continue

### 2.3 Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
5. Save and copy the Client ID and Client Secret

## Step 3: Backend Deployment (Render)

### 3.1 Prepare Backend for Deployment

1. Ensure your backend code is pushed to GitHub
2. Create a `Procfile` in the backend directory (if using Heroku):
   ```
   web: node src/server.js
   ```

### 3.2 Deploy to Render

1. Go to [Render](https://render.com) and sign up/login
2. Click "New" > "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `trendwise-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3.3 Configure Environment Variables

In Render dashboard, add these environment variables:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_atlas_connection_string
FRONTEND_URL=https://your-vercel-app.vercel.app
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_secure_jwt_secret
```

### 3.4 Deploy

1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your backend URL (e.g., `https://trendwise-backend.onrender.com`)

## Step 4: Frontend Deployment (Vercel)

### 4.1 Prepare Frontend for Deployment

1. Ensure your frontend code is pushed to GitHub
2. Test the build locally:
   ```bash
   cd frontend
   npm run build
   ```

### 4.2 Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 4.3 Configure Environment Variables

In Vercel dashboard, add these environment variables:

```env
NEXTAUTH_URL=https://your-vercel-app.vercel.app
NEXTAUTH_SECRET=your_secure_nextauth_secret
NEXT_PUBLIC_SITE_URL=https://your-vercel-app.vercel.app
NEXT_PUBLIC_BACKEND_URL=https://your-render-backend.onrender.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MONGODB_URI=your_mongodb_atlas_connection_string
ADMIN_EMAILS=your-admin-email@example.com
```

### 4.4 Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Your app will be available at `https://your-app-name.vercel.app`

## Step 5: Post-Deployment Configuration

### 5.1 Update OAuth Redirect URIs

1. Go back to Google Cloud Console
2. Update OAuth credentials with your production URL:
   - `https://your-vercel-app.vercel.app/api/auth/callback/google`

### 5.2 Update CORS Settings

Ensure your backend allows requests from your frontend domain.

### 5.3 Test the Application

1. Visit your deployed frontend URL
2. Test user registration and login
3. Verify article fetching and display
4. Test comment functionality
5. Check admin dashboard (if applicable)

## Step 6: Domain Configuration (Optional)

### 6.1 Custom Domain for Frontend

1. In Vercel dashboard, go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update environment variables with new domain

### 6.2 Custom Domain for Backend

1. In Render dashboard, go to your service settings
2. Add custom domain
3. Configure DNS records
4. Update frontend environment variables

## Step 7: Monitoring and Maintenance

### 7.1 Set Up Monitoring

1. **Error Tracking**: Configure Sentry for error monitoring
2. **Analytics**: Set up Google Analytics
3. **Uptime Monitoring**: Use services like UptimeRobot
4. **Performance**: Monitor Core Web Vitals

### 7.2 Database Monitoring

1. Monitor MongoDB Atlas metrics
2. Set up alerts for high usage
3. Configure automated backups

### 7.3 Regular Maintenance

1. **Security Updates**: Regularly update dependencies
2. **Database Cleanup**: Remove old data periodically
3. **Log Monitoring**: Check application logs regularly
4. **Performance Optimization**: Monitor and optimize slow queries

## Troubleshooting

### Common Issues

1. **OAuth Errors**:
   - Verify redirect URIs match exactly
   - Check client ID and secret
   - Ensure OAuth consent screen is configured

2. **Database Connection Issues**:
   - Verify connection string format
   - Check network access settings
   - Ensure database user has correct permissions

3. **CORS Errors**:
   - Verify frontend URL in backend CORS configuration
   - Check environment variables

4. **Build Failures**:
   - Check for TypeScript errors
   - Verify all dependencies are installed
   - Check environment variables

### Debugging Steps

1. **Check Logs**:
   - Vercel: Function logs in dashboard
   - Render: Service logs in dashboard
   - MongoDB: Atlas logs

2. **Test Locally**:
   - Use production environment variables locally
   - Test with production database

3. **Verify Environment Variables**:
   - Ensure all required variables are set
   - Check for typos in variable names

## Security Checklist

- [ ] Use HTTPS for all connections
- [ ] Secure environment variables
- [ ] Enable database authentication
- [ ] Configure proper CORS settings
- [ ] Use strong JWT secrets
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Monitor for suspicious activity

## Performance Optimization

### Frontend Optimization

1. **Image Optimization**: Use Next.js Image component
2. **Code Splitting**: Implement dynamic imports
3. **Caching**: Configure proper cache headers
4. **CDN**: Use Vercel's global CDN

### Backend Optimization

1. **Database Indexing**: Add indexes for frequently queried fields
2. **Caching**: Implement Redis caching
3. **Connection Pooling**: Configure MongoDB connection pooling
4. **Rate Limiting**: Implement API rate limiting

## Backup and Recovery

### Database Backups

1. **Automated Backups**: Enable in MongoDB Atlas
2. **Manual Backups**: Export data regularly
3. **Test Restores**: Verify backup integrity

### Code Backups

1. **Version Control**: Use Git for code versioning
2. **Multiple Repositories**: Consider backup repositories
3. **Documentation**: Keep deployment documentation updated

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancing**: Use multiple backend instances
2. **Database Sharding**: Consider for large datasets
3. **CDN**: Use global content delivery networks

### Vertical Scaling

1. **Server Resources**: Upgrade server specifications
2. **Database Tier**: Upgrade MongoDB Atlas tier
3. **Caching**: Implement advanced caching strategies

## Cost Optimization

### Free Tier Limits

1. **Vercel**: 100GB bandwidth, 1000 serverless function invocations
2. **Render**: 750 hours free per month
3. **MongoDB Atlas**: 512MB storage free
4. **OpenAI**: $5 free credit for new accounts

### Cost Monitoring

1. Set up billing alerts
2. Monitor usage regularly
3. Optimize resource usage
4. Consider reserved instances for predictable workloads

## Support and Resources

- **Documentation**: Refer to this README and docs folder
- **Community**: Join our Discord server
- **Issues**: Report bugs on GitHub
- **Email**: Contact hello@trendwise.com

---

**Deployment completed successfully!** 🎉

Your TrendWise application should now be live and accessible to users worldwide.

