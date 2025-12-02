import { supabaseServer } from '@/app/supabase-server'
import { Disponibilidade } from '@/lib/supabase'

export async function listAdminDisponibilidades(filters: any) {
  const supabase = await supabaseServer()
  let query = supabase.from('disponibilidades').select('*', { count: 'exact' })

  if (filters.destino) query = query.ilike('destino', `%${filters.destino}%`)
  if (filters.transporte) query = query.ilike('transporte', `%${filters.transporte}%`)
  if (filters.hotel) query = query.ilike('hotel', `%${filters.hotel}%`)
  if (filters.slug) query = query.or(`slug.eq.${filters.slug},slug_hospedagem.eq.${filters.slug},slug_pacote.eq.${filters.slug}`)

  if (filters.limit) query = query.limit(filters.limit)
  if (filters.offset) query = query.range(filters.offset, filters.offset + filters.limit - 1)

  const { data, error, count } = await query.order('data_saida', { ascending: true })

  if (error) throw error
  return { records: data as Disponibilidade[], total: count || 0 }
}

export async function listDisponibilidadeLookups() {
  // ... manter existente ou simplificar ...
  return { destinos: [], hoteis: [] } 
}

export async function getDashboardHotels() {
  const supabase = await supabaseServer()
  // Busca colunas leves de TODOS os registros para montar os cards (limite seguro de 2000 para performance)
  const { data, error } = await supabase
    .from('disponibilidades')
    .select('hotel, destino, transporte, slug, preco_adulto')
    .limit(2000) 

  if (error) throw error

  const hotelMap = new Map<string, any>()
  
  data.forEach(row => {
    const key = row.hotel
    if (!key) return

    if (!hotelMap.has(key)) {
      hotelMap.set(key, {
        hotel: key,
        destino: row.destino,
        transports: new Set([row.transporte]), 
        // Slug prioritário: slug > normalização do nome
        slug: row.slug || key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
        count: 0,
        minPrice: 999999
      })
    } else {
      hotelMap.get(key).transports.add(row.transporte)
    }
    
    const entry = hotelMap.get(key)
    entry.count++
    if (row.preco_adulto && row.preco_adulto < entry.minPrice) {
      entry.minPrice = row.preco_adulto
    }
  })

  return Array.from(hotelMap.values()).map(v => ({
    ...v,
    transports: Array.from(v.transports)
  })).sort((a, b) => a.hotel.localeCompare(b.hotel))
}