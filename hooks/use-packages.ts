import { useState, useEffect, useMemo, useCallback } from 'react'
import type {
  Disponibilidade,
  CidadeSaida,
  DisponibilidadeFilter,
} from '@/lib/supabase'
import {
  fetchRealData,
  fetchCidadesSaida,
  fetchDisponibilidadeById,
  type SearchFilters,
} from '@/lib/supabase-service'

const mapFiltersToService = (
  filters?: DisponibilidadeFilter,
): SearchFilters | undefined => {
  if (!filters) return undefined
  return {
    destino: filters.destino,
    transporte: filters.transporte,
    data_saida: filters.data_saida,
    cidade_saida: filters.cidade_saida,
    preco_min: filters.preco_min,
    preco_max: filters.preco_max,
    capacidade_min: filters.capacidade_min,
  }
}

export function useDisponibilidades(filters?: DisponibilidadeFilter) {
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const filtersKey = useMemo(() => JSON.stringify(filters || {}), [filters])
  const serviceFilters = useMemo(
    () => mapFiltersToService(filters),
    [filtersKey],
  )

  const loadDisponibilidades = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchRealData(serviceFilters)
      setDisponibilidades(data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao buscar disponibilidades'
      setDisponibilidades([])
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [serviceFilters])

  useEffect(() => {
    loadDisponibilidades()
  }, [loadDisponibilidades])

  return {
    disponibilidades,
    loading,
    error,
    refetch: loadDisponibilidades,
  }
}

export function useDisponibilidade(id: string | null | undefined) {
  const [disponibilidade, setDisponibilidade] = useState<Disponibilidade | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDisponibilidade = useCallback(async () => {
    if (!id) {
      setDisponibilidade(null)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const data = await fetchDisponibilidadeById(id)
      setDisponibilidade(data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao buscar disponibilidade'
      setDisponibilidade(null)
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadDisponibilidade()
  }, [loadDisponibilidade])

  return {
    disponibilidade,
    loading,
    error,
    refetch: loadDisponibilidade,
  }
}

export function useCidadesSaida(transporte?: string) {
  const [cidades, setCidades] = useState<CidadeSaida[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCidades = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchCidadesSaida(transporte)
      setCidades(data as CidadeSaida[])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao buscar cidades de saída'
      setCidades([])
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [transporte])

  useEffect(() => {
    loadCidades()
  }, [loadCidades])

  return {
    cidades,
    loading,
    error,
    refetch: loadCidades,
  }
}

export function useDestinos() {
  const [destinos, setDestinos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDestinos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchRealData()
      const destinosUnicos = Array.from(
        new Set((data || []).map((item) => item.destino).filter(Boolean)),
      ) as string[]
      setDestinos(destinosUnicos)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao carregar destinos'
      setDestinos([])
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDestinos()
  }, [loadDestinos])

  return { destinos, loading, error, refetch: loadDestinos }
}

export function useDatasDisponiveis(destino?: string, transporte?: string) {
  const [datas, setDatas] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDatas = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const filters: SearchFilters = {}
      if (destino) filters.destino = destino
      if (transporte) filters.transporte = transporte
      const data = await fetchRealData(filters)
      const datasUnicas = Array.from(
        new Set((data || []).map((item) => item.data_saida).filter(Boolean)),
      ).sort()
      setDatas(datasUnicas)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao carregar datas disponíveis'
      setDatas([])
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [destino, transporte])

  useEffect(() => {
    loadDatas()
  }, [loadDatas])

  return { datas, loading, error, refetch: loadDatas }
}

const canonicalizeTransporte = (valor?: string): string => {
  const normalized = (valor || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  if (normalized.includes('aer')) return 'Aéreo'
  return 'Bús'
}

export function useTransportesDisponiveis(destino?: string, dataSaida?: string) {
  const [transportes, setTransportes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTransportes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const filters: SearchFilters = {}
      if (destino) filters.destino = destino
      if (dataSaida) filters.data_saida = dataSaida

      const data = await fetchRealData(filters)
      const transportesUnicos = Array.from(
        new Set(
          (data || [])
            .map((item) => canonicalizeTransporte(item.transporte))
            .filter(Boolean),
        ),
      )
      setTransportes(transportesUnicos)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao carregar transportes'
      setTransportes([])
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [destino, dataSaida])

  useEffect(() => {
    loadTransportes()
  }, [loadTransportes])

  return { transportes, loading, error, refetch: loadTransportes }
}

