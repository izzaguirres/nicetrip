import { useState } from 'react'

interface RoomConfig {
  adults: number
  children_0_3: number
  children_4_5: number
  children_6: number
}

interface SmartFilterResult {
  hotel: string
  quarto_tipo: string
  capacidade: number
  preco_total_calculado: number
  preco_por_pessoa: number
  justificativa: string
  dados_completos: any
  score_otimizacao: number
}

interface SmartFilterResponse {
  success: boolean
  analysis?: {
    resultados: SmartFilterResult[]
    resumo_analise: string
  }
  metadata?: {
    total_opcoes_analisadas: number
    pessoas_total: number
    quartos_necessarios: number
    algoritmo: string
    timestamp: string
  }
  error?: string
}

interface Filters {
  destino: string
  transporte: string
  data_saida: string
  adultos: string
  criancas_0_3: string
  criancas_4_5: string
  criancas_6: string
  quartos: string
}

export function useSmartFilter() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SmartFilterResult[]>([])
  const [analysis, setAnalysis] = useState<string>('')
  const [metadata, setMetadata] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const executeSmartFilter = async (filters: Filters, roomsConfig?: RoomConfig[]) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🧠 Executando Smart Filter...', { filters, roomsConfig })

      const response = await fetch('/api/smart-filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters,
          roomsConfig
        })
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data: SmartFilterResponse = await response.json()

      if (!data.success) {
        // ✅ CORREÇÃO: Não tratar "nenhum dado encontrado" como erro fatal
        if (data.error && data.error.includes('Nenhum dado encontrado')) {
          console.log('⚠️ Smart Filter não encontrou dados, mas não é erro crítico')
          setResults([])
          setAnalysis('Nenhum resultado encontrado para os filtros especificados')
          setMetadata(null)
          
          return {
            success: true, // Não é erro, é situação válida
            results: [],
            analysis: 'Nenhum resultado encontrado para os filtros especificados',
            metadata: null
          }
        }
        
        // Se é outro tipo de erro, aí sim lançar exceção
        if (data.error) {
          throw new Error(data.error)
        }
        
        // Fallback para situação sem dados
        console.log('⚠️ Smart Filter sem dados, retornando vazio')
        setResults([])
        setAnalysis('Nenhum resultado encontrado para os filtros especificados')
        setMetadata(null)
        
        return {
          success: true,
          results: [],
          analysis: 'Nenhum resultado encontrado para os filtros especificados',
          metadata: null
        }
      }

      if (!data.analysis) {
        console.log('⚠️ Smart Filter sem análise, retornando vazio')
        setResults([])
        setAnalysis('Nenhum resultado encontrado')
        setMetadata(data.metadata || null)
        
        return {
          success: true,
          results: [],
          analysis: 'Nenhum resultado encontrado',
          metadata: data.metadata || null
        }
      }

      console.log('✅ Smart Filter executado com sucesso:', data)

      setResults(data.analysis.resultados)
      setAnalysis(data.analysis.resumo_analise)
      setMetadata(data.metadata)

      return {
        success: true,
        results: data.analysis.resultados,
        analysis: data.analysis.resumo_analise,
        metadata: data.metadata
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido no Smart Filter'
      console.error('❌ Erro no Smart Filter:', err)
      setError(errorMessage)
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setResults([])
    setAnalysis('')
    setMetadata(null)
    setError(null)
  }

  return {
    // Estado
    loading,
    results,
    analysis,
    metadata,
    error,
    
    // Ações
    executeSmartFilter,
    clearResults,
    
    // Computed
    hasResults: results.length > 0,
    bestResult: results[0] || null
  }
} 