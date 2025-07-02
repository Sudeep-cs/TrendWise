import OpenAI from 'openai';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('OpenAIService');

class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.models = {
      gpt4: 'gpt-4-turbo-preview',
      gpt35: 'gpt-3.5-turbo',
      gpt4o: 'gpt-4o'
    };
    
    this.defaultModel = this.models.gpt35; // Use GPT-3.5 for cost efficiency
  }

  /**
   * Generate a comprehensive article based on a trending topic
   * @param {Object} trendData - Trending topic data
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated article data
   */
  async generateArticle(trendData, options = {}) {
    try {
      const {
        model = this.defaultModel,
        wordCount = 1200,
        tone = 'informative',
        includeImages = true,
        category = 'general'
      } = options;

      logger.info(`Generating article for trend: ${trendData.keyword}`);

      // Create comprehensive prompt
      const prompt = this.createArticlePrompt(trendData, {
        wordCount,
        tone,
        category
      });

      // Generate article content
      const completion = await this.client.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: Math.min(4000, Math.ceil(wordCount * 1.5)),
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const generatedContent = completion.choices[0].message.content;
      
      // Parse the generated content
      const articleData = this.parseGeneratedContent(generatedContent, trendData);
      
      // Generate SEO metadata
      const seoData = await this.generateSEOMetadata(articleData, trendData);
      
      // Combine all data
      const finalArticle = {
        ...articleData,
        seo: seoData,
        trendData: {
          keyword: trendData.keyword,
          trendScore: trendData.trendScore,
          source: trendData.source,
          fetchedAt: trendData.fetchedAt
        },
        isAIGenerated: true,
        category: category,
        stats: {
          views: 0,
          likes: 0,
          shares: 0,
          commentsCount: 0,
          readTime: Math.ceil(articleData.content.split(' ').length / 200)
        }
      };

      logger.info(`Successfully generated article: ${finalArticle.title}`);
      return finalArticle;

    } catch (error) {
      logger.error('Error generating article:', error);
      throw new Error(`Failed to generate article: ${error.message}`);
    }
  }

  /**
   * Generate multiple articles from trending topics
   * @param {Array} trends - Array of trending topics
   * @param {Object} options - Generation options
   * @returns {Promise<Array>} Array of generated articles
   */
  async generateMultipleArticles(trends, options = {}) {
    const {
      maxArticles = 5,
      delay = 2000, // Delay between requests to avoid rate limiting
      ...articleOptions
    } = options;

    const articles = [];
    const selectedTrends = trends.slice(0, maxArticles);

    for (let i = 0; i < selectedTrends.length; i++) {
      try {
        const trend = selectedTrends[i];
        logger.info(`Generating article ${i + 1}/${selectedTrends.length} for: ${trend.keyword}`);
        
        const article = await this.generateArticle(trend, articleOptions);
        articles.push(article);
        
        // Add delay to avoid rate limiting
        if (i < selectedTrends.length - 1) {
          await this.sleep(delay);
        }
        
      } catch (error) {
        logger.error(`Failed to generate article for trend: ${selectedTrends[i].keyword}`, error);
        // Continue with next trend instead of failing completely
      }
    }

    logger.info(`Generated ${articles.length} articles from ${selectedTrends.length} trends`);
    return articles;
  }

  /**
   * Generate SEO metadata for an article
   * @param {Object} articleData - Article data
   * @param {Object} trendData - Trend data
   * @returns {Promise<Object>} SEO metadata
   */
  async generateSEOMetadata(articleData, trendData) {
    try {
      const prompt = `Generate SEO metadata for this article:

Title: ${articleData.title}
Excerpt: ${articleData.excerpt}
Keyword: ${trendData.keyword}

Please provide:
1. Meta title (max 60 characters)
2. Meta description (max 160 characters)
3. 5-7 relevant keywords
4. Open Graph title
5. Open Graph description

Format as JSON with keys: metaTitle, metaDescription, keywords, ogTitle, ogDescription`;

      const completion = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          {
            role: 'system',
            content: 'You are an SEO expert. Generate optimized metadata that will rank well in search engines.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      });

      const seoContent = completion.choices[0].message.content;
      
      try {
        // Try to parse as JSON
        const seoData = JSON.parse(seoContent);
        return {
          metaTitle: seoData.metaTitle || articleData.title,
          metaDescription: seoData.metaDescription || articleData.excerpt,
          keywords: seoData.keywords || [trendData.keyword],
          ogTitle: seoData.ogTitle || articleData.title,
          ogDescription: seoData.ogDescription || articleData.excerpt
        };
      } catch (parseError) {
        // Fallback to manual parsing if JSON parsing fails
        return this.parseSEOContent(seoContent, articleData, trendData);
      }

    } catch (error) {
      logger.error('Error generating SEO metadata:', error);
      // Return fallback SEO data
      return {
        metaTitle: articleData.title,
        metaDescription: articleData.excerpt,
        keywords: [trendData.keyword],
        ogTitle: articleData.title,
        ogDescription: articleData.excerpt
      };
    }
  }

  /**
   * Create article generation prompt
   * @param {Object} trendData - Trending topic data
   * @param {Object} options - Generation options
   * @returns {string} Article prompt
   */
  createArticlePrompt(trendData, options) {
    const { wordCount, tone, category } = options;
    
    return `Write a comprehensive, engaging, and SEO-optimized blog article about the trending topic: "${trendData.keyword}"

Requirements:
- Word count: approximately ${wordCount} words
- Tone: ${tone}
- Category: ${category}
- Include relevant subheadings (H2, H3)
- Write in a conversational yet professional style
- Include actionable insights where applicable
- Ensure the content is original and valuable to readers
- Structure the article with clear introduction, body, and conclusion

Additional context:
${trendData.relatedQueries ? `Related queries: ${trendData.relatedQueries.join(', ')}` : ''}
${trendData.articles ? `Reference articles: ${trendData.articles.map(a => a.title).join(', ')}` : ''}

Please format your response as follows:
TITLE: [Article title]
EXCERPT: [Brief excerpt/summary in 2-3 sentences]
TAGS: [5-7 relevant tags separated by commas]
CONTENT: [Full article content with proper markdown formatting]

Make sure the title is catchy and SEO-friendly, the excerpt summarizes the key points, and the content is well-structured with proper headings.`;
  }

  /**
   * Get system prompt for article generation
   * @returns {string} System prompt
   */
  getSystemPrompt() {
    return `You are an expert content writer and SEO specialist. You create high-quality, engaging blog articles that:

1. Are well-researched and factually accurate
2. Follow SEO best practices
3. Engage readers with compelling storytelling
4. Provide genuine value and insights
5. Use proper markdown formatting
6. Include relevant keywords naturally
7. Have clear structure with headings and subheadings
8. Are optimized for readability and user engagement

Always write original content that would rank well in search engines and provide real value to readers. Avoid clickbait and ensure all information is accurate and up-to-date.`;
  }

  /**
   * Parse generated content into structured data
   * @param {string} content - Generated content
   * @param {Object} trendData - Trend data
   * @returns {Object} Parsed article data
   */
  parseGeneratedContent(content, trendData) {
    const lines = content.split('\n');
    let title = '';
    let excerpt = '';
    let tags = [];
    let articleContent = '';
    let currentSection = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('TITLE:')) {
        title = trimmedLine.replace('TITLE:', '').trim();
        currentSection = 'title';
      } else if (trimmedLine.startsWith('EXCERPT:')) {
        excerpt = trimmedLine.replace('EXCERPT:', '').trim();
        currentSection = 'excerpt';
      } else if (trimmedLine.startsWith('TAGS:')) {
        const tagString = trimmedLine.replace('TAGS:', '').trim();
        tags = tagString.split(',').map(tag => tag.trim().toLowerCase());
        currentSection = 'tags';
      } else if (trimmedLine.startsWith('CONTENT:')) {
        currentSection = 'content';
      } else if (currentSection === 'content' && trimmedLine) {
        articleContent += line + '\n';
      }
    }

    // Fallback parsing if structured format is not followed
    if (!title || !excerpt || !articleContent) {
      const fallbackData = this.fallbackParsing(content, trendData);
      title = title || fallbackData.title;
      excerpt = excerpt || fallbackData.excerpt;
      articleContent = articleContent || fallbackData.content;
      tags = tags.length > 0 ? tags : fallbackData.tags;
    }

    return {
      title: title || `Understanding ${trendData.keyword}: A Comprehensive Guide`,
      excerpt: excerpt || `Explore the trending topic of ${trendData.keyword} and discover its impact and significance.`,
      content: articleContent.trim() || content,
      tags: tags.length > 0 ? tags : [trendData.keyword.toLowerCase()],
      slug: this.generateSlug(title || trendData.keyword)
    };
  }

  /**
   * Fallback parsing when structured format is not followed
   * @param {string} content - Generated content
   * @param {Object} trendData - Trend data
   * @returns {Object} Parsed data
   */
  fallbackParsing(content, trendData) {
    const lines = content.split('\n').filter(line => line.trim());
    
    // Try to extract title from first heading
    let title = '';
    for (const line of lines) {
      if (line.startsWith('#') || line.trim().length > 20) {
        title = line.replace(/^#+\s*/, '').trim();
        break;
      }
    }
    
    // Generate excerpt from first paragraph
    const paragraphs = content.split('\n\n').filter(p => p.trim() && !p.startsWith('#'));
    const excerpt = paragraphs[0] ? paragraphs[0].substring(0, 200) + '...' : '';
    
    // Generate tags from keyword
    const tags = [
      trendData.keyword.toLowerCase(),
      ...trendData.keyword.toLowerCase().split(' ').filter(word => word.length > 3)
    ];

    return {
      title: title || `${trendData.keyword}: Latest Trends and Insights`,
      excerpt: excerpt || `Discover the latest insights about ${trendData.keyword} and its growing significance.`,
      content: content,
      tags: [...new Set(tags)] // Remove duplicates
    };
  }

  /**
   * Parse SEO content manually
   * @param {string} content - SEO content
   * @param {Object} articleData - Article data
   * @param {Object} trendData - Trend data
   * @returns {Object} SEO data
   */
  parseSEOContent(content, articleData, trendData) {
    const lines = content.split('\n');
    const seoData = {
      metaTitle: articleData.title,
      metaDescription: articleData.excerpt,
      keywords: [trendData.keyword],
      ogTitle: articleData.title,
      ogDescription: articleData.excerpt
    };

    for (const line of lines) {
      const trimmedLine = line.trim().toLowerCase();
      if (trimmedLine.includes('meta title') || trimmedLine.includes('title:')) {
        const title = line.split(':')[1]?.trim();
        if (title) seoData.metaTitle = title;
      } else if (trimmedLine.includes('meta description') || trimmedLine.includes('description:')) {
        const description = line.split(':')[1]?.trim();
        if (description) seoData.metaDescription = description;
      } else if (trimmedLine.includes('keywords')) {
        const keywords = line.split(':')[1]?.trim();
        if (keywords) seoData.keywords = keywords.split(',').map(k => k.trim());
      }
    }

    return seoData;
  }

  /**
   * Generate URL slug from title
   * @param {string} title - Article title
   * @returns {string} URL slug
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  /**
   * Sleep utility for rate limiting
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Sleep promise
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if OpenAI API is configured
   * @returns {boolean} Configuration status
   */
  isConfigured() {
    return !!process.env.OPENAI_API_KEY;
  }

  /**
   * Test OpenAI connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      });
      return true;
    } catch (error) {
      logger.error('OpenAI connection test failed:', error);
      return false;
    }
  }
}

export default OpenAIService;

