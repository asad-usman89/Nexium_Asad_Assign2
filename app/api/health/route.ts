import { NextResponse } from 'next/server'
import { databaseService } from '@/lib/database'
import { geminiService } from '@/lib/gemini'

export async function GET() {
  try {
    // Test database connections
    const connections = await databaseService.testConnections()
    
    // Test Gemini API
    let geminiStatus = false
    try {
      const testResult = await geminiService.generateSummary('This is a test content for health check.')
      geminiStatus = testResult.summary.length > 0
    } catch (error) {
      console.warn('Gemini API health check failed:', error)
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      connections: {
        ...connections,
        gemini: geminiStatus
      },
      status: connections.mongodb && connections.supabase && geminiStatus ? 'healthy' : 'partial',
      services: {
        mongodb: connections.mongodb ? 'connected' : 'disconnected',
        supabase: connections.supabase ? 'connected' : 'disconnected', 
        gemini: geminiStatus ? 'connected' : 'disconnected'
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
