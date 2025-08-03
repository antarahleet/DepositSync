import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { uploadToBlob } from '@/lib/blob'
import { extractCheckData } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
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
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // For testing without Vercel Blob, we'll use a placeholder URL
    // In production, you'll need to set up Vercel Blob
    const blobUrl = process.env.BLOB_READ_WRITE_TOKEN 
      ? await uploadToBlob(file)
      : `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString('base64')}`

    // Extract data with OpenAI Vision
    const extractedData = await extractCheckData(blobUrl)
    
    // Save to database
    const check = await db.check.create({
      data: {
        imageUrl: blobUrl,
        checkNumber: extractedData.checkNumber,
        date: extractedData.date ? new Date(extractedData.date) : null,
        amount: extractedData.amount,
        memo: extractedData.memo,
        payor: extractedData.payor,
        payee: extractedData.payee,
        status: 'needs_review'
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const checks = await db.check.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ checks })
  } catch (error) {
    console.error('Error fetching checks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 