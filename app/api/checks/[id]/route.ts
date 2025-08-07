import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const check = await db.check.findUnique({
      where: { id: params.id }
    })

    if (!check) {
      return NextResponse.json(
        { error: 'Check not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ check })
  } catch (error) {
    console.error('Error fetching check:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const check = await db.check.update({
      where: { id: params.id },
      data: {
        checkNumber: body.checkNumber,
        date: body.date ? new Date(body.date) : null,
        amount: body.amount,
        memo: body.memo,
        payor: body.payor,
        payee: body.payee,
        status: body.status || 'parsed'
      }
    })

    return NextResponse.json({ check })
  } catch (error) {
    console.error('Error updating check:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 