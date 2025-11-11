import { insertSearchEvent } from './supabase-service'
import { createLogger } from './logger'

const log = createLogger('search-analytics')

export interface SearchEventInput {
  categoria: string
  filters: Record<string, unknown>
  resultCount: number
  userAgent?: string
  ipHash?: string
}

export async function recordSearchEvent({
  categoria,
  filters,
  resultCount,
  userAgent,
  ipHash,
}: SearchEventInput) {
  const payloadFilters = {
    categoria,
    ...filters,
  }

  try {
    await insertSearchEvent({
      filters: payloadFilters,
      resultCount,
      userAgent,
      ipHash,
    })
  } catch (error) {
    log.warn('Falha ao registrar evento de busca', error)
  }

  return payloadFilters
}
