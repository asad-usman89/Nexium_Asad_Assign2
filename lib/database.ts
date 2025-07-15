import clientPromise from './mongodb'
import { supabase } from './supabase'
import { ScrapedContent } from './scraper'
import { SummaryResult } from './summarizer'
import { ObjectId } from 'mongodb'

export interface BlogPost {
  _id?: ObjectId | string
  title: string
  content: string
  url: string
  scrapedAt: Date
  summary: string
  summaryUrdu: string
  keyPoints: string[]
  wordCount: number
  originalLength: number
  createdAt: Date
}

export interface SummaryRecord {
  id?: number
  title: string
  summary: string
  summary_urdu: string
  url: string
  word_count: number
  original_length: number
  created_at: string
}

export class DatabaseService {
  // Save full blog content to MongoDB
  async saveBlogToMongoDB(
    scrapedContent: ScrapedContent,
    summaryResult: SummaryResult,
    summaryUrdu: string
  ): Promise<string> {
    try {
      const client = await clientPromise
      const db = client.db('blog_summarizer')
      const collection = db.collection<BlogPost>('blog_posts')

      const blogPost: BlogPost = {
        title: scrapedContent.title,
        content: scrapedContent.content,
        url: scrapedContent.url,
        scrapedAt: scrapedContent.scrapedAt,
        summary: summaryResult.summary,
        summaryUrdu,
        keyPoints: summaryResult.keyPoints,
        wordCount: summaryResult.wordCount,
        originalLength: summaryResult.originalLength,
        createdAt: new Date()
      }

      const result = await collection.insertOne(blogPost)
      return result.insertedId.toString()
    } catch (error) {
      console.error('Error saving to MongoDB:', error)
      throw new Error('Failed to save blog post to MongoDB')
    }
  }

  // Save summary to Supabase
  async saveSummaryToSupabase(
    scrapedContent: ScrapedContent,
    summaryResult: SummaryResult,
    summaryUrdu: string
  ): Promise<number> {
    try {
      const summaryRecord: Omit<SummaryRecord, 'id'> = {
        title: scrapedContent.title,
        summary: summaryResult.summary,
        summary_urdu: summaryUrdu,
        url: scrapedContent.url,
        word_count: summaryResult.wordCount,
        original_length: summaryResult.originalLength,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('blog_summaries')
        .insert([summaryRecord])
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(`Failed to save summary to Supabase: ${error.message}`)
      }

      return data[0].id
    } catch (error) {
      console.error('Error saving to Supabase:', error)
      throw new Error('Failed to save summary to Supabase')
    }
  }

  // Get all summaries from Supabase
  async getAllSummaries(): Promise<SummaryRecord[]> {
    try {
      const { data, error } = await supabase
        .from('blog_summaries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(`Failed to fetch summaries from Supabase: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error fetching summaries:', error)
      throw new Error('Failed to fetch summaries from Supabase')
    }
  }

  // Get blog post by ID from MongoDB
  async getBlogPostById(id: string): Promise<BlogPost | null> {
    try {
      const client = await clientPromise
      const db = client.db('blog_summarizer')
      const collection = db.collection<BlogPost>('blog_posts')

      const blogPost = await collection.findOne({ _id: new ObjectId(id) })

      return blogPost
    } catch (error) {
      console.error('Error fetching blog post:', error)
      throw new Error('Failed to fetch blog post from MongoDB')
    }
  }

  // Get all blog posts from MongoDB (with pagination)
  async getAllBlogPosts(limit: number = 10, skip: number = 0): Promise<BlogPost[]> {
    try {
      const client = await clientPromise
      const db = client.db('blog_summarizer')
      const collection = db.collection<BlogPost>('blog_posts')

      const blogPosts = await collection
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray()

      return blogPosts
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      throw new Error('Failed to fetch blog posts from MongoDB')
    }
  }

  // Test database connections
  async testConnections(): Promise<{ mongodb: boolean; supabase: boolean }> {
    const results = { mongodb: false, supabase: false }

    // Test MongoDB
    try {
      const client = await clientPromise
      await client.db('blog_summarizer').admin().ping()
      results.mongodb = true
    } catch (error) {
      console.error('MongoDB connection test failed:', error)
    }

    // Test Supabase
    try {
      const { error } = await supabase
        .from('blog_summaries')
        .select('count', { count: 'exact' })
        .limit(1)

      if (!error) {
        results.supabase = true
      }
    } catch (error) {
      console.error('Supabase connection test failed:', error)
    }

    return results
  }
}

export const databaseService = new DatabaseService()
