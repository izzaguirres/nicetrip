'use server'

import { supabaseServer } from '@/app/supabase-server'
import { insertAuditLog } from '@/lib/supabase-service'

export interface PackageAddon {
  id: string
  title: string
  description?: string | null
  price: number
  currency: string
  transport_type?: string | null
  icon?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PackageAddonInput {
  id?: string
  title: string
  description?: string | null
  price: number
  currency?: string
  transport_type?: string | null
  icon?: string | null
  is_active?: boolean
}

export async function listAddons() {
  const supabase = await supabaseServer()
  const { data, error } = await supabase
    .from('package_addons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as PackageAddon[]
}

export async function upsertAddon(payload: PackageAddonInput, userId?: string) {
  const supabase = await supabaseServer()
  const record = {
    title: payload.title,
    description: payload.description || null,
    price: payload.price,
    currency: payload.currency || 'USD',
    transport_type: payload.transport_type === '__any' ? null : payload.transport_type || null,
    icon: payload.icon || null,
    is_active: payload.is_active ?? true,
    updated_at: new Date().toISOString()
  }

  const query = supabase.from('package_addons')
  const { data, error } = payload.id
    ? await query.update(record).eq('id', payload.id).select().single()
    : await query.insert(record).select().single()

  if (error) throw error

  await insertAuditLog(
    {
      entity: 'package_addon',
      entityId: data?.id,
      action: payload.id ? 'update' : 'insert',
      data: record,
      performedBy: userId,
    },
    supabase,
  )

  return data as PackageAddon
}

export async function deleteAddon(id: string, userId?: string) {
  const supabase = await supabaseServer()
  const { error } = await supabase.from('package_addons').delete().eq('id', id)
  if (error) throw error

  await insertAuditLog(
    { entity: 'package_addon', entityId: id, action: 'delete', performedBy: userId },
    supabase,
  )
}
