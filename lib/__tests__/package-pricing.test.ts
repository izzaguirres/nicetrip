import { describe, it, expect, vi, beforeEach, afterEach, type SpyInstance } from 'vitest'
import {
  computePackageBaseTotal,
  computePackageTotalWithDiscounts,
  computePackagePricingSummary,
} from '../package-pricing'
import * as service from '../supabase-service'

let fetchRulesSpy: SpyInstance

describe('computePackageBaseTotal', () => {
  it('calcula pacote Bus com criança 0-3 cortesia', () => {
    const result = computePackageBaseTotal('Bus', 490, {
      adultos: 2,
      criancas_0_3: 1,
      criancas_4_5: 0,
      criancas_6_mais: 0,
    })

    expect(result.totalBaseUSD).toBe(1030)
    expect(result.breakdown.adultosCobrados).toBe(2)
    expect(result.breakdown.criancas0a3ComTarifaReduzida).toBe(1)
    expect(result.breakdown.criancas0a5ComoAdulto).toBe(0)
  })

  it('cobra criança excedente como adulto no Bus', () => {
    const result = computePackageBaseTotal('Bus', 490, {
      adultos: 2,
      criancas_0_3: 2,
      criancas_4_5: 0,
      criancas_6_mais: 0,
    })

    expect(result.totalBaseUSD).toBe(1520)
    expect(result.breakdown.adultosCobrados).toBe(3)
    expect(result.breakdown.excedentes0a3ComoAdulto).toBe(1)
  })

  it('aplica tarifas especiais para Aéreo', () => {
    const result = computePackageBaseTotal('Aéreo', 800, {
      adultos: 2,
      criancas_0_3: 1,
      criancas_4_5: 1,
      criancas_6_mais: 0,
    })

    expect(result.totalBaseUSD).toBe(2560)
    expect(result.breakdown.adultosCobrados).toBe(3)
    expect(result.breakdown.criancas0a3ComTarifaReduzida).toBe(1)
    expect(result.breakdown.criancas4a5ComTarifaReduzida).toBe(0)
  })
})

