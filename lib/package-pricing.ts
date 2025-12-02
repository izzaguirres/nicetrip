import { fetchActiveDiscountRules } from './supabase-service'
import type { DiscountRule } from './supabase'
import { getAgeGroupIdForAge, normalizeAgeGroupId } from './discount-age-groups'

const normalizeText = (value?: string) =>
  (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const matchesNormalizedTarget = (value: string | undefined, targets?: string[] | null) => {
  if (!targets || targets.length === 0) return true
  if (!value) return false
  const normalizedValue = normalizeText(value)
  return targets.map((item) => normalizeText(item)).includes(normalizedValue)
}

export type TransportType = 'Bus' | 'Bús' | 'Aéreo' | string

export interface PackagePeople {
  adultos: number
  criancas_0_3: number // UI: para Aéreo, este campo representa 0–2 anos
  criancas_4_5: number // UI: para Aéreo, este campo representa 2–5 anos
  criancas_6_mais: number
}

export interface PackageTotalResult {
  totalBaseUSD: number
  totalOriginalUSD?: number
  breakdown: {
    adultosCobrados: number
    criancas0a3ComTarifaReduzida: number
    criancas4a5ComTarifaReduzida: number
    criancas0a5ComoAdulto: number
    excedentes0a3ComoAdulto: number
    excedentes4a5ComoAdulto: number
  }
  discounts?: {
    total: number
    rules: Array<{ ruleId: string; name: string; amount: number }>
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
    totalOriginalUSD: totalBaseUSD,
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

interface DiscountContextOptions {
  destination?: string
  packageSlug?: string
  hotelName?: string
  departureDate?: string
}

const applyDiscounts = (
  baseTotal: number,
  transporte: TransportType,
  pessoas: PackagePeople,
  rules: DiscountRule[],
  options: DiscountContextOptions = {},
) => {
  if (!rules.length) return { total: baseTotal, breakdown: undefined as PackageTotalResult['discounts'] }

  const passengers: Array<{ age: number }> = []
  const isAereo = normalizeText(transporte).includes('aer')

  for (let i = 0; i < pessoas.adultos; i++) passengers.push({ age: 30 })
  for (let i = 0; i < pessoas.criancas_0_3; i++) passengers.push({ age: isAereo ? 2 : 3 })
  for (let i = 0; i < pessoas.criancas_4_5; i++) passengers.push({ age: isAereo ? 4 : 5 })
  for (let i = 0; i < pessoas.criancas_6_mais; i++) passengers.push({ age: 7 })

  let discountTotal = 0
  const discountRules: Array<{ ruleId: string; name: string; amount: number }> = []

  for (const passenger of passengers) {
    const passengerGroupId = getAgeGroupIdForAge(passenger.age, transporte)
    for (const rule of rules) {
      if (rule.transport_type && normalizeText(rule.transport_type) !== normalizeText(transporte)) continue
      if (rule.destinations && rule.destinations.length > 0) {
        const destination = options.destination
        const matchesDestination =
          destination &&
          rule.destinations.map((dest) => normalizeText(dest)).includes(normalizeText(destination))
        if (!matchesDestination) continue
      }
      if (!matchesNormalizedTarget(options.packageSlug, rule.package_slugs)) continue
      if (!matchesNormalizedTarget(options.hotelName, rule.hotel_names)) continue
      
      // Verificação de Datas Específicas
      if (rule.target_dates && rule.target_dates.length > 0) {
        if (!options.departureDate) continue // Se não temos a data da viagem, não aplica regra específica
        if (!rule.target_dates.includes(options.departureDate)) continue // Data não bate
      }

      const hasGroupFilters = Array.isArray(rule.age_groups) && rule.age_groups.length > 0
      if (hasGroupFilters) {
        if (!passengerGroupId) continue
        const normalizedGroups = rule.age_groups.map((group) => normalizeAgeGroupId(group))
        if (!normalizedGroups.includes(normalizeAgeGroupId(passengerGroupId))) continue
      } else {
        if (rule.age_min != null && passenger.age < rule.age_min) continue
        if (rule.age_max != null && passenger.age > rule.age_max) continue
      }

      const amount = rule.amount_type === 'percent' ? (baseTotal * rule.amount) / 100 : rule.amount
      discountTotal += amount
      discountRules.push({ ruleId: rule.id, name: rule.name, amount })
    }
  }

  const total = Math.max(0, Math.round(baseTotal - discountTotal))
  return {
    total,
    breakdown:
      discountRules.length > 0
        ? {
            total: Math.round(discountTotal),
            rules: discountRules,
          }
        : undefined,
  }
}

export async function computePackageTotalWithDiscounts(
  transporte: TransportType,
  precoAdultoUSD: number,
  pessoas: PackagePeople,
  options: DiscountContextOptions = {},
): Promise<PackageTotalResult> {
  const base = computePackageBaseTotal(transporte, precoAdultoUSD, pessoas)
  const rules = await fetchActiveDiscountRules({
    transportType: transporte,
    destination: options.destination,
    packageSlug: options.packageSlug,
    hotelName: options.hotelName,
  })

  if (!rules.length) {
    return {
      totalBaseUSD: base.totalBaseUSD,
      totalOriginalUSD: base.totalBaseUSD,
      breakdown: base.breakdown,
    }
  }

  const discounts = applyDiscounts(base.totalBaseUSD, transporte, pessoas, rules, options)

  return {
    totalBaseUSD: discounts.total,
    totalOriginalUSD: base.totalBaseUSD,
    breakdown: base.breakdown,
    discounts: discounts.breakdown,
  }
}

export interface PackageRoomRequest {
  precoAdultoUSD: number
  pessoas: PackagePeople
}

export interface PackagePricingSummary {
  totalUSD: number
  originalUSD: number
  discountUSD: number
  appliedRules: Array<{ ruleId: string; name: string; amount: number }>
}

export async function computePackagePricingSummary(
  transporte: TransportType,
  rooms: PackageRoomRequest[],
  options: DiscountContextOptions = {},
): Promise<PackagePricingSummary> {
  if (!rooms.length) {
    return {
      totalUSD: 0,
      originalUSD: 0,
      discountUSD: 0,
      appliedRules: [],
    }
  }

  const rules = await fetchActiveDiscountRules({
    transportType: transporte,
    destination: options.destination,
    packageSlug: options.packageSlug,
    hotelName: options.hotelName,
  })

  let totalOriginal = 0
  let totalFinal = 0
  const ruleTotals = new Map<string, { name: string; amount: number }>()

  for (const room of rooms) {
    const base = computePackageBaseTotal(transporte, room.precoAdultoUSD, room.pessoas)
    totalOriginal += base.totalBaseUSD

    if (!rules.length) {
      totalFinal += base.totalBaseUSD
      continue
    }

    const discounts = applyDiscounts(base.totalBaseUSD, transporte, room.pessoas, rules, options)
    totalFinal += discounts.total

    if (discounts.breakdown) {
      for (const rule of discounts.breakdown.rules) {
        const entry = ruleTotals.get(rule.ruleId) ?? { name: rule.name, amount: 0 }
        entry.amount += rule.amount
        ruleTotals.set(rule.ruleId, entry)
      }
    }
  }

  const discountUSD = Math.max(0, Math.round(totalOriginal - totalFinal))
  const appliedRules = Array.from(ruleTotals.entries()).map(([ruleId, value]) => ({
    ruleId,
    name: value.name,
    amount: Math.round(value.amount),
  }))

  return {
    totalUSD: Math.round(totalFinal),
    originalUSD: Math.round(totalOriginal),
    discountUSD,
    appliedRules,
  }
}
