import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseServer } from '@/app/supabase-server'

type LookupRow = {
  destino?: string | null
  hotel?: string | null
  transporte?: string | null
  quarto_tipo?: string | null
  capacidade?: number | null
  data_saida?: string | null
  slug?: string | null
  slug_pacote?: string | null
  slug_pacote_principal?: string | null
  slug_hospedagem?: string | null
  link_imagem?: string | null
}

type SupabaseError = { code?: string; message: string }

const normalizeKey = (value?: string | null) =>
  (value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')

const normalizeTransportLabel = (value?: string | null) => {
  const normalized = normalizeKey(value).replace(/[^a-z]/g, '')
  if (!normalized) return { key: '', label: value || '' }
  if (normalized.includes('aer')) return { key: 'aereo', label: 'Aéreo' }
  if (normalized.includes('bus')) return { key: 'bus', label: 'Bús' }
  return { key: normalized, label: value || '' }
}

const cleanValue = (value?: string | null) => {
  const normalized = value?.trim()
  return normalized && normalized.length > 0 ? normalized : null
}

const formatDate = (value?: string | null) => {
  if (!value) return null
  const isoString = value.includes('T') ? value : `${value}T00:00:00Z`
  const parsed = new Date(isoString)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(parsed)
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL não configurada')
    }

    const authClient = await supabaseServer()

    const {
      data: { session },
      error: sessionError,
    } = await authClient.auth.getSession()

    if (sessionError) throw sessionError

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: adminRecord, error: adminError } = await authClient
      .from('admin_users')
      .select('user_id')
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (adminError) throw adminError
    if (!adminRecord) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase =
      serviceRoleKey
        ? createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          })
        : authClient

    const baseColumns = ['destino', 'hotel', 'transporte', 'quarto_tipo', 'capacidade', 'data_saida'] as const
    const selectCandidates = [
      [...baseColumns, 'slug', 'slug_pacote', 'slug_pacote_principal', 'slug_hospedagem', 'link_imagem'],
      [...baseColumns, 'slug', 'slug_pacote_principal', 'slug_hospedagem', 'link_imagem'],
      [...baseColumns, 'slug', 'slug_hospedagem', 'link_imagem'],
      [...baseColumns, 'slug', 'slug_hospedagem'],
      baseColumns,
    ] as const

    let lookupResponse: { data: LookupRow[] | null; error: SupabaseError | null } | undefined
    let lastError: SupabaseError | undefined

    for (const columns of selectCandidates) {
      const response = await supabase.from('disponibilidades').select(columns.join(','))
      if (!response.error) {
        lookupResponse = { data: response.data as LookupRow[], error: null }
        break
      }

      if (response.error.code !== '42703') {
        lookupResponse = { data: response.data as LookupRow[] | null, error: response.error }
        break
      }

      lastError = response.error
    }

    if (!lookupResponse) {
      throw lastError || new Error('Falha ao carregar dados de referência')
    }

    if (lookupResponse.error) {
      throw new Error(lookupResponse.error.message)
    }

    const destinationMap = new Map<
      string,
      { value: string; label: string; transports: Set<string>; transportKeys: Set<string> }
    >()
    const hotelMap = new Map<
      string,
      {
        value: string
        label: string
        description?: string
        destination?: string
        destinationKey?: string
        transports: Set<string>
        transportKeys: Set<string>
      }
    >()
    const packageMap = new Map<
      string,
      {
        value: string
        label: string
        description?: string
        meta: {
          destino?: string | null
          hotel?: string | null
          transporte?: string | null
          quarto_tipo?: string | null
          capacidade?: number | null
          data_saida?: string | null
          slug_hospedagem?: string | null
          image_url?: string | null
        }
      }
    >()
    const hospedagemMap = new Map<
      string,
      {
        value: string
        label: string
        destination?: string | null
        description?: string | null
        meta: {
          destino?: string | null
          hotel?: string | null
          transporte?: string | null
          image_url?: string | null
        }
      }
    >()
    const roomTypeSet = new Set<string>()
    const capacitySet = new Set<number>()

    const registerPackage = (slug: string | null | undefined, row: LookupRow, tag?: string) => {
      if (!slug || packageMap.has(slug)) return

      const parts = [
        cleanValue(row.hotel),
        cleanValue(row.destino),
        formatDate(row.data_saida),
        cleanValue(row.quarto_tipo),
        cleanValue(row.transporte),
      ].filter(Boolean)
      const label = parts.join(' • ') || slug

      const descriptionParts = [
        row.destino && cleanValue(row.destino),
        row.transporte && cleanValue(row.transporte),
        typeof row.capacidade === 'number' ? `${row.capacidade} pax` : null,
        tag,
      ].filter(Boolean)

      packageMap.set(tag ? `${slug}::${tag}` : slug, {
        value: slug,
        label,
        description: descriptionParts.length ? descriptionParts.join(' • ') : undefined,
        meta: {
          destino: cleanValue(row.destino),
          destino_key: normalizeKey(row.destino),
          hotel: cleanValue(row.hotel),
          hotel_key: normalizeKey(row.hotel),
          transporte: cleanValue(row.transporte),
          transport_info: normalizeTransportLabel(row.transporte),
          quarto_tipo: cleanValue(row.quarto_tipo),
          capacidade: row.capacidade ?? null,
          data_saida: row.data_saida ?? null,
          slug_hospedagem: cleanValue(row.slug_hospedagem),
          image_url: cleanValue(row.link_imagem),
        },
      })
    }

    for (const row of lookupResponse.data || []) {
      const destino = cleanValue(row.destino)
      const destinoKey = normalizeKey(destino)
      const transporte = cleanValue(row.transporte)
      const transportInfo = normalizeTransportLabel(row.transporte)
      const hotel = cleanValue(row.hotel)
      const quartoTipo = cleanValue(row.quarto_tipo)

      if (destino) {
        const current = destinationMap.get(destinoKey)
        const transports = current?.transports ?? new Set<string>()
        const transportKeys = current?.transportKeys ?? new Set<string>()
        if (transportInfo.label) transports.add(transportInfo.label)
        if (transportInfo.key) transportKeys.add(transportInfo.key)

        if (!current || destino.length > current.label.length) {
          destinationMap.set(destinoKey, {
            value: destino,
            label: destino,
            transports,
            transportKeys,
          })
        } else {
          current.transports = transports
          current.transportKeys = transportKeys
        }
      }

      if (hotel) {
        const destinationKey = normalizeKey(destino)
        const mapKey = `${normalizeKey(hotel)}::${destinationKey}`
        const transports = hotelMap.get(mapKey)?.transports ?? new Set<string>()
        const transportKeys = hotelMap.get(mapKey)?.transportKeys ?? new Set<string>()
        if (transportInfo.label) transports.add(transportInfo.label)
        if (transportInfo.key) transportKeys.add(transportInfo.key)

        const shouldReplace = !hotelMap.has(mapKey) || (destino && destino.length > (hotelMap.get(mapKey)?.destination?.length ?? 0))

        if (shouldReplace) {
          hotelMap.set(mapKey, {
            value: hotel,
            label: hotel,
            description: destino || undefined,
            destination: destino || undefined,
            destinationKey: destinationKey || undefined,
            transports,
            transportKeys,
          })
        } else {
          const record = hotelMap.get(mapKey)!
          record.transports = transports
          record.transportKeys = transportKeys
        }
      }

      if (quartoTipo) {
        roomTypeSet.add(quartoTipo)
      }
      if (typeof row.capacidade === 'number' && Number.isFinite(row.capacidade)) {
        capacitySet.add(row.capacidade)
      }

      registerPackage(row.slug_pacote, row, 'pacote')
      registerPackage(row.slug_pacote_principal, row, 'principal')
      registerPackage(row.slug, row)

      const slugHosp = cleanValue(row.slug_hospedagem)
      if (slugHosp && !hospedagemMap.has(slugHosp)) {
        hospedagemMap.set(slugHosp, {
          value: slugHosp,
          label: cleanValue(row.hotel) || slugHosp,
          destination: cleanValue(row.destino),
          description: row.destino ? `${row.destino}${row.transporte ? ` • ${row.transporte}` : ''}` : undefined,
          meta: {
            destino: cleanValue(row.destino),
            hotel: cleanValue(row.hotel),
            transporte: cleanValue(row.transporte),
            image_url: cleanValue(row.link_imagem),
          },
        })
      }
    }

    const destinations = Array.from(destinationMap.values())
      .map((entry) => ({
        value: entry.value,
        label: entry.label,
        description: entry.transports.size ? Array.from(entry.transports).join(' • ') : undefined,
        transports: Array.from(entry.transports),
        transportKeys: Array.from(entry.transportKeys),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }))

    const hotels = Array.from(hotelMap.values())
      .map((entry) => ({
        value: entry.value,
        label: entry.label,
        description: entry.description,
        destination: entry.destination,
        destinationKey: entry.destinationKey,
        transports: Array.from(entry.transports),
        transportKeys: Array.from(entry.transportKeys),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }))

    const packages = Array.from(packageMap.values()).sort((a, b) =>
      a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }),
    )

    return NextResponse.json({
      destinations,
      hotels,
      packages,
      room_types: Array.from(roomTypeSet).sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })),
      capacities: Array.from(capacitySet).sort((a, b) => a - b),
      hospedagens: Array.from(hospedagemMap.values()).sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' })),
    })
  } catch (error) {
    console.error('[admin/lookups] failed to load references:', error)
    const message = error instanceof Error ? error.message : 'Erro ao carregar referências'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
