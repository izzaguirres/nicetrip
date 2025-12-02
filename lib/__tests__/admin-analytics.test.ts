import { describe, it, expect, vi, beforeEach } from 'vitest'

const searchEvents = [
  {
    id: 'search-1',
    created_at: '2025-02-20T10:00:00Z',
    filters: {
      destino: 'Canasvieiras',
      transporte: 'Bus',
    },
    result_count: 3,
    user_agent: 'vitest',
    ip_hash: null,
  },
  {
    id: 'search-2',
    created_at: '2025-02-21T10:00:00Z',
    filters: {
      destino: 'Canasvieiras',
      transporte: 'Aéreo',
    },
    result_count: 1,
    user_agent: 'vitest',
    ip_hash: null,
  },
]

const conversionEvents = [
  {
    id: 'conversion-1',
    created_at: '2025-02-21T12:00:00Z',
    context: { hotel: 'Residencial Terrazas' },
  },
]

const buildChain = (table: string) => {
  const data = table === 'search_events' ? searchEvents : conversionEvents
  return {
    select: () => buildChain(table),
    filter: () => buildChain(table),
    order: () => buildChain(table),
    limit: () => Promise.resolve({ data, error: null }),
  }
}

vi.mock('@/app/supabase-server', () => ({
  supabaseServer: () =>
    Promise.resolve({
      from: (table: string) => buildChain(table),
    }),
}))

import { getAnalyticsOverview } from '../admin-analytics'

describe('admin analytics overview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('agrega buscas, conversões e estatísticas derivadas', async () => {
    const overview = await getAnalyticsOverview({ days: 7 })

    expect(overview.totalSearches).toBe(2)
    expect(overview.totalConversions).toBe(1)
    expect(overview.conversionRate).toBeCloseTo(50)

    expect(overview.topDestinations[0]).toMatchObject({ destino: 'Canasvieiras', count: 2 })
    expect(overview.topTransportes.find((item) => item.transporte === 'Bus')?.count).toBe(1)
    expect(overview.topTransportes.find((item) => item.transporte === 'Aéreo')?.count).toBe(1)

    expect(overview.dailySearches).toHaveLength(2)
    expect(overview.dailyConversions).toHaveLength(1)

    expect(overview.rawSearches).toEqual(searchEvents)
    expect(overview.rawConversions).toEqual(conversionEvents)
  })
})
