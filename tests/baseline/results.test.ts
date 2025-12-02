import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { computePackageBaseTotal } from '@/lib/package-pricing'
import { calculateInstallments } from '@/lib/utils'
import busScenario from '../fixtures/baseline/bus-baseline.json'
import aereoScenario from '../fixtures/baseline/aereo-baseline.json'
import busMultiScenario from '../fixtures/baseline/bus-multiroom.json'

interface Scenario {
  label: string
  people: {
    adultos: number
    criancas_0_3: number
    criancas_4_5: number
    criancas_6_mais: number
  }
  supabaseRows: Array<{
    hotel: string
    transporte: string
    preco_adulto: number
    data_saida: string | Date
  } & Record<string, unknown>>
  expectedResults: Array<{
    hotel: string
    total: number
    perPerson: number
    installments: number
    installmentValue: number
  }>
}

const scenarios: Scenario[] = [busScenario, aereoScenario, busMultiScenario]

const runScenario = (scenario: Scenario) => {
  const totalPessoas =
    scenario.people.adultos +
    scenario.people.criancas_0_3 +
    scenario.people.criancas_4_5 +
    scenario.people.criancas_6_mais

  return scenario.supabaseRows.map((item) => {
    const calc = computePackageBaseTotal(item.transporte, item.preco_adulto, scenario.people)
    const total = calc.totalBaseUSD
    const perPerson = totalPessoas > 0 ? Math.round(total / totalPessoas) : total
    const { installments, installmentValue } = calculateInstallments(total, item.data_saida)

    return {
      hotel: item.hotel,
      total,
      perPerson,
      installments,
      installmentValue,
    }
  })
}

describe('Baseline scenarios – resultados e parcelas', () => {
  const fakeNow = new Date('2025-06-01T00:00:00Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(fakeNow)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  for (const scenario of scenarios) {
    it(`mantém valores para ${scenario.label}`, () => {
      const results = runScenario(scenario)
      expect(results.length).toBe(scenario.expectedResults.length)

      results.forEach((entry, index) => {
        const expected = scenario.expectedResults[index]
        expect(entry.hotel).toBe(expected.hotel)
        expect(entry.total).toBe(expected.total)
        expect(entry.perPerson).toBe(expected.perPerson)
        expect(entry.installments).toBe(expected.installments)
        expect(Math.round(entry.installmentValue)).toBe(expected.installmentValue)
      })
    })
  }
})
