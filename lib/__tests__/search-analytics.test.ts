import { describe, it, expect, beforeEach, vi } from 'vitest'

import * as supabaseService from '../supabase-service'
import { recordSearchEvent } from '../search-analytics'

describe('recordSearchEvent', () => {
  const insertSpy = vi.spyOn(supabaseService, 'insertSearchEvent')

  beforeEach(() => {
    insertSpy.mockReset()
    insertSpy.mockResolvedValue(undefined as unknown as void)
  })

  it('enriquece filtros com categoria e envia para o serviço Supabase', async () => {
    const mergedFilters = await recordSearchEvent({
      categoria: 'paquete',
      filters: {
        destino: 'Canasvieiras',
        transporte: 'Bus',
      },
      resultCount: 3,
      userAgent: 'vitest-agent',
    })

    expect(insertSpy).toHaveBeenCalledTimes(1)
    expect(insertSpy).toHaveBeenCalledWith({
      filters: {
        categoria: 'paquete',
        destino: 'Canasvieiras',
        transporte: 'Bus',
      },
      resultCount: 3,
      userAgent: 'vitest-agent',
      ipHash: undefined,
    })
    expect(mergedFilters).toEqual({
      categoria: 'paquete',
      destino: 'Canasvieiras',
      transporte: 'Bus',
    })
  })
})
