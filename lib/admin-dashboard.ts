'use server'

import { supabaseServer } from '@/app/supabase-server'
import { fetchActiveDiscountRules } from '@/lib/supabase-service'

export type DashboardActivity = {
  id: string
  type: 'search' | 'conversion'
  title: string
  subtitle: string
  created_at: string
  meta?: any
}

export async function getAdminDashboardData() {
  const supabase = await supabaseServer()
  const activeDiscounts = (await fetchActiveDiscountRules()).length

  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

  // Counts
  const countSince = async (table: string) => {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .filter('created_at', 'gte', twentyFourHoursAgo)
    return count ?? 0
  }

  const [recentSearches, recentConversions, recentAuditLogs] = await Promise.all([
    countSince('search_events'),
    countSince('conversion_events'),
    countSince('audit_logs'),
  ])

  // Promos Status
  const { count: activePromotions } = await supabase
    .from('promotions')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Recent Activity Feed (Mix of Search & Conversion)
  const { data: searches } = await supabase
    .from('search_events')
    .select('id, created_at, filters')
    .order('created_at', { ascending: false })
    .limit(6)

  const { data: conversions } = await supabase
    .from('conversion_events')
    .select('id, created_at, context')
    .order('created_at', { ascending: false })
    .limit(6)

  const activityFeed: DashboardActivity[] = []

  searches?.forEach((s: any) => {
    const f = s.filters || {}
    const dest = f.destino || f.destination || 'Destino geral'
    const trans = f.transporte || f.transport || 'Busca'
    activityFeed.push({
      id: s.id,
      type: 'search',
      title: `Busca: ${dest}`,
      subtitle: `Filtro: ${trans}`,
      created_at: s.created_at,
    })
  })

  conversions?.forEach((c: any) => {
    const ctx = c.context || {}
    const origem = ctx.origem === 'detalhes_page' ? 'Página de Detalhes' : 'Card Promocional'
    
    let target = ctx.item || ctx.promotionTitle || ctx.hotel || ctx.destino || 'Interesse geral'
    // Limpar possível undefined stringificado se houver erro no log antigo
    if (target === 'undefined' || target === 'null') target = ctx.destino || 'Interesse geral'

    activityFeed.push({
      id: c.id,
      type: 'conversion',
      title: `Lead: ${target}`,
      subtitle: `Via ${origem}`,
      created_at: c.created_at,
    })
  })

  // Sort combined feed
  activityFeed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Estimated Revenue (Pipeline)
  // Ticket Médio Estimado: $450 USD (Mix de hotel + pacote)
  const avgTicket = 450
  const estimatedPipeline = recentConversions * avgTicket

  return {
    activeDiscounts,
    recentSearches,
    recentConversions,
    recentAuditLogs,
    activePromotions: activePromotions ?? 0,
    activityFeed: activityFeed.slice(0, 8),
    estimatedPipeline,
  }
}
