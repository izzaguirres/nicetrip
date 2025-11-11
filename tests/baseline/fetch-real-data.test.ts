import { describe, it, expect, beforeEach, vi } from 'vitest'

import busScenario from '../fixtures/baseline/bus-baseline.json'

const datasets = {
  disponibilidades: [
    ...busScenario.supabaseRows,
    {
      ...busScenario.supabaseRows[0],
      id: 999,
      destino: 'Outro destino',
      transporte: 'Aéreo',
      data_saida: '2025-12-24',
    },
  ],
}

const createMockQuery = (table: keyof typeof datasets) => {
  let rows = [...datasets[table]]

  const applyIlike = (column: string, pattern: string) => {
    const target = pattern.replace(/%/g, '').toLowerCase()
    rows = rows.filter((row) => String((row as any)[column] ?? '').toLowerCase().includes(target))
  }

  const applyOr = (condition: string) => {
    const branches = condition.split(',')
    rows = rows.filter((row) =>
      branches.some((branch) => {
        const [column, operator, rawPattern] = branch.split('.')
        if (operator !== 'ilike') return false
        const target = rawPattern.replace(/%/g, '').toLowerCase()
        return String((row as any)[column] ?? '').toLowerCase().includes(target)
      }),
    )
  }

  const query = {
    select: () => query,
    ilike: (column: string, pattern: string) => {
      applyIlike(column, pattern)
      return query
    },
    or: (expr: string) => {
      applyOr(expr)
      return query
    },
    gte: (column: string, value: any) => {
      rows = rows.filter((row) => (row as any)[column] >= value)
      return query
    },
    lte: (column: string, value: any) => {
      rows = rows.filter((row) => (row as any)[column] <= value)
      return query
    },
    order: (column: string, { ascending }: { ascending: boolean }) => {
      rows.sort((a, b) => {
        const left = (a as any)[column]
        const right = (b as any)[column]
        if (left === right) return 0
        return ascending ? (left < right ? -1 : 1) : left < right ? 1 : -1
      })
      return Promise.resolve({ data: rows, error: null })
    },
  }

  return query
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table: keyof typeof datasets) => createMockQuery(table),
  }),
}))

describe('fetchRealData baseline behaviour', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
  })

  it('retorna exatamente os registros esperados para o cenário Bus baseline', async () => {
    const { fetchRealData } = await import('@/lib/supabase-service')
    const results = await fetchRealData(busScenario.filters)
    expect(results).toEqual(busScenario.supabaseRows)
  })
})
