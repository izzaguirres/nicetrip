import { supabaseServer } from '@/app/supabase-server'
import type { Promotion, PromotionType } from '@/lib/supabase'
import { insertAuditLog } from '@/lib/supabase-service'

export interface PromotionInput {
  id?: string
  type: PromotionType
  position?: number
  title: string
  subtitle?: string | null
  destino?: string | null
  hotel?: string | null
  transporte?: string | null
  departure_date?: string | null
  slug_disponibilidade?: string | null
  slug_hospedagem?: string | null
  slug_paseo?: string | null
  price_single?: number | null
  price_double?: number | null
  price_triple?: number | null
  price_quad?: number | null
  price_quint?: number | null
  cta_label?: string | null
  cta_url?: string | null
  image_url?: string | null
  valid_until?: string | null
  auto_hide?: boolean
  is_active?: boolean
}

const sanitize = <T>(value: T | null | undefined) => (value === undefined ? null : value)

export async function listPromotions(type?: PromotionType) {
  const supabase = await supabaseServer()
  let query = supabase.from('promotions').select('*').order('type').order('position')
  if (type) query = query.eq('type', type)
  const { data, error } = await query
  if (error) throw error
  return data as Promotion[]
}

export async function upsertPromotion(payload: PromotionInput, userId?: string) {
  const supabase = await supabaseServer()
  const record = {
    type: payload.type,
    position: payload.position ?? 0,
    title: payload.title,
    subtitle: sanitize(payload.subtitle),
    destino: sanitize(payload.destino),
    hotel: sanitize(payload.hotel),
    transporte: sanitize(payload.transporte),
    departure_date: sanitize(payload.departure_date),
    slug_disponibilidade: sanitize(payload.slug_disponibilidade),
    slug_hospedagem: sanitize(payload.slug_hospedagem),
    slug_paseo: sanitize(payload.slug_paseo),
    price_single: sanitize(payload.price_single),
    price_double: sanitize(payload.price_double),
    price_triple: sanitize(payload.price_triple),
    price_quad: sanitize(payload.price_quad),
    price_quint: sanitize(payload.price_quint),
    cta_label: sanitize(payload.cta_label),
    cta_url: sanitize(payload.cta_url),
    image_url: sanitize(payload.image_url),
    valid_until: sanitize(payload.valid_until),
    auto_hide: payload.auto_hide ?? false,
    is_active: payload.is_active ?? true,
  }

  const query = supabase.from('promotions')
  const { data, error } = payload.id
    ? await query.update(record).eq('id', payload.id).select().maybeSingle()
    : await query.insert(record).select().maybeSingle()

  if (error) throw error

  await insertAuditLog(
    {
      entity: 'promotion',
      entityId: data?.id,
      action: payload.id ? 'update' : 'insert',
      data: record,
      performedBy: userId,
    },
    supabase,
  )

  return data as Promotion
}

export async function deletePromotion(id: string, userId?: string) {
  const supabase = await supabaseServer()
  const { error } = await supabase.from('promotions').delete().eq('id', id)
  if (error) throw error
  await insertAuditLog(
    { entity: 'promotion', entityId: id, action: 'delete', performedBy: userId },
    supabase,
  )
}

export async function reorderPromotions(ids: string[]) {
  const supabase = await supabaseServer()
  const updates = ids.map((id, index) => ({ id, position: index }))
  const { error } = await supabase.from('promotions').upsert(updates)
  if (error) throw error
}
