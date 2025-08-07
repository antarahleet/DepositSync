import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { uploadToBlob } from '@/lib/blob'
import { extractCheckData } from '@/lib/openai'
import { env } from '@/lib/env'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    // Debug: Log environment variables (without sensitive values)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Environment check:', {
        hasOpenAI: !!env.OPENAI_API_KEY,
        hasBlobToken: !!env.BLOB_READ_WRITE_TOKEN,
        hasDatabase: !!env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      })
    }
    
    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Check if environment variables are set up
    if (!env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // For local development, use base64 fallback to avoid Blob token issues
    const isLocal = process.env.NODE_ENV === 'development'
    const blobUrl = (env.BLOB_READ_WRITE_TOKEN && !isLocal)
      ? await uploadToBlob(file)
      : `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString('base64')}`

    // Extract data with OpenAI Vision
    const extractedData = await extractCheckData(blobUrl)

    // Validate and normalize extracted data
    const ExtractedCheckDataSchema = z.object({
      checkNumber: z.string().optional(),
      date: z.string().optional(),
      amount: z.number().optional(),
      memo: z.string().optional(),
      payor: z.string().optional(),
      payee: z.string().optional(),
    })
    const parsed = ExtractedCheckDataSchema.safeParse(extractedData)
    if (!parsed.success) {
      throw new Error('Extracted data failed validation')
    }

    const validated = parsed.data
    const hasMinimumFields = Boolean(
      validated.checkNumber &&
      validated.amount !== undefined &&
      validated.date && !Number.isNaN(new Date(validated.date).getTime())
    )
    
    // Save to database
    const check = await db.check.create({
      data: {
        imageUrl: blobUrl,
        checkNumber: validated.checkNumber,
        date: validated.date ? new Date(validated.date) : null,
        amount: validated.amount,
        memo: validated.memo,
        payor: validated.payor,
        payee: validated.payee,
        status: hasMinimumFields ? 'parsed' : 'needs_review'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Check processed successfully',
      check: {
        id: check.id,
        imageUrl: check.imageUrl,
        checkNumber: check.checkNumber,
        date: check.date,
        amount: check.amount,
        memo: check.memo,
        payor: check.payor,
        payee: check.payee,
        status: check.status,
        createdAt: check.createdAt
      }
    })

  } catch (error) {
    console.error('Error processing check upload:', error)
    
    // Return more detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const pageParam = searchParams.get('page')
    const pageSizeParam = searchParams.get('pageSize')
    const dateFromParam = searchParams.get('dateFrom')
    const dateToParam = searchParams.get('dateTo')
    const amountMinParam = searchParams.get('amountMin')
    const amountMaxParam = searchParams.get('amountMax')

    const page = Math.max(1, Number(pageParam) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(pageSizeParam) || 50))
    const skip = (page - 1) * pageSize

    const where: any = {}

    if (query) {
      where.OR = [
        { checkNumber: { contains: query, mode: 'insensitive' } },
        { payor: { contains: query, mode: 'insensitive' } },
        { payee: { contains: query, mode: 'insensitive' } },
        { memo: { contains: query, mode: 'insensitive' } },
      ]
    }

    // Date range filter (on check date)
    if (dateFromParam || dateToParam) {
      where.date = {}
      if (dateFromParam) {
        const d = new Date(dateFromParam)
        if (!isNaN(d.getTime())) where.date.gte = d
      }
      if (dateToParam) {
        const d = new Date(dateToParam)
        if (!isNaN(d.getTime())) where.date.lte = d
      }
      if (Object.keys(where.date).length === 0) delete where.date
    }

    // Amount range filter
    const amountMin = amountMinParam ? Number(amountMinParam) : undefined
    const amountMax = amountMaxParam ? Number(amountMaxParam) : undefined
    if (!Number.isNaN(amountMin) || !Number.isNaN(amountMax)) {
      where.amount = {}
      if (!Number.isNaN(amountMin) && amountMin !== undefined) where.amount.gte = amountMin
      if (!Number.isNaN(amountMax) && amountMax !== undefined) where.amount.lte = amountMax
      if (Object.keys(where.amount).length === 0) delete where.amount
    }

    const [checks, total] = await Promise.all([
      db.check.findMany({
      where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      db.check.count({ where })
    ])

    return NextResponse.json({
      checks,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Error fetching checks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 

// Note: CSV export is implemented as a separate route at /api/checks/export