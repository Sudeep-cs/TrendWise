# TrendWise - AI-Powered Blog Platform

![TrendWise Logo](./docs/logo.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green)](https://www.mongodb.com/)

TrendWise is a modern, full-stack blog platform that leverages artificial intelligence to automatically discover trending topics and generate high-quality, SEO-optimized articles. Built with Next.js 14+, Node.js, and MongoDB, it provides a complete solution for content creators and businesses looking to stay ahead of the curve with trending content.

## 🌟 Features

### Core Features
- **AI-Powered Content Generation**: Automatically generates articles using OpenAI/Gemini API based on trending topics
- **Trend Discovery**: Fetches trending topics from Google Trends, Twitter, and Reddit
- **SEO Optimization**: Built-in SEO features including dynamic sitemaps, meta tags, and structured data
- **User Authentication**: Google OAuth integration with NextAuth.js
- **Comment System**: Real-time commenting with user authentication and moderation
- **Admin Dashboard**: Comprehensive admin panel for content and user management
- **Responsive Design**: Mobile-first design with dark/light theme support

### Technical Features
- **Modern Stack**: Next.js 14+ with App Router, TypeScript, TailwindCSS
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with Google OAuth
- **API**: RESTful API with Express.js
- **Deployment Ready**: Configured for Vercel (frontend) and Render/Heroku (backend)
- **Performance**: Optimized with ISR, image optimization, and caching
- **Accessibility**: WCAG 2.1 compliant with screen reader support

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local installation or MongoDB Atlas)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/trendwise.git
   cd trendwise
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   
   Copy the example environment files and configure them:
   
   **Backend (.env)**:
   ```bash
   cd ../backend
   cp .env.example .env
   ```
   
   **Frontend (.env.local)**:
   ```bash
   cd ../frontend
   cp .env.example .env.local
   ```