describe('computePackageTotalWithDiscounts', () => {
  beforeEach(() => {
    fetchRulesSpy = vi.spyOn(service, 'fetchActiveDiscountRules')
    fetchRulesSpy.mockResolvedValue([
      {
        id: 'rule-1',
        name: 'Aéreo Adulto -150',
        transport_type: 'Aéreo',
        destinations: null,
        package_slugs: null,
        hotel_names: null,
        age_groups: null,
        age_min: 6,
        age_max: null,
        amount: 150,
        amount_currency: 'USD',
        amount_type: 'fixed',
        valid_from: null,
        valid_to: null,
        is_active: true,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('aplica desconto por adulto em aéreo', async () => {
    const result = await computePackageTotalWithDiscounts(
      'Aéreo',
      800,
      { adultos: 2, criancas_0_3: 0, criancas_4_5: 0, criancas_6_mais: 0 },
    )

    expect(result.totalBaseUSD).toBe(1300) // 2 * 800 = 1600 - (2 * 150)
    expect(result.totalOriginalUSD).toBe(1600)
    expect(result.discounts?.total).toBe(300)
    expect(result.discounts?.rules.length).toBeGreaterThan(0)
  })

  it('aplica regra para múltiplas faixas etárias configuradas', async () => {
    fetchRulesSpy.mockResolvedValue([
      {
        id: 'rule-ages',
        name: 'Adultos e 6+ -150',
        transport_type: 'Aéreo',
        destinations: null,
        package_slugs: null,
        hotel_names: null,
        age_groups: ['aereo_adult', 'aereo_child_6_plus'],
        age_min: null,
        age_max: null,
        amount: 150,
        amount_currency: 'USD',
        amount_type: 'fixed',
        valid_from: null,
        valid_to: null,
        is_active: true,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])

    const result = await computePackageTotalWithDiscounts(
      'Aéreo',
      800,
      { adultos: 1, criancas_0_3: 0, criancas_4_5: 0, criancas_6_mais: 1 },
    )

    expect(result.totalOriginalUSD).toBe(1600)
    expect(result.totalBaseUSD).toBe(1300)
    expect(result.discounts?.total).toBe(300)
  })

  it('repasse contexto de destino/pacote/hotel para busca de regras', async () => {
    fetchRulesSpy.mockResolvedValue([])
    await computePackageTotalWithDiscounts(
      'Bus',
      500,
      { adultos: 2, criancas_0_3: 0, criancas_4_5: 0, criancas_6_mais: 0 },
      { destination: 'Bombinhas', packageSlug: 'slug-123', hotelName: 'Residencial Terrazas' },
    )
    expect(fetchRulesSpy).toHaveBeenCalledWith({
      transportType: 'Bus',
      destination: 'Bombinhas',
      packageSlug: 'slug-123',
      hotelName: 'Residencial Terrazas',
    })
  })

  it('aplica desconto apenas quando slug corresponde', async () => {
    fetchRulesSpy.mockResolvedValue([
      {
        id: 'rule-2',
        name: 'Promo exclusiva',
        transport_type: 'Bus',
        destinations: null,
        package_slugs: ['slug-alvo'],
        hotel_names: null,
        age_groups: null,
        age_min: null,
        age_max: null,
        amount: 100,
        amount_currency: 'USD',
        amount_type: 'fixed',
        valid_from: null,
        valid_to: null,
        is_active: true,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])

    const semMatch = await computePackageTotalWithDiscounts(
      'Bus',
      400,
      { adultos: 1, criancas_0_3: 0, criancas_4_5: 0, criancas_6_mais: 0 },
      { packageSlug: 'outro-slug' },
    )
    expect(semMatch.totalBaseUSD).toBe(400)
    expect(semMatch.discounts).toBeUndefined()

    const comMatch = await computePackageTotalWithDiscounts(
      'Bus',
      400,
      { adultos: 1, criancas_0_3: 0, criancas_4_5: 0, criancas_6_mais: 0 },
      { packageSlug: 'slug-alvo' },
    )
    expect(comMatch.totalBaseUSD).toBe(300)
    expect(comMatch.discounts?.total).toBe(100)
  })
})

describe('computePackagePricingSummary', () => {
  beforeEach(() => {
    fetchRulesSpy = vi.spyOn(service, 'fetchActiveDiscountRules')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('soma múltiplos quartos aplicando descontos por passageiro', async () => {
    fetchRulesSpy.mockResolvedValue([
      {
        id: 'rule-1',
        name: 'Adultos 6+ -150',
        transport_type: 'Aéreo',
        destinations: null,
        package_slugs: null,
        hotel_names: null,
        age_groups: null,
        age_min: 6,
        age_max: null,
        amount: 150,
        amount_currency: 'USD',
        amount_type: 'fixed',
        valid_from: null,
        valid_to: null,
        is_active: true,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])

    const summary = await computePackagePricingSummary(
      'Aéreo',
      [
        {
          precoAdultoUSD: 800,
          pessoas: { adultos: 2, criancas_0_3: 0, criancas_4_5: 0, criancas_6_mais: 0 },
        },
        {
          precoAdultoUSD: 800,
          pessoas: { adultos: 0, criancas_0_3: 0, criancas_4_5: 0, criancas_6_mais: 2 },
        },
      ],
      { destination: 'Canasvieiras' },
    )

    expect(fetchRulesSpy).toHaveBeenCalledTimes(1)
    expect(summary.originalUSD).toBe(3200)
    expect(summary.totalUSD).toBe(2600)
    expect(summary.discountUSD).toBe(600)
    expect(summary.appliedRules[0]).toMatchObject({ amount: 600, name: 'Adultos 6+ -150' })
  })

  it('retorna totais base quando não há descontos aplicáveis', async () => {
    fetchRulesSpy.mockResolvedValue([])

    const summary = await computePackagePricingSummary(
      'Bus',
      [
        {
          precoAdultoUSD: 500,
          pessoas: { adultos: 2, criancas_0_3: 1, criancas_4_5: 0, criancas_6_mais: 0 },
        },
      ],
      { hotelName: 'Residencial Terrazas' },
    )

    expect(summary.originalUSD).toBe(1050)
    expect(summary.totalUSD).toBe(1050)
    expect(summary.discountUSD).toBe(0)
    expect(summary.appliedRules).toHaveLength(0)
  })
})
