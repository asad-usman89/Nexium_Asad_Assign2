import { NextRequest, NextResponse } from 'next/server'
import { geminiService } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const { action, text } = await request.json()

    if (!action || !text) {
      return NextResponse.json(
        { error: 'Action and text are required' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'summarize':
        result = await geminiService.generateSummary(text)
        break
      
      case 'translate':
        result = await geminiService.translateToUrdu(text)
        break
      
      case 'combined':
        result = await geminiService.generateSummaryAndTranslation(text)
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: summarize, translate, or combined' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Gemini test API error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        error: 'Gemini test failed',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Gemini Test API',
    usage: {
      method: 'POST',
      body: {
        action: 'summarize | translate | combined',
        text: 'Your text content here'
      }
    },
    examples: [
      {
        action: 'summarize',
        description: 'Generate AI summary and key points'
      },
      {
        action: 'translate',
        description: 'Translate text to Urdu'
      },
      {
        action: 'combined',
        description: 'Generate summary and translation in one call'
      }
    ]
  })
}
