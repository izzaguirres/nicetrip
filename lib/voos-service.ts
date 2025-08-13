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
  // Charter (Córdoba): sempre data null; Regular (BA): por data específica
  const origemDB = normalizeOrigemForDB(origem)
  let { data, error } = await (origemDB === 'Córdoba'
    ? supabase
        .from('voos_aereos')
        .select('*')
        .eq('origem', origemDB)
        .eq('ativo', true)
        .is('data', null)
    : supabase
        .from('voos_aereos')
        .select('*')
        .eq('origem', origemDB)
        .eq('ativo', true)
        .eq('data', dataISO as string)
  )
  if (error) return null

  const ida = data.filter((v: VooAereo) => v.sentido === 'ida')
  const volta = data.filter((v: VooAereo) => v.sentido === 'volta')

  // Bagagem: considerar a primeira linha como regra base (pode ser expandido depois por tabela própria)
  const base = data[0] as VooAereo | undefined
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

