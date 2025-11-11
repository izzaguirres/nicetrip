'use server'

import { supabaseServer } from '@/app/supabase-server'

export interface AuditLogEntry {
  id: string
  entity: string
  entity_id: string | null
  action: string
  payload: Record<string, unknown> | null
  performed_by: string | null
  created_at: string
}

export interface AuditLogFilters {
  limit?: number
  entity?: string
  action?: string
  performedBy?: string
  since?: string
  until?: string
  days?: number
}

export async function listAuditLogs({
  limit = 100,
  entity,
  action,
  performedBy,
  since,
  until,
  days,
}: AuditLogFilters = {}): Promise<AuditLogEntry[]> {
  const supabase = await supabaseServer()

  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })

  if (entity) {
    query = query.eq('entity', entity)
  }

  if (action) {
    query = query.eq('action', action)
  }

  if (performedBy) {
    query = query.eq('performed_by', performedBy)
  }

  if (since) {
    query = query.gte('created_at', since)
  } else if (days && Number.isFinite(days)) {
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    query = query.gte('created_at', sinceDate.toISOString())
  }

  if (until) {
    query = query.lte('created_at', until)
  }

  query = query.limit(limit)

  const { data, error } = await query

  if (error) {
    throw new Error(`Erro ao carregar audit logs: ${error.message}`)
  }

  return (data || []) as AuditLogEntry[]
}
