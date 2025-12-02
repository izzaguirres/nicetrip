'use server'

import { NextResponse, type NextRequest } from 'next/server'
import { getAnalyticsOverview } from '@/lib/admin-analytics'

const parseDays = (value: string | null) => {
  if (!value) return 30
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 30
  if (parsed <= 7) return 7
  if (parsed >= 90) return 90
  return 30
}

const escapeCsvValue = (value: unknown) => {
  if (value === null || value === undefined) return '""'
  const stringified =
    typeof value === 'string' ? value : JSON.stringify(value, null, 0) ?? ''
  const sanitized = stringified.replace(/"/g, '""')
  return `"${sanitized}"`
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const days = parseDays(searchParams.get('days'))

  const overview = await getAnalyticsOverview({ days })

  const header = ['type', 'created_at', 'destino', 'transporte', 'result_count', 'metadata']
  const rows: string[] = []

  overview.rawSearches.forEach((event) => {
    const filters = event.filters ?? {}
    rows.push(
      [
        escapeCsvValue('search'),
        escapeCsvValue(event.created_at),
        escapeCsvValue(filters.destino ?? filters.destination ?? ''),
        escapeCsvValue(filters.transporte ?? filters.transport ?? ''),
        escapeCsvValue(event.result_count ?? ''),
        escapeCsvValue(filters),
      ].join(','),
    )
  })

  overview.rawConversions.forEach((event) => {
    rows.push(
      [
        escapeCsvValue('conversion'),
        escapeCsvValue(event.created_at),
        '""',
        '""',
        '""',
        escapeCsvValue(event.context ?? {}),
      ].join(','),
    )
  })

  const csv = [header.map(escapeCsvValue).join(','), ...rows].join('\n')

  const filename = `analytics-${days}d-${new Date().toISOString().slice(0, 10)}.csv`
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
