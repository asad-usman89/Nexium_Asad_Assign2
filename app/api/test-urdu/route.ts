import { NextRequest, NextResponse } from 'next/server'
import { translateToUrdu } from '@/lib/translator'
import { geminiService } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    console.log('Testing Urdu translation for:', text)

    // Test both direct Gemini translation and the translator wrapper
    const directGeminiResult = await geminiService.translateToUrdu(text)
    const translatorResult = await translateToUrdu(text)

    return NextResponse.json({
      success: true,
      originalText: text,
      results: {
        directGemini: directGeminiResult.translatedText,
        translatorWrapper: translatorResult
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Urdu translation test API error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
