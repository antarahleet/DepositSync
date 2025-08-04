import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

export async function GET() {
  return NextResponse.json({
    hasOpenAI: !!env.OPENAI_API_KEY,
    hasBlobToken: !!env.BLOB_READ_WRITE_TOKEN,
    blobTokenLength: env.BLOB_READ_WRITE_TOKEN?.length || 0,
    hasDatabase: !!env.DATABASE_URL,
  })
} 