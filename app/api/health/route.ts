import { NextResponse } from 'next/server'
import { databaseService } from '@/lib/database'

export async function GET() {
  try {
    // Test database connections
    const connections = await databaseService.testConnections()
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      connections,
      status: connections.mongodb && connections.supabase ? 'healthy' : 'partial'
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