5. **Configure your environment variables** (see [Environment Configuration](#environment-configuration) section)

6. **Start the development servers**
   
   **Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   
   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
TrendWise/
├── backend/                    # Node.js/Express backend
│   ├── src/
│   │   ├── models/            # MongoDB models
│   │   │   ├── Article.js     # Article schema
│   │   │   ├── Comment.js     # Comment schema
│   │   │   └── User.js        # User schema
│   │   ├── routes/            # API routes
│   │   │   ├── articles.js    # Article endpoints
│   │   │   ├── comments.js    # Comment endpoints
│   │   │   ├── trends.js      # Trend endpoints
│   │   │   └── admin.js       # Admin endpoints
│   │   ├── services/          # Business logic
│   │   │   ├── trendService.js    # Trend fetching
│   │   │   ├── openaiService.js   # AI article generation
│   │   │   └── articleService.js  # Article management
│   │   ├── utils/             # Utility functions
│   │   │   ├── database.js    # MongoDB connection
│   │   │   └── logger.js      # Winston logger
│   │   ├── scripts/           # Automation scripts
│   │   │   ├── fetchTrends.js     # Trend fetching script
│   │   │   └── generateArticles.js # Article generation script
│   │   └── server.js          # Express server
│   ├── package.json
│   └── .env                   # Backend environment variables
├── frontend/                  # Next.js frontend
│   ├── app/                   # Next.js 14+ App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── globals.css        # Global styles
│   │   ├── sitemap.xml/       # Dynamic sitemap
│   │   ├── robots.txt/        # Dynamic robots.txt
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── layout/            # Layout components
│   │   ├── home/              # Home page components
│   │   ├── ui/                # Reusable UI components
│   │   └── providers.tsx      # Context providers
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── api.ts             # API client
│   │   ├── utils.ts           # Utility functions
│   │   └── mongodb.ts         # MongoDB connection
│   ├── types/                 # TypeScript type definitions
│   │   ├── article.ts         # Article types
│   │   ├── comment.ts         # Comment types
│   │   └── user.ts            # User types
│   ├── styles/                # Additional styles
│   ├── public/                # Static assets
│   ├── package.json
│   ├── next.config.js         # Next.js configuration
│   ├── tailwind.config.js     # TailwindCSS configuration
│   ├── tsconfig.json          # TypeScript configuration
│   └── .env.local             # Frontend environment variables
├── docs/                      # Documentation
│   ├── folder-structure.md    # Project structure
│   ├── api-documentation.md   # API documentation
│   └── deployment-guide.md    # Deployment instructions
├── todo.md                    # Development progress
└── README.md                  # This file
```

## ⚙️ Environment Configuration

### Backend Environment Variables (.env)

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/trendwise

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Trend Fetching Configuration
FETCH_GOOGLE_TRENDS=true
FETCH_TWITTER_TRENDS=true
TRENDS_GEO=US
TRENDS_LIMIT=50

# Article Generation Configuration
MAX_ARTICLES_PER_RUN=3
ARTICLE_WORD_COUNT=1200
```

### Frontend Environment Variables (.env.local)

Create a `.env.local` file in the `frontend` directory:

```env
# Next.js Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/trendwise

# Admin Configuration
ADMIN_EMAILS=admin@trendwise.com,your-admin-email@example.com
```

### Required API Keys and Services

To fully configure TrendWise, you'll need to obtain the following API keys and set up these services:

#### 1. OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Add the key to your backend `.env` file as `OPENAI_API_KEY`

#### 2. Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy Client ID and Client Secret to both backend and frontend `.env` files

#### 3. MongoDB Database
**Option A: Local MongoDB**
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/trendwise`

**Option B: MongoDB Atlas (Recommended)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Configure network access (add your IP)
4. Create database user
5. Get connection string and add to `.env` files

#### 4. Additional Services (Optional)
- **Twitter API**: For Twitter trend fetching
- **Reddit API**: For Reddit trend analysis
- **Google Analytics**: For website analytics
- **Sentry**: For error tracking

## 🔧 Development

### Available Scripts

#### Backend Scripts
```bash
# Start development server with hot reload
npm run dev

# Start production server
npm start

# Run trend fetching script
npm run fetch-trends

# Generate articles from trends
npm run generate-articles

# Run database migrations
npm run migrate

# Seed database with sample data
npm run seed
```

#### Frontend Scripts
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check

# Export static site
npm run export
```

### Development Workflow

1. **Start both servers** in development mode
2. **Make changes** to your code
3. **Test locally** using the browser
4. **Run linting** and type checking
5. **Commit changes** with descriptive messages
6. **Deploy** to staging/production

### Database Management

#### Running Migrations
```bash
cd backend
npm run migrate
```

#### Seeding Sample Data
```bash
cd backend
npm run seed
```

#### Manual Trend Fetching
```bash
cd backend
node src/scripts/fetchTrends.js
```

#### Manual Article Generation
```bash
cd backend
node src/scripts/generateArticles.js
```

## 🚀 Deployment

TrendWise is designed to be deployed with the frontend on Vercel and the backend on Render or Heroku. Here's how to deploy each component:

### Frontend Deployment (Vercel)

1. **Prepare for deployment**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

3. **Configure environment variables** in Vercel dashboard:
   - Go to your project settings
   - Add all environment variables from `.env.local`
   - Update `NEXTAUTH_URL` to your production domain
   - Update `NEXT_PUBLIC_BACKEND_URL` to your backend URL

### Backend Deployment (Render)

1. **Create a Render account** at [render.com](https://render.com)

2. **Create a new Web Service**
   - Connect your GitHub repository
   - Select the `backend` directory
   - Configure build and start commands:
     ```
     Build Command: npm install
     Start Command: npm start
     ```

3. **Configure environment variables** in Render dashboard:
   - Add all variables from backend `.env`
   - Update `FRONTEND_URL` to your Vercel domain
   - Update `MONGODB_URI` to your production database

### Backend Deployment (Heroku)

1. **Install Heroku CLI** and login
   ```bash
   heroku login
   ```

2. **Create Heroku app**
   ```bash
   cd backend
   heroku create your-app-name
   ```

3. **Configure environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_production_mongodb_uri
   heroku config:set OPENAI_API_KEY=your_openai_key
   # ... add all other environment variables
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Database Deployment (MongoDB Atlas)

1. **Create MongoDB Atlas cluster**
2. **Configure network access** (allow all IPs for production: 0.0.0.0/0)
3. **Create database user** with read/write permissions
4. **Get connection string** and update in environment variables
5. **Run initial data seeding** if needed

### Post-Deployment Configuration

1. **Update CORS settings** in backend to allow your frontend domain
2. **Configure custom domain** (optional) in Vercel
3. **Set up monitoring** and error tracking
4. **Configure automated backups** for your database
5. **Set up CI/CD pipeline** for automated deployments

## 📚 API Documentation

### Authentication

All API endpoints that require authentication expect a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Articles API

#### Get Articles
```http
GET /api/articles?page=1&limit=12&category=technology
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)
- `category` (optional): Filter by category
- `search` (optional): Search query
- `sortBy` (optional): Sort field (publishedAt, views, title)
- `sortOrder` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "article_id",
      "title": "Article Title",
      "slug": "article-slug",
      "excerpt": "Article excerpt...",
      "category": "technology",
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "stats": {
        "views": 1500,
        "likes": 45,
        "commentsCount": 12
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalArticles": 60
  }
}
```

#### Get Single Article
```http
GET /api/articles/:slug
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "article_id",
    "title": "Article Title",
    "slug": "article-slug",
    "content": "Full article content...",
    "excerpt": "Article excerpt...",
    "featuredImage": {
      "url": "image_url",
      "alt": "Image description"
    },
    "category": "technology",
    "tags": ["AI", "Technology"],
    "seo": {
      "metaTitle": "SEO Title",
      "metaDescription": "SEO Description"
    },
    "publishedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Comments API

#### Get Comments for Article
```http
GET /api/comments/article/:articleId?page=1&limit=20
```

#### Create Comment (Requires Authentication)
```http
POST /api/comments
Content-Type: application/json

{
  "content": "Comment content",
  "article": "article_id",
  "parentComment": "parent_comment_id" // optional for replies
}
```

### Trends API

#### Get Current Trends
```http
GET /api/trends?source=google&limit=50
```

**Query Parameters:**
- `source` (optional): Trend source (google, twitter, reddit, all)
- `limit` (optional): Number of trends to return
- `category` (optional): Filter by category
- `geo` (optional): Geographic location

### Admin API (Requires Admin Role)

#### Generate Articles
```http
POST /api/admin/articles/generate
Content-Type: application/json

{
  "maxArticles": 3,
  "categories": ["technology", "business"],
  "articleOptions": {
    "wordCount": 1200,
    "tone": "informative"
  }
}
```

#### Get Dashboard Stats
```http
GET /api/admin/stats
```

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

### Test Coverage

```bash
# Generate coverage report
npm run test:coverage
```

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Article browsing and reading
- [ ] Comment creation and moderation
- [ ] Search functionality
- [ ] Admin dashboard access
- [ ] Trend fetching and article generation
- [ ] SEO meta tags and sitemap
- [ ] Mobile responsiveness
- [ ] Dark/light theme switching
- [ ] Performance and loading times

## 🔒 Security

### Security Features

- **Authentication**: Secure OAuth 2.0 with Google
- **Authorization**: Role-based access control (user/admin)
- **Data Validation**: Input validation and sanitization
- **CORS**: Configured for specific origins
- **Rate Limiting**: API rate limiting to prevent abuse
- **Security Headers**: CSP, HSTS, and other security headers
- **Environment Variables**: Sensitive data stored securely

### Security Best Practices

1. **Keep dependencies updated** regularly
2. **Use HTTPS** in production
3. **Validate all user inputs** on both client and server
4. **Implement proper error handling** without exposing sensitive information
5. **Regular security audits** and vulnerability scanning
6. **Monitor for suspicious activity** and implement logging
7. **Backup data regularly** and test restore procedures

## 🎨 Customization

### Theming

TrendWise uses TailwindCSS with a custom design system. You can customize the theme by modifying:

1. **Colors**: Edit `tailwind.config.js` color palette
2. **Typography**: Modify font families and sizes
3. **Components**: Update component styles in `/components`
4. **Layout**: Adjust spacing and layout in layout components

### Adding New Features

1. **Backend**: Add new routes in `/backend/src/routes`
2. **Frontend**: Create new pages in `/frontend/app`
3. **Database**: Add new models in `/backend/src/models`
4. **API**: Extend API client in `/frontend/lib/api.ts`

### Content Customization

1. **Categories**: Modify categories in configuration files
2. **Trend Sources**: Add new trend sources in trend service
3. **AI Prompts**: Customize article generation prompts
4. **SEO**: Update meta tags and structured data

## 🤝 Contributing

We welcome contributions to TrendWise! Please follow these guidelines:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

### Reporting Issues

Please use GitHub Issues to report bugs or request features. Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node.js version, etc.)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [MongoDB](https://www.mongodb.com/) - Database
- [OpenAI](https://openai.com/) - AI content generation
- [Vercel](https://vercel.com/) - Frontend hosting
- [Render](https://render.com/) - Backend hosting

## 📞 Support

- **Documentation**: Check this README and `/docs` folder
- **Issues**: Create a GitHub issue
- **Email**: hello@trendwise.com
- **Discord**: Join our community server

## 🗺️ Roadmap

### Version 2.0 (Planned)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Social media integration
- [ ] Email newsletter automation
- [ ] Advanced AI features
- [ ] Mobile app (React Native)
- [ ] Podcast generation
- [ ] Video content support

### Version 1.1 (Next Release)
- [ ] Enhanced comment system
- [ ] User profiles and preferences
- [ ] Article bookmarking
- [ ] Advanced search filters
- [ ] Performance optimizations
- [ ] Additional trend sources

---

**Built with ❤️ by the TrendWise Team**

For more information, visit our [website](https://trendwise.com) or follow us on [Twitter](https://twitter.com/trendwise).

