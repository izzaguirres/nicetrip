import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { computePackageBaseTotal } from '@/lib/package-pricing'
import { calculateInstallments } from '@/lib/utils'
import busScenario from '../fixtures/baseline/bus-baseline.json'
import aereoScenario from '../fixtures/baseline/aereo-baseline.json'
import busMultiScenario from '../fixtures/baseline/bus-multiroom.json'

describe('Baseline pricing rules', () => {
  it('Bus – 2 adultos mantém total original', () => {
    const result = computePackageBaseTotal('Bus', busScenario.supabaseRows[0].preco_adulto, busScenario.people)

    expect(result.totalBaseUSD).toBe(busScenario.expectedResults[0].total)
    expect(result.breakdown.adultosCobrados).toBe(2)
    expect(result.breakdown.criancas0a3ComTarifaReduzida).toBe(0)
  })

  it('Bus – 2 adultos + 1 criança 0-3 (cortesia) mantém total base', () => {
    const result = computePackageBaseTotal('Bus', busScenario.supabaseRows[0].preco_adulto, {
      ...busScenario.people,
      criancas_0_3: 1,
    })

    expect(result.totalBaseUSD).toBe(1172)
    expect(result.breakdown.adultosCobrados).toBe(2)
    expect(result.breakdown.criancas0a3ComTarifaReduzida).toBe(1)
    expect(result.breakdown.criancas0a5ComoAdulto).toBe(0)
  })

  it('Bus – 2 adultos + 2 crianças 0-3 (terceira pessoa paga como adulto)', () => {
    const result = computePackageBaseTotal('Bus', busScenario.supabaseRows[0].preco_adulto, {
      ...busScenario.people,
      criancas_0_3: 2,
    })

    expect(result.totalBaseUSD).toBe(1733) // 3 adultos (561) + 1 criança reduzida (50)
    expect(result.breakdown.adultosCobrados).toBe(3)
    expect(result.breakdown.criancas0a3ComTarifaReduzida).toBe(1)
    expect(result.breakdown.criancas0a5ComoAdulto).toBe(1)
  })

  it('Bus – 2 quartos (2+0 cada) mantém total equivalente à soma dos quartos', () => {
    const unitPrice = busScenario.supabaseRows[0].preco_adulto
    const totalAggregated = computePackageBaseTotal('Bus', unitPrice, busMultiScenario.people)

    const roomTotals = busMultiScenario.rooms.map((room) =>
      computePackageBaseTotal('Bus', unitPrice, {
        adultos: room.adultos,
        criancas_0_3: room.criancas_0_3,
        criancas_4_5: room.criancas_4_5,
        criancas_6_mais: room.criancas_6,
      }).totalBaseUSD,
    )

    const expectedSum = roomTotals.reduce((sum, value) => sum + value, 0)

    expect(totalAggregated.totalBaseUSD).toBe(expectedSum)
    expect(totalAggregated.totalBaseUSD).toBe(busMultiScenario.expectedResults[0].total)
  })

  it('Aéreo – 2 adultos + (0-2) + (2-5) aplica tarifas especiais', () => {
    const result = computePackageBaseTotal('Aéreo', aereoScenario.supabaseRows[0].preco_adulto, aereoScenario.people)

    expect(result.totalBaseUSD).toBe(aereoScenario.expectedResults[0].total)
    expect(result.breakdown.adultosCobrados).toBe(3)
    expect(result.breakdown.criancas0a3ComTarifaReduzida).toBe(1)
    expect(result.breakdown.criancas0a5ComoAdulto).toBe(1)
  })
})

describe('Installments calculation', () => {
  const systemToday = new Date('2025-06-01T00:00:00Z')
  const busDate = new Date(`${busScenario.filters.data_saida}T00:00:00`)
  const aereoDate = new Date(`${aereoScenario.filters.data_saida}T00:00:00`)

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(systemToday)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retorna 1 parcela quando a viagem ocorre no mesmo mês', () => {
    const { installments, installmentValue } = calculateInstallments(1200, new Date('2025-06-20'))
    expect(installments).toBe(1)
    expect(installmentValue).toBe(1200)
  })

  it('retorna parcelas mensais até o mês da viagem', () => {
    const { installments, installmentValue } = calculateInstallments(1500, aereoDate)
    expect(installments).toBe(8) // jun→jan (2025-06 .. 2026-01)
    expect(Math.round(installmentValue)).toBe(188) // 1500 / 8
  })

  it('mantém baseline de parcelas para cenário Bus', () => {
    const { installments, installmentValue } = calculateInstallments(busScenario.expectedResults[0].total, busDate)
    expect(installments).toBe(busScenario.expectedResults[0].installments)
    expect(Math.round(installmentValue)).toBe(busScenario.expectedResults[0].installmentValue)
  })
})
