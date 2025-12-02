import { describe, it, expect } from 'vitest'

import fixture from '../fixtures/baseline/hospedagem-baseline.json'
import {
  calcularPagantesHospedagem,
  calcularPrecoHospedagem,
} from '@/lib/hospedagem-utils'

describe('Hospedagem baseline – diária x noites', () => {
  it('mantém subtotal coerente com as diárias aprovadas', () => {
    const room = fixture.room
    const daily = fixture.daily

    const pagantes = calcularPagantesHospedagem(
      room.adultos,
      room.criancas_0_3,
      room.criancas_4_5,
      room.criancas_6,
    )

    expect(pagantes.tipoQuartoRequerido).toBe(fixture.expected.tipo_quarto)

    const pricing = calcularPrecoHospedagem(daily.valor_diaria, daily.noites, pagantes)
    expect(pricing.precoPorNoite).toBe(fixture.expected.preco_por_noite)
    expect(pricing.precoTotal).toBe(fixture.expected.total)
  })
})

