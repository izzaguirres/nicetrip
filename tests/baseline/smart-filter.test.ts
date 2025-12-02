import { describe, it, expect, vi, beforeEach } from 'vitest'

const busData = [
  {
    id: 101,
    hotel: 'RESIDENCIAL LEÔNIDAS',
    quarto_tipo: 'Doble',
    capacidade: 2,
    preco_adulto: 561,
    destino: 'Canasvieiras',
    transporte: 'Bus',
    data_saida: '2025-10-19',
  },
]

const aereoData = [
  {
    id: 201,
    hotel: 'HOTEL PREMIUM',
    quarto_tipo: 'Suite',
    capacidade: 2,
    preco_adulto: 820,
    destino: 'Canasvieiras',
    transporte: 'Aéreo',
    data_saida: '2026-01-04',
  },
]

vi.mock('@/lib/supabase-service', () => {
  return {
    fetchDataForSmartFilter: vi.fn(async (filters: { transporte?: string }) => {
      if (filters.transporte === 'Aéreo') {
        return { allData: aereoData, filteredData: aereoData, uniqueHotels: ['HOTEL PREMIUM'] }
      }
      return { allData: busData, filteredData: busData, uniqueHotels: ['RESIDENCIAL LEÔNIDAS'] }
    }),
  }
})

import { POST } from '@/app/api/smart-filter/route'
import { fetchDataForSmartFilter } from '@/lib/supabase-service'

const fetchMock = vi.mocked(fetchDataForSmartFilter)

const postSmartFilter = async (payload: unknown) => {
  const request = new Request('http://localhost/api/smart-filter', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  }) as any

  const response = await POST(request)
  const json = await response.json()
  return json
}

describe('API /api/smart-filter', () => {
  beforeEach(() => {
    fetchMock.mockClear()
  })

  it('retorna análise baseada em pacotes de Bus', async () => {
    const result = await postSmartFilter({
      filters: {
        destino: 'Canasvieiras',
        transporte: 'Bus',
        data_saida: '2025-10-19',
        adultos: 2,
        criancas_0_3: 0,
        criancas_4_5: 0,
        criancas_6: 0,
      },
      roomsConfig: [{ adults: 2, children_0_3: 0, children_4_5: 0, children_6: 0 }],
    })

    expect(fetchMock).toHaveBeenCalledWith({
      destino: 'Canasvieiras',
      transporte: 'Bus',
      data_saida: '2025-10-19',
    })

    expect(result.success).toBe(true)
    expect(result.analysis.usando_dados_reais).toBe(true)
    expect(result.analysis.resultados[0]).toMatchObject({
      hotel: 'RESIDENCIAL LEÔNIDAS',
      preco_total_calculado: 1122,
      preco_por_pessoa: 561,
    })
  })

  it('retorna análise baseada em pacotes Aéreo', async () => {
    const result = await postSmartFilter({
      filters: {
        destino: 'Canasvieiras',
        transporte: 'Aéreo',
        data_saida: '2026-01-04',
        adultos: 2,
        criancas_0_3: 0,
        criancas_4_5: 0,
        criancas_6: 0,
      },
      roomsConfig: [{ adults: 2, children_0_3: 0, children_4_5: 0, children_6: 0 }],
    })

    expect(fetchMock).toHaveBeenCalledWith({
      destino: 'Canasvieiras',
      transporte: 'Aéreo',
      data_saida: '2026-01-04',
    })

    expect(result.analysis.resultados[0]).toMatchObject({
      hotel: 'HOTEL PREMIUM',
      preco_total_calculado: 1640,
      preco_por_pessoa: 820,
    })
  })
})
