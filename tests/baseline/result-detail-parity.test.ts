import { describe, it, expect, vi, beforeEach } from 'vitest'

import { computePackagePricingSummary } from '@/lib/package-pricing'
import { calculateFinalPrice, calculateInstallments } from '@/lib/utils'
import { fetchActiveDiscountRules } from '@/lib/supabase-service'

vi.mock('@/lib/supabase-service', () => ({
  fetchActiveDiscountRules: vi.fn(async () => []),
}))

interface PessoasConfig {
  adultos: number
  criancas_0_3: number
  criancas_4_5: number
  criancas_6_mais: number
}

interface DisponibilidadeConfig {
  id: number
  hotel: string
  slug_hospedagem?: string | null
  transporte: string
  preco_adulto: number
  data_saida: string
  noites_hotel?: number
  dias_totais?: number
  dias_viagem?: number
}

interface ParityScenario {
  disponibilidade: DisponibilidadeConfig
  pessoas: PessoasConfig
  searchParams: URLSearchParams
}

const buildRoomsConfig = (pessoas: PessoasConfig) => [
  {
    adults: pessoas.adultos,
    children_0_3: pessoas.criancas_0_3,
    children_4_5: pessoas.criancas_4_5,
    children_6: pessoas.criancas_6_mais,
  },
]

const gerarUrlDetalhesMock = (
  scenario: ParityScenario,
  precoCalculado: number,
) => {
  const { disponibilidade, pessoas, searchParams } = scenario
  const params = new URLSearchParams(searchParams.toString())

  params.set('hotel', disponibilidade.slug_hospedagem || disponibilidade.hotel)
  params.set('preco', String(Math.round(precoCalculado)))

  params.set('preco_adulto', String(disponibilidade.preco_adulto))
  params.set('transporte', disponibilidade.transporte)

  if (disponibilidade.noites_hotel != null) {
    params.set('noites_hotel', String(disponibilidade.noites_hotel))
  }
  if (disponibilidade.dias_totais != null) {
    params.set('dias_totais', String(disponibilidade.dias_totais))
  }
  if (disponibilidade.dias_viagem != null) {
    params.set('dias_viagem', String(disponibilidade.dias_viagem))
  }

  const rooms = buildRoomsConfig(pessoas)
  params.set('rooms_config', encodeURIComponent(JSON.stringify(rooms)))

  params.set('adultos', String(pessoas.adultos))
  params.set('criancas_0_3', String(pessoas.criancas_0_3))
  params.set('criancas_4_5', String(pessoas.criancas_4_5))
  params.set('criancas_6', String(pessoas.criancas_6_mais))
  params.set('quartos', String(rooms.length))

  return `/detalhes?${params.toString()}`
}

const fetchRulesMock = vi.mocked(fetchActiveDiscountRules)

const assertResultAndDetailParity = async (scenario: ParityScenario) => {
  const { disponibilidade, pessoas, searchParams } = scenario

  const pricingSummaryResultados = await computePackagePricingSummary(
    disponibilidade.transporte,
    [
      {
        precoAdultoUSD: disponibilidade.preco_adulto,
        pessoas,
      },
    ],
    {
      destination: searchParams.get('destino') || undefined,
      hotelName: disponibilidade.hotel,
    },
  )

  const resultFinalPrice = calculateFinalPrice(
    pricingSummaryResultados.totalUSD,
    disponibilidade.transporte,
  )
  const resultInstallments = calculateInstallments(resultFinalPrice, disponibilidade.data_saida)

  const detalhesUrl = gerarUrlDetalhesMock(scenario, pricingSummaryResultados.totalUSD)
  const detalhesParams = new URL(detalhesUrl, 'https://example.com').searchParams

  const transporteDetalhe = detalhesParams.get('transporte') || disponibilidade.transporte
  const precoAdultoDetalhe = Number(detalhesParams.get('preco_adulto') || disponibilidade.preco_adulto)
  const dataDetalhe = detalhesParams.get('data') || disponibilidade.data_saida

  const pessoasDetalhe: PessoasConfig = {
    adultos: Number(detalhesParams.get('adultos') || pessoas.adultos),
    criancas_0_3: Number(detalhesParams.get('criancas_0_3') || pessoas.criancas_0_3),
    criancas_4_5: Number(detalhesParams.get('criancas_4_5') || pessoas.criancas_4_5),
    criancas_6_mais: Number(detalhesParams.get('criancas_6') || pessoas.criancas_6_mais),
  }

  const detalheSummary = await computePackagePricingSummary(
    transporteDetalhe,
    [
      {
        precoAdultoUSD: precoAdultoDetalhe,
        pessoas: pessoasDetalhe,
      },
    ],
    {
      destination:
        detalhesParams.get('destino') || searchParams.get('destino') || undefined,
      hotelName: disponibilidade.hotel,
    },
  )

  const detalheFinalPrice = calculateFinalPrice(detalheSummary.totalUSD, transporteDetalhe)
  const detalheInstallments = calculateInstallments(detalheFinalPrice, dataDetalhe)

  expect(detalheFinalPrice).toBe(resultFinalPrice)
  expect(detalheSummary.originalUSD).toBe(pricingSummaryResultados.originalUSD)
  expect(detalheSummary.totalUSD).toBe(pricingSummaryResultados.totalUSD)
  expect(detalheInstallments.installments).toBe(resultInstallments.installments)
  expect(Math.round(detalheInstallments.installmentValue)).toBe(
    Math.round(resultInstallments.installmentValue),
  )
}

describe('assertResultAndDetailParity', () => {
  beforeEach(() => {
    fetchRulesMock.mockResolvedValue([])
  })

  it('mantém paridade entre cartão de resultado e página de detalhes para cenário Bus baseline', async () => {
    const scenario: ParityScenario = {
      disponibilidade: {
        id: 101,
        hotel: 'RESIDENCIAL LEÔNIDAS',
        slug_hospedagem: 'residencial-leonidas',
        transporte: 'Bus',
        preco_adulto: 561,
        data_saida: '2025-10-19',
        noites_hotel: 7,
        dias_totais: 8,
        dias_viagem: 8,
      },
      pessoas: {
        adultos: 2,
        criancas_0_3: 0,
        criancas_4_5: 0,
        criancas_6_mais: 0,
      },
      searchParams: new URLSearchParams({
        categoria: 'paquete',
        destino: 'Canasvieiras',
        transporte: 'Bus',
        data: '2025-10-19',
      }),
    }

    await assertResultAndDetailParity(scenario)
  })

  it('mantém paridade quando descontos estão ativos', async () => {
    fetchRulesMock.mockResolvedValue([
      {
        id: 'rule-150',
        name: 'Adultos 6+ -150',
        transport_type: 'Aéreo',
        destinations: null,
        package_slugs: null,
        hotel_names: null,
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

    await assertResultAndDetailParity({
      disponibilidade: {
        id: 202,
        hotel: 'HOTEL PREMIUM',
        slug_hospedagem: 'hotel-premium',
        transporte: 'Aéreo',
        preco_adulto: 820,
        data_saida: '2026-01-04',
        noites_hotel: 7,
        dias_totais: 8,
        dias_viagem: 8,
      },
      pessoas: {
        adultos: 2,
        criancas_0_3: 0,
        criancas_4_5: 0,
        criancas_6_mais: 2,
      },
      searchParams: new URLSearchParams({
        categoria: 'paquete',
        destino: 'Canasvieiras',
        transporte: 'Aéreo',
        data: '2026-01-04',
      }),
    })
  })
})
