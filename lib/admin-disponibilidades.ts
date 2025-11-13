import { supabaseServer } from '@/app/supabase-server'
import type { Disponibilidade } from '@/lib/supabase'
import { insertAuditLog } from '@/lib/supabase-service'

export interface DisponibilidadeListOptions {
  destino?: string
  transporte?: string
  data_saida?: string
  hotel?: string
  limit?: number
  offset?: number
}

export interface DisponibilidadeLookups {
  destinos: string[]
  hoteis: string[]
}

export interface DisponibilidadeUpsertInput {
  id?: number
  destino: string
  data_saida: string
  transporte: string
  hotel: string
  quarto_tipo?: string | null
  slug?: string | null
  slug_hospedagem?: string | null
  slug_pacote?: string | null
  slug_pacote_principal?: string | null
  capacidade?: number | null
  preco_adulto?: number | null
  preco_crianca_0_3?: number | null
  preco_crianca_4_5?: number | null
  preco_crianca_6_mais?: number | null
  preco_adulto_aereo?: number | null
  preco_crianca_0_2_aereo?: number | null
  preco_crianca_2_5_aereo?: number | null
  preco_crianca_6_mais_aereo?: number | null
  taxa_aereo_por_pessoa?: number | null
  noites_hotel?: number | null
  dias_viagem?: number | null
  dias_totais?: number | null
}

const sanitizeNullable = <T>(value: T | null | undefined) =>
  value === undefined || value === null || Number.isNaN(value) || value === ''
    ? null
    : value

const CSV_REQUIRED_FIELDS = ['destino', 'data_saida', 'transporte', 'hotel'] as const
const CSV_OPTIONAL_NUMBER_FIELDS = new Set([
  'capacidade',
  'preco_adulto',
  'preco_crianca_0_3',
  'preco_crianca_4_5',
  'preco_crianca_6_mais',
  'preco_adulto_aereo',
  'preco_crianca_0_2_aereo',
  'preco_crianca_2_5_aereo',
  'preco_crianca_6_mais_aereo',
  'taxa_aereo_por_pessoa',
  'noites_hotel',
  'dias_viagem',
  'dias_totais',
])

const parseNumber = (value: string | undefined | null) => {
  if (!value) return null
  const normalized = value.replace(/\./g, '').replace(',', '.').trim()
  if (!normalized) return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

const slugify = (value: string | null | undefined) =>
  (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

const TRACKED_FIELDS = [
  'destino',
  'hotel',
  'transporte',
  'data_saida',
  'quarto_tipo',
  'capacidade',
  'preco_adulto',
  'preco_adulto_aereo',
  'taxa_aereo_por_pessoa',
]

const SUMMARY_FIELDS = ['slug', 'hotel', 'destino', 'transporte', 'capacidade', 'data_saida']

const valueEquals = (a: unknown, b: unknown) => {
  if (a === b) return true
  if (a == null && b == null) return true
  if (typeof a === 'number' && typeof b === 'number') {
    return Number.isNaN(a) && Number.isNaN(b) ? true : a === b
  }
  return false
}

const isMissingSlugColumnError = (error: { message?: string | null; code?: string | null } | null) => {
  if (!error) return false
  if (error.code === '42703') return true
  const message = (error.message || '').toLowerCase()
  if (!message) return false
  return (
    message.includes('slug_hospedagem') ||
    message.includes('slug_pacote_principal') ||
    message.includes('slug_pacote')
  )
}

export function parseDisponibilidadeCsv(csvText: string): DisponibilidadeUpsertInput[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))

  if (lines.length === 0) return []

  const headerLine = lines.shift() as string
  const delimiter = headerLine.includes(';') && !headerLine.includes(',') ? ';' : ','
  const headers = headerLine.split(delimiter).map((h) => h.trim())

  CSV_REQUIRED_FIELDS.forEach((field) => {
    if (!headers.includes(field)) {
      throw new Error(`CSV sem coluna obrigatória: ${field}`)
    }
  })

  return lines.map((line, index) => {
    const cells = line.split(delimiter).map((cell) => cell.trim().replace(/^"|"$/g, ''))
    const row: Record<string, string> = {}
    headers.forEach((header, idx) => {
      row[header] = cells[idx] ?? ''
    })

    CSV_REQUIRED_FIELDS.forEach((field) => {
      if (!row[field]) {
        throw new Error(`Linha ${index + 2}: campo obrigatório "${field}" vazio`)
      }
    })

    const numericEntries: Partial<DisponibilidadeUpsertInput> = {}
    headers.forEach((header) => {
      if (CSV_OPTIONAL_NUMBER_FIELDS.has(header)) {
        const parsed = parseNumber(row[header])
        ;(numericEntries as any)[header] = parsed
      }
    })

    return {
      destino: row.destino,
      data_saida: row.data_saida,
      transporte: row.transporte,
      hotel: row.hotel,
      quarto_tipo: row.quarto_tipo || null,
      slug: row.slug || null,
      slug_hospedagem: row.slug_hospedagem || null,
      slug_pacote: row.slug_pacote || null,
      slug_pacote_principal: row.slug_pacote_principal || null,
      ...numericEntries,
    }
  })
}

