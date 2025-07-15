import { NextRequest, NextResponse } from 'next/server'
import { scrapeBlogContent } from '@/lib/scraper'
import { generateSummary } from '@/lib/summarizer'
import { translateToUrdu } from '@/lib/translator'
import { databaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Step 1: Scrape the blog content
    console.log('Scraping content from:', url)
    const scrapedContent = await scrapeBlogContent(url)

    // Step 2: Generate summary using static logic
    console.log('Generating summary...')
    const summaryResult = generateSummary(scrapedContent.content)

    // Step 3: Translate summary to Urdu
    console.log('Translating to Urdu...')
    const summaryUrdu = translateToUrdu(summaryResult.summary)

    // Step 4: Save to databases
    console.log('Saving to databases...')
    const mongoId = await databaseService.saveBlogToMongoDB(
      scrapedContent,
      summaryResult,
      summaryUrdu
    )

    const supabaseId = await databaseService.saveSummaryToSupabase(
      scrapedContent,
      summaryResult,
      summaryUrdu
    )

    // Return the results
    return NextResponse.json({
      success: true,
      data: {
        title: scrapedContent.title,
        url: scrapedContent.url,
        summary: summaryResult.summary,
        summaryUrdu,
        keyPoints: summaryResult.keyPoints,
        wordCount: summaryResult.wordCount,
        originalLength: summaryResult.originalLength,
        mongoId,
        supabaseId,
        scrapedAt: scrapedContent.scrapedAt
      }
    })

  } catch (error) {
    console.error('Error in summarize API:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        error: 'Failed to process blog post',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get all summaries from Supabase
    const summaries = await databaseService.getAllSummaries()
    
    return NextResponse.json({
      success: true,
      data: summaries
    })
  } catch (error) {
    console.error('Error fetching summaries:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch summaries',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
