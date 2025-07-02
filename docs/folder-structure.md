# TrendWise Project Structure

```
TrendWise/
├── frontend/                    # Next.js 14+ App Router Frontend
│   ├── app/                     # App Router pages and layouts
│   │   ├── (auth)/             # Auth route group
│   │   │   ├── login/
│   │   │   └── callback/
│   │   ├── admin/              # Admin dashboard (optional)
│   │   ├── article/            # Article detail pages
│   │   │   └── [slug]/
│   │   ├── api/                # API routes
│   │   │   ├── auth/
│   │   │   ├── articles/
│   │   │   ├── comments/
│   │   │   └── admin/
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── loading.tsx         # Loading UI
│   │   └── not-found.tsx       # 404 page
│   ├── components/             # Reusable React components
│   │   ├── ui/                 # Base UI components
│   │   ├── layout/             # Layout components
│   │   ├── article/            # Article-related components
│   │   ├── auth/               # Authentication components
│   │   └── admin/              # Admin components
│   ├── lib/                    # Utility libraries
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── mongodb.ts          # MongoDB connection
│   │   ├── utils.ts            # General utilities
│   │   └── validations.ts      # Form validations
│   ├── types/                  # TypeScript type definitions
│   │   ├── article.ts
│   │   ├── comment.ts
│   │   └── user.ts
│   ├── styles/                 # Additional styles
│   ├── public/                 # Static assets
│   │   ├── robots.txt
│   │   ├── sitemap.xml
│   │   └── favicon.ico
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── .env.local
│
├── backend/                    # Node.js Backend API
│   ├── src/
│   │   ├── models/             # MongoDB models
│   │   │   ├── Article.js
│   │   │   ├── Comment.js
│   │   │   └── User.js
│   │   ├── routes/             # Express routes
│   │   │   ├── articles.js
│   │   │   ├── comments.js
│   │   │   ├── trends.js
│   │   │   └── admin.js
│   │   ├── services/           # Business logic
│   │   │   ├── trendService.js
│   │   │   ├── openaiService.js
│   │   │   └── articleService.js
│   │   ├── utils/              # Utility functions
│   │   │   ├── database.js
│   │   │   ├── logger.js
│   │   │   └── helpers.js
│   │   ├── scripts/            # Automation scripts
│   │   │   ├── fetchTrends.js
│   │   │   └── generateArticles.js
│   │   └── server.js           # Main server file
│   ├── config/
│   │   └── database.js
│   ├── package.json
│   └── .env
│
├── docs/                       # Documentation
│   ├── folder-structure.md
│   ├── deployment.md
│   └── api-documentation.md
│
├── README.md                   # Main project documentation
├── .env.example               # Environment variables template
└── .gitignore                 # Git ignore file
```

## Key Features by Directory

### Frontend (`/frontend`)
- **Next.js 14+ App Router**: Modern React framework with SSR/ISR
- **TailwindCSS**: Utility-first CSS framework
- **NextAuth.js**: Google OAuth authentication
- **TypeScript**: Type safety and better development experience
- **SEO Optimization**: Meta tags, sitemap, robots.txt

### Backend (`/backend`)
- **Express.js**: Web framework for Node.js
- **MongoDB + Mongoose**: Database and ODM
- **Puppeteer/Cheerio**: Web scraping for trends
- **OpenAI/Gemini Integration**: AI article generation
- **RESTful APIs**: Clean API design
- **Automated Scripts**: Trend fetching and article generation

### Deployment
- **Frontend**: Vercel (optimized for Next.js)
- **Backend**: Render/Heroku (Node.js hosting)
- **Database**: MongoDB Atlas (cloud database)

