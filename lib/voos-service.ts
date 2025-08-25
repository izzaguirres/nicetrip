import { supabase, type VooAereo } from './supabase'

function normalizeOrigemForDB(origem: string): 'Córdoba' | 'Buenos Aires' {
  const s = (origem || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
  if (s.includes('cordob')) return 'Córdoba'
  return 'Buenos Aires'
}

export async function getVoosPorCidadeEData(
  origem: string,
  dataISO: string | null
): Promise<{ ida: VooAereo[]; volta: VooAereo[]; bagagem?: { carry: number | null; despachada: number | null } } | null> {
  // Charter (Córdoba): sempre data null; Regular (Buenos Aires): ida na data escolhida e volta no próximo registro após a data
  const origemDB = normalizeOrigemForDB(origem)

  if (origemDB === 'Córdoba') {
    const { data, error } = await supabase
      .from('voos_aereos')
      .select('*')
      .eq('origem', origemDB)
      .eq('ativo', true)
      .is('data', null)

    if (error || !data) return null

    const ida = data.filter((v: VooAereo) => v.sentido === 'ida')
    const volta = data.filter((v: VooAereo) => v.sentido === 'volta')
    const base = data[0] as VooAereo | undefined
    const bagagem = base
      ? { carry: base.bag_carry_kg ?? null, despachada: base.bag_despachada_kg ?? null }
      : undefined
    return { ida, volta, bagagem }
  }

  // Buenos Aires: buscar ida na data específica e volta no próximo dia disponível (> dataISO)
  if (!dataISO) return null

  const [idaRes, voltaRes] = await Promise.all([
    supabase
      .from('voos_aereos')
      .select('*')
      .eq('origem', origemDB)
      .eq('ativo', true)
      .eq('data', dataISO)
      .eq('sentido', 'ida')
      .order('saida_hora', { ascending: true }),
    supabase
      .from('voos_aereos')
      .select('*')
      .eq('origem', origemDB)
      .eq('ativo', true)
      .eq('sentido', 'volta')
      .gt('data', dataISO) // garantir que não pegue a volta no mesmo dia
      .order('data', { ascending: true })
      .limit(1)
  ])

  if (idaRes.error || voltaRes.error) return null
  const ida = (idaRes.data || []) as VooAereo[]
  const volta = (voltaRes.data || []) as VooAereo[]

  const base = (ida[0] || volta[0]) as VooAereo | undefined
  const bagagem = base
    ? { carry: base.bag_carry_kg ?? null, despachada: base.bag_despachada_kg ?? null }
    : undefined

  return { ida, volta, bagagem }
}

export function formatHora(hhmm: string | null | undefined): string {
  if (!hhmm) return ''
  // espera 'HH:mm'
  return hhmm
}

