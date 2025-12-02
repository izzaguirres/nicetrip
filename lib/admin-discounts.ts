'use server'

import { supabaseServer } from '@/app/supabase-server'
import type { DiscountRule } from '@/lib/supabase'
import { insertAuditLog } from '@/lib/supabase-service'

export async function listDiscountRules() {
  const supabase = await supabaseServer()
  const { data, error } = await supabase
    .from('discount_rules')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as DiscountRule[]
}

interface DiscountRuleInput {
  id?: string
  name: string
  transport_type?: string | null
  destinations?: string[]
  package_slugs?: string[]
  hotel_names?: string[]
  target_dates?: string[]
  age_groups?: string[] | null
  age_min?: number | null
  age_max?: number | null
  amount: number
  amount_currency: string
  amount_type: 'fixed' | 'percent'
  valid_from?: string | null
  valid_to?: string | null
  is_active: boolean
}

export async function upsertDiscountRule(payload: DiscountRuleInput, userId?: string) {
  const supabase = await supabaseServer()
  const record = {
    name: payload.name,
    transport_type: payload.transport_type ?? null,
    destinations: payload.destinations && payload.destinations.length > 0 ? payload.destinations : null,
    package_slugs: payload.package_slugs && payload.package_slugs.length > 0 ? payload.package_slugs : null,
    hotel_names: payload.hotel_names && payload.hotel_names.length > 0 ? payload.hotel_names : null,
    target_dates: payload.target_dates && payload.target_dates.length > 0 ? payload.target_dates : null,
    age_groups: payload.age_groups && payload.age_groups.length > 0 ? payload.age_groups : null,
    age_min: payload.age_min ?? null,
    age_max: payload.age_max ?? null,
    amount: payload.amount,
    amount_currency: payload.amount_currency,
    amount_type: payload.amount_type,
    valid_from: payload.valid_from ?? null,
    valid_to: payload.valid_to ?? null,
    is_active: payload.is_active,
  }

  const { data, error } = payload.id
    ? await supabase
        .from('discount_rules')
        .update(record)
        .eq('id', payload.id)
        .select()
        .maybeSingle()
    : await supabase
        .from('discount_rules')
        .insert({ ...record, created_by: userId ?? null })
        .select()
        .maybeSingle()

  if (error) throw error

  await insertAuditLog(
    {
      entity: 'discount_rule',
      entityId: data?.id,
      action: payload.id ? 'update' : 'insert',
      data: record,
      performedBy: userId,
    },
    supabase,
  )

  return data as DiscountRule
}

export async function deleteDiscountRule(id: string, userId?: string) {
  const supabase = await supabaseServer()
  const { error } = await supabase.from('discount_rules').delete().eq('id', id)
  if (error) throw error

  await insertAuditLog(
    {
      entity: 'discount_rule',
      entityId: id,
      action: 'delete',
      performedBy: userId,
    },
    supabase,
  )
}