export async function listAdminDisponibilidades({
  destino,
  transporte,
  data_saida,
  hotel,
  limit = 50,
  offset = 0,
}: DisponibilidadeListOptions = {}) {
  const supabase = await supabaseServer()

  let query = supabase
    .from('disponibilidades')
    .select('*', { count: 'exact' })
    .order('data_saida', { ascending: true })
    .order('id', { ascending: true })

  if (destino) {
    query = query.ilike('destino', `%${destino}%`)
  }
  if (transporte) {
    const normalized = transporte
      .toLowerCase()
      .normalize('NFD')
      .replace(/[^a-z]/g, '')
    if (normalized.includes('aer')) {
      query = query.or("transporte.ilike.%Aéreo%,transporte.ilike.%Aereo%")
    } else if (normalized.includes('bus')) {
      query = query.or("transporte.ilike.%Bús%,transporte.ilike.%Bus%")
    } else {
      query = query.ilike('transporte', `%${transporte}%`)
    }
  }
  if (data_saida) {
    query = query.eq('data_saida', data_saida)
  }
  if (hotel) {
    query = query.ilike('hotel', `%${hotel}%`)
  }

  const to = offset + limit - 1
  query = query.range(offset, Math.max(offset, to))

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Erro ao listar disponibilidades: ${error.message}`)
  }

  return {
    records: (data || []) as Disponibilidade[],
    total: count ?? 0,
  }
}

export async function listDisponibilidadeLookups(): Promise<DisponibilidadeLookups> {
  const supabase = await supabaseServer()

  const [{ data: destinosData }, { data: hotelData }] = await Promise.all([
    supabase.from('disponibilidades').select('destino', { distinct: true }).order('destino', { ascending: true }),
    supabase.from('disponibilidades').select('hotel', { distinct: true }).order('hotel', { ascending: true }),
  ])

  const normalize = (value?: string | null) => (value || '').trim()
  const uniqueValues = (items: any[], key: string) =>
    Array.from(
      new Set(
        (items || [])
          .map((item) => normalize(item?.[key]))
          .filter((value): value is string => Boolean(value)),
      ),
    )

  return {
    destinos: uniqueValues(destinosData || [], 'destino'),
    hoteis: uniqueValues(hotelData || [], 'hotel'),
  }
}

export async function upsertDisponibilidade(
  payload: DisponibilidadeUpsertInput,
  userId?: string,
) {
  const supabase = await supabaseServer()

  let previousRecord: Disponibilidade | null = null
  if (payload.id) {
    const { data: existing } = await supabase
      .from('disponibilidades')
      .select('*')
      .eq('id', payload.id)
      .maybeSingle()
    if (existing) previousRecord = existing as Disponibilidade
  }

  const autoSlug = slugify(`${payload.hotel}-${payload.destino}-${payload.data_saida}`)
  const autoHotelSlug = slugify(payload.hotel)
  const timestamp = new Date().toISOString()

  const baseRecord = {
    destino: payload.destino,
    data_saida: payload.data_saida,
    transporte: payload.transporte,
    hotel: payload.hotel,
    quarto_tipo: sanitizeNullable(payload.quarto_tipo),
    capacidade: sanitizeNullable(payload.capacidade),
    preco_adulto: sanitizeNullable(payload.preco_adulto),
    preco_crianca_0_3: sanitizeNullable(payload.preco_crianca_0_3),
    preco_crianca_4_5: sanitizeNullable(payload.preco_crianca_4_5),
    preco_crianca_6_mais: sanitizeNullable(payload.preco_crianca_6_mais),
    preco_adulto_aereo: sanitizeNullable(payload.preco_adulto_aereo),
    preco_crianca_0_2_aereo: sanitizeNullable(payload.preco_crianca_0_2_aereo),
    preco_crianca_2_5_aereo: sanitizeNullable(payload.preco_crianca_2_5_aereo),
    preco_crianca_6_mais_aereo: sanitizeNullable(payload.preco_crianca_6_mais_aereo),
    taxa_aereo_por_pessoa: sanitizeNullable(payload.taxa_aereo_por_pessoa),
    noites_hotel: sanitizeNullable(payload.noites_hotel),
    dias_viagem: sanitizeNullable(payload.dias_viagem),
    dias_totais: sanitizeNullable(payload.dias_totais),
    updated_at: timestamp,
  }

  const slugRecord = {
    slug: sanitizeNullable(payload.slug) ?? autoSlug,
    slug_hospedagem: sanitizeNullable(payload.slug_hospedagem) ?? autoHotelSlug,
    slug_pacote: sanitizeNullable(payload.slug_pacote),
    slug_pacote_principal: sanitizeNullable(payload.slug_pacote_principal),
  }

  const baseQuery = supabase.from('disponibilidades')

  const executeSave = async (data: Record<string, any>) =>
    payload.id
      ? baseQuery
          .update(data)
          .eq('id', payload.id)
          .select()
          .maybeSingle()
      : baseQuery.insert(data).select().maybeSingle()

  let recordData: Record<string, any> = { ...baseRecord, ...slugRecord }

  let response = await executeSave(recordData)

  while (response.error && isMissingSlugColumnError(response.error)) {
    const message = response.error.message || ''
    let adjusted = false

    if (message.includes('slug_pacote_principal')) {
      delete recordData.slug_pacote_principal
      adjusted = true
    }

    if (message.includes('slug_pacote')) {
      delete recordData.slug_pacote
      adjusted = true
    }

    if (message.includes('slug_hospedagem')) {
      delete recordData.slug_hospedagem
      adjusted = true
    }

    if (!adjusted) break

    response = await executeSave(recordData)
  }

  if (response.error) {
    throw new Error(`Erro ao salvar disponibilidade: ${response.error.message}`)
  }

  const action = payload.id ? 'update' : 'insert'
  const summary: Record<string, unknown> = {}
  SUMMARY_FIELDS.forEach((field) => {
    const value = (recordData as any)[field]
    if (value !== undefined) {
      summary[field] = value
    }
  })

  const auditPayload: Record<string, unknown> = { summary }
  if (action === 'update' && previousRecord) {
    const changes: Record<string, { before: unknown; after: unknown }> = {}
    TRACKED_FIELDS.forEach((field) => {
      const before = (previousRecord as any)[field]
      const after = (recordData as any)[field]
      if (!valueEquals(before, after)) {
        changes[field] = { before: before ?? null, after: after ?? null }
      }
    })
    if (Object.keys(changes).length) {
      auditPayload.changes = changes
    }
  }

  if (action === 'insert') {
    auditPayload.snapshot = summary
  }

  await insertAuditLog(
    {
      entity: 'disponibilidade',
      entityId: String(response.data?.id ?? payload.id ?? ''),
      action,
      data: auditPayload,
      performedBy: userId,
    },
    supabase,
  )

  return response.data as Disponibilidade
}

export async function deleteDisponibilidade(id: number, userId?: string) {
  const supabase = await supabaseServer()

  const { error } = await supabase.from('disponibilidades').delete().eq('id', id)
  if (error) {
    throw new Error(`Erro ao remover disponibilidade: ${error.message}`)
  }

  await insertAuditLog(
    {
      entity: 'disponibilidade',
      entityId: String(id),
      action: 'delete',
      performedBy: userId,
    },
    supabase,
  )
}
