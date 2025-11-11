import { describe, it, expect } from 'vitest'
import {
  calcularPagantesHospedagem,
  calcularPrecoHospedagem,
  tiposQuartoCompativeis,
} from '../hospedagem-utils'

describe('calcularPagantesHospedagem', () => {
  it('concede cortesia para criança 0-5 a cada dois adultos', () => {
    const calc = calcularPagantesHospedagem(2, 1, 0, 0)

    expect(calc.totalPagantes).toBe(2)
    expect(calc.criancasGratuitas).toBe(1)
    expect(calc.tipoQuartoRequerido).toBe('Doble')
  })

  it('cobra excedente de criança 0-5 quando falta cortesia', () => {
    const calc = calcularPagantesHospedagem(2, 0, 2, 0)

    expect(calc.totalPagantes).toBe(3)
    expect(calc.excedente_0_5).toBe(1)
    expect(calc.tipoQuartoRequerido).toBe('Triple')
  })
})

describe('tiposQuartoCompativeis', () => {
  it('reconhece nomes equivalentes de quarto', () => {
    expect(tiposQuartoCompativeis('Triple', 'Habitación Triple Superior')).toBe(true)
    expect(tiposQuartoCompativeis('Doble', 'Suite Familiar')).toBe(false)
  })
})

describe('calcularPrecoHospedagem', () => {
  it('usa o valor da diária por quarto', () => {
    const calc = calcularPagantesHospedagem(2, 0, 1, 1)
    const result = calcularPrecoHospedagem(300, 3, calc)

    expect(result.precoTotal).toBe(900)
    expect(result.precoPorNoite).toBe(300)
    expect(result.breakdown.criancas_gratuitas).toBe(calc.criancasGratuitas)
  })
})

