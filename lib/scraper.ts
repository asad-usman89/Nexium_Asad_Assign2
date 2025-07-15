import axios from 'axios'
import * as cheerio from 'cheerio'

export interface ScrapedContent {
  title: string
  content: string
  url: string
  scrapedAt: Date
}

export async function scrapeBlogContent(url: string): Promise<ScrapedContent> {
  try {
    // Fetch the webpage
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000 // 10 second timeout
    })

    // Parse the HTML
    const $ = cheerio.load(response.data)

    // Extract title
    let title = $('title').text().trim()
    if (!title) {
      title = $('h1').first().text().trim()
    }
    if (!title) {
      title = 'Untitled Blog Post'
    }

    // Extract main content
    let content = ''
    
    // Try common blog content selectors
    const contentSelectors = [
      'article',
      '.post-content',
      '.entry-content',
      '.content',
      '.post-body',
      '.article-content',
      'main',
      '[role="main"]'
    ]

    for (const selector of contentSelectors) {
      const element = $(selector)
      if (element.length > 0) {
        content = element.text().trim()
        break
      }
    }

    // If no content found with selectors, try to extract from paragraphs
    if (!content) {
      const paragraphs = $('p').map((_, el) => $(el).text().trim()).get()
      content = paragraphs.join('\n\n')
    }

    // Clean up the content
    content = content
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim()

    // Ensure we have some content
    if (!content || content.length < 50) {
      throw new Error('Could not extract sufficient content from the webpage')
    }

    return {
      title,
      content,
      url,
      scrapedAt: new Date()
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch webpage: ${error.message}`)
    }
    throw error
  }
}
