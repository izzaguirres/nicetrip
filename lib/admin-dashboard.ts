'use server'

import { supabaseServer } from '@/app/supabase-server'
import { fetchActiveDiscountRules } from '@/lib/supabase-service'

export async function getAdminDashboardData() {
  const supabase = await supabaseServer()
  const activeDiscounts = (await fetchActiveDiscountRules()).length

  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

  const countSince = async (table: string) => {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .filter('created_at', 'gte', twentyFourHoursAgo)
    if (error) {
      console.error(`Dashboard count error (${table}):`, error.message)
      return 0
    }
    return count ?? 0
  }

  return {
    activeDiscounts,
    recentSearches: await countSince('search_events'),
    recentConversions: await countSince('conversion_events'),
    recentAuditLogs: await countSince('audit_logs'),
  }
}
