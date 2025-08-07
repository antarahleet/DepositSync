import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const dateFromParam = searchParams.get('dateFrom')
    const dateToParam = searchParams.get('dateTo')
    const amountMinParam = searchParams.get('amountMin')
    const amountMaxParam = searchParams.get('amountMax')

    const where: any = {}
    if (query) {
      where.OR = [
        { checkNumber: { contains: query, mode: 'insensitive' } },
        { payor: { contains: query, mode: 'insensitive' } },
        { payee: { contains: query, mode: 'insensitive' } },
        { memo: { contains: query, mode: 'insensitive' } },
      ]
    }
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
    const amountMin = amountMinParam ? Number(amountMinParam) : undefined
    const amountMax = amountMaxParam ? Number(amountMaxParam) : undefined
    if (!Number.isNaN(amountMin) || !Number.isNaN(amountMax)) {
      where.amount = {}
      if (!Number.isNaN(amountMin) && amountMin !== undefined) where.amount.gte = amountMin
      if (!Number.isNaN(amountMax) && amountMax !== undefined) where.amount.lte = amountMax
      if (Object.keys(where.amount).length === 0) delete where.amount
    }

    const checks = await db.check.findMany({ where, orderBy: { createdAt: 'desc' } })

    const headers = ['id','checkNumber','date','amount','memo','payor','payee','status','createdAt','imageUrl']
    const rows = checks.map(c => [
      c.id,
      c.checkNumber ?? '',
      c.date ? c.date.toISOString().split('T')[0] : '',
      c.amount ?? '',
      (c.memo ?? '').replace(/\n|\r/g, ' '),
      c.payor ?? '',
      c.payee ?? '',
      c.status,
      c.createdAt.toISOString(),
      c.imageUrl,
    ])

    const csv = [headers.join(','), ...rows.map(r => r.map(field => typeof field === 'string' && field.includes(',') ? '"' + field.replace(/"/g,'""') + '"' : String(field)).join(','))].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="checks.csv"'
      }
    })
  } catch (error) {
    console.error('Error exporting CSV:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


