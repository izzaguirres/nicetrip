export type TransportType = 'Bus' | 'Bús' | 'Aéreo' | string

export interface PackagePeople {
  adultos: number
  criancas_0_3: number // UI: para Aéreo, este campo representa 0–2 anos
  criancas_4_5: number // UI: para Aéreo, este campo representa 2–5 anos
  criancas_6_mais: number
}

export interface PackageTotalResult {
  totalBaseUSD: number
  breakdown: {
    adultosCobrados: number
    criancas0a3ComTarifaReduzida: number
    criancas4a5ComTarifaReduzida: number
    criancas0a5ComoAdulto: number
    excedentes0a3ComoAdulto: number
    excedentes4a5ComoAdulto: number
  }
}

// Regra: cada 2 adultos liberam 1 criança (0–5) com tarifa reduzida.
// Crianças excedentes (0–5) pagam tarifa de adulto.
// 6+ sempre pagam tarifa de adulto.
export function computePackageBaseTotal(
  transporte: TransportType,
  precoAdultoUSD: number,
  pessoas: PackagePeople
): PackageTotalResult {
  const adultUnit = Number(precoAdultoUSD) || 0
  const a = Math.max(0, Number(pessoas.adultos) || 0)
  const c03 = Math.max(0, Number(pessoas.criancas_0_3) || 0)
  const c45 = Math.max(0, Number(pessoas.criancas_4_5) || 0)
  const c6p = Math.max(0, Number(pessoas.criancas_6_mais) || 0)

  // Todos >=6 contam como adulto pagante
  const totalAdultosPagantes = a + c6p

  // Crianças potenciais para tarifa reduzida (0–5)
  const totalCriancas05 = c03 + c45
  const direitoReduzida = Math.floor(totalAdultosPagantes / 2)
  const maxReduzidas = Math.min(totalCriancas05, direitoReduzida)

  // Alocação de cortesia: priorizar os mais novos (0–3 ou 0–2 no Aéreo)
  const reduzidas0a3 = Math.min(c03, maxReduzidas)
  const reduzidas4a5 = Math.min(c45, Math.max(0, maxReduzidas - reduzidas0a3))

  // Crianças 0–5 excedentes viram adultos
  const excedentes0a3ComoAdulto = c03 - reduzidas0a3
  const excedentes4a5ComoAdulto = c45 - reduzidas4a5
  const criancas05ComoAdulto = excedentes0a3ComoAdulto + excedentes4a5ComoAdulto

  // Valores reduzidos por transporte
  // normalizar texto corretamente (remover acentos)
  const t = (transporte || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  const isAereo = t.includes('aer')

  let precoCrianca0a3Reduzida = 50 // Bus/Bús padrão
  let precoCrianca4a5Reduzida = 350 // Bus/Bús padrão

  if (isAereo) {
    // Aéreo: 0–1y11m = 160 (inclui taxas), 2–5 = 700 (500 + 200)
    precoCrianca0a3Reduzida = 160
    // Para 2–5 anos usamos apenas a base (500). As taxas (200) são somadas no fim.
    precoCrianca4a5Reduzida = 500
  }

  const adultosCobrados = totalAdultosPagantes + criancas05ComoAdulto
  const totalAdultosUSD = adultosCobrados * adultUnit
  const totalCriancasUSD = (reduzidas0a3 * precoCrianca0a3Reduzida) + (reduzidas4a5 * precoCrianca4a5Reduzida)

  const totalBaseUSD = Math.max(0, Math.round(totalAdultosUSD + totalCriancasUSD))

  return {
    totalBaseUSD,
    breakdown: {
      adultosCobrados,
      criancas0a3ComTarifaReduzida: reduzidas0a3,
      criancas4a5ComTarifaReduzida: reduzidas4a5,
      criancas0a5ComoAdulto: criancas05ComoAdulto,
      excedentes0a3ComoAdulto,
      excedentes4a5ComoAdulto,
    }
  }
}
