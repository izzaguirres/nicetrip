'use server'

import { supabaseServer } from '@/app/supabase-server'
import type { SearchEvent, ConversionEvent } from '@/lib/supabase'

export interface AnalyticsOverview {
  totalSearches: number
  totalConversions: number
  conversionRate: number
  growth: {
    searches: number // % de crescimento vs período anterior
    conversions: number
  }
  topDestinations: Array<{ destino: string; count: number }>
  topTransportes: Array<{ transporte: string; count: number }>
  dailySearches: Array<{ date: string; count: number }>
  dailyConversions: Array<{ date: string; count: number }>
  rawSearches: SearchEvent[]
  rawConversions: ConversionEvent[]
}

const normalizeDate = (iso: string) => iso.slice(0, 10)

// Helper para buscar todos os dados com paginação
async function fetchAllData<T>(
  table: string,
  since: string,
  pageSize = 1000
): Promise<T[]> {
  const supabase = await supabaseServer()
  let allData: T[] = []
  let hasMore = true
  let page = 0

  while (hasMore) {
    const from = page * pageSize
    const to = from + pageSize - 1

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .filter('created_at', 'gte', since)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error(`Erro ao buscar pagina ${page} de ${table}:`, error.message)
      hasMore = false // Abortar em erro para não loopar infinito
      break
    }

    if (data && data.length > 0) {
      allData = [...allData, ...data]
      // Se retornou menos que o tamanho da página, acabou
      if (data.length < pageSize) {
        hasMore = false
      } else {
        page++
      }
    } else {
      hasMore = false
    }
  }

  return allData
}

// Helper para contar registros (mais rápido que fetchAllData para o período anterior)
async function countData(
  table: string,
  fromIso: string,
  toIso: string
): Promise<number> {
  const supabase = await supabaseServer()
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .filter('created_at', 'gte', fromIso)
    .filter('created_at', 'lt', toIso)
  
  if (error) return 0
  return count || 0
}

export async function getAnalyticsOverview({ period = '30d' }: { period?: 'today' | '7d' | '30d' | '90d' } = {}): Promise<AnalyticsOverview & { conversionSources: Array<{ source: string; count: number }> }> {
  const now = new Date()
  let days = 30
  let since: string

  if (period === 'today') {
    days = 1
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    since = startOfDay.toISOString()
  } else {
    days = parseInt(period.replace('d', '')) || 30
    const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    since = pastDate.toISOString()
  }

  // Período Anterior (para comparação de crescimento)
  const previousDate = new Date(new Date(since).getTime() - days * 24 * 60 * 60 * 1000)
  const previousSince = previousDate.toISOString()

  // Buscar dados COMPLETOS do período atual (paginado)
  const [searchEvents, conversionEvents] = await Promise.all([
    fetchAllData<SearchEvent>('search_events', since),
    fetchAllData<ConversionEvent>('conversion_events', since),
  ])

  // Contar dados do período anterior (apenas número)
  const [prevSearchesCount, prevConversionsCount] = await Promise.all([
    countData('search_events', previousSince, since),
    countData('conversion_events', previousSince, since),
  ])

  const totalSearches = searchEvents.length
  const totalConversions = conversionEvents.length
  const conversionRate = totalSearches > 0 ? Number(((totalConversions / totalSearches) * 100).toFixed(2)) : 0

  // Cálculo de Crescimento (Growth)
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const growth = {
    searches: calculateGrowth(totalSearches, prevSearchesCount),
    conversions: calculateGrowth(totalConversions, prevConversionsCount),
  }

  // Mapas de Análise
  const destinationMap = new Map<string, number>()
  const transportMap = new Map<string, number>()
  const dailySearchesMap = new Map<string, number>()
  const conversionSourcesMap = new Map<string, number>()

  searchEvents.forEach((event) => {
    const filters = event.filters || {}
    const destino = (filters.destino || filters.destination || '').toString().trim()
    const transporte = (filters.transporte || filters.transport || '').toString().trim()
    // Para 'today', agrupar por hora, senão por dia
    const dateKey = period === 'today' 
      ? new Date(event.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : normalizeDate(event.created_at)

    // Contagem de buscas
    dailySearchesMap.set(dateKey, (dailySearchesMap.get(dateKey) || 0) + 1)

    // Análise de Conteúdo
    if (destino) destinationMap.set(destino, (destinationMap.get(destino) || 0) + 1)
    if (transporte) transportMap.set(transporte, (transportMap.get(transporte) || 0) + 1)
  })

  const dailyConversionsMap = new Map<string, number>()
  conversionEvents.forEach((event) => {
    // Para 'today', agrupar por hora
    const dateKey = period === 'today'
      ? new Date(event.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : normalizeDate(event.created_at)
    
    dailyConversionsMap.set(dateKey, (dailyConversionsMap.get(dateKey) || 0) + 1)

    // Fontes de Conversão
    const context = event.context as any || {}
    const origem = context.origem || 'desconhecido'
    conversionSourcesMap.set(origem, (conversionSourcesMap.get(origem) || 0) + 1)
  })

  // Rankings
  const topDestinations = Array.from(destinationMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([destino, count]) => ({ destino, count }))

  const topTransportes = Array.from(transportMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([transporte, count]) => ({ transporte, count }))

  const dailySearches = Array.from(dailySearchesMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }))

  const dailyConversions = Array.from(dailyConversionsMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }))

  const conversionSources = Array.from(conversionSourcesMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([source, count]) => ({ source, count }))

  return {
    totalSearches,
    totalConversions,
    conversionRate,
    growth,
    topDestinations,
    topTransportes,
    dailySearches,
    dailyConversions,
    conversionSources, // New field
    rawSearches: searchEvents,
    rawConversions: conversionEvents,
  }
}
