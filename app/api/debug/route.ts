import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'

export async function GET(request: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production'
  if (isProduction) {
    const url = new URL(request.url)
    const providedSecret = url.searchParams.get('secret')
    if (!env.INBOUND_WEBHOOK_SECRET || providedSecret !== env.INBOUND_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  return NextResponse.json({
    hasOpenAI: !!env.OPENAI_API_KEY,
    hasBlobToken: !!env.BLOB_READ_WRITE_TOKEN,
    blobTokenLength: env.BLOB_READ_WRITE_TOKEN?.length || 0,
    hasDatabase: !!env.DATABASE_URL,
  })
}