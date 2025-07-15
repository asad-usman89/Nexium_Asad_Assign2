import { NextRequest, NextResponse } from 'next/server'
import { scrapeBlogContent } from '@/lib/scraper'
import { generateSummary } from '@/lib/summarizer'
import { translateToUrdu } from '@/lib/translator'
import { geminiService } from '@/lib/gemini'
import { databaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { url, useOptimized = true } = await request.json()

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

    let summaryResult, summaryUrdu

    if (useOptimized) {
      // Use optimized combined Gemini operation
      console.log('Generating summary and translation with Gemini AI (optimized)...')
      try {
        const combined = await geminiService.generateSummaryAndTranslation(scrapedContent.content)
        summaryResult = combined.summary
        summaryUrdu = combined.translation.translatedText
      } catch (error) {
        console.warn('Optimized Gemini operation failed, falling back to separate calls:', error)
        // Fallback to separate operations
        summaryResult = await generateSummary(scrapedContent.content)
        summaryUrdu = await translateToUrdu(summaryResult.summary)
      }
    } else {
      // Use separate operations (original approach)
      console.log('Generating summary with Gemini AI...')
      summaryResult = await generateSummary(scrapedContent.content)

      console.log('Translating to Urdu with Gemini AI...')
      summaryUrdu = await translateToUrdu(summaryResult.summary)
    }

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
        scrapedAt: scrapedContent.scrapedAt,
        aiPowered: true,
        optimizedMode: useOptimized
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
