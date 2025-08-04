import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

export async function GET() {
  return NextResponse.json({
    hasOpenAI: !!env.OPENAI_API_KEY,
    hasBlobToken: !!env.BLOB_READ_WRITE_TOKEN,
    hasDatabase: !!env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
} 