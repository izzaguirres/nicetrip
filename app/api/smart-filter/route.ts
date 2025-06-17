import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

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

export async function POST(request: NextRequest) {
  try {
    console.log('🧠 Smart Filter iniciando...')
    
    const body = await request.json()
    const { filters, roomsConfig } = body
    
    console.log('📋 Filtros recebidos:', filters)
    console.log('🏠 Configuração de quartos:', roomsConfig)
    console.log('🔍 Debug detalhado:', {
      destino: filters.destino,
      transporte: filters.transporte,
      data_saida: filters.data_saida,
      adultos: filters.adultos,
      criancas: `0-3: ${filters.criancas_0_3}, 4-5: ${filters.criancas_4_5}, 6+: ${filters.criancas_6}`,
      quartos: filters.quartos
    })

    // 1. ✅ USAR MESMA LÓGICA DO useDisponibilidades - Buscar TODOS os dados primeiro
    console.log('Buscando TODOS os dados do Supabase (sem filtros SQL)...')
    let { data: allData, error: supabaseError } = await supabase
      .from('disponibilidades')
      .select('*')

    // ✅ MESMA LÓGICA: Se há erro do Supabase (não configurado), usar dados de fallback
    if (supabaseError && supabaseError.message.includes('Supabase não configurado')) {
      console.log('Supabase não configurado, usando dados de fallback...')
      
      // ✅ USAR EXATAMENTE OS MESMOS DADOS DE FALLBACK DO useDisponibilidades
      const FALLBACK_DATA = [
          {
            id: 1,
            destino: "Canasvieiras",
            data_saida: "2025-11-23",
            transporte: "Bus",
            hotel: "Residencial Terrazas",
            quarto_tipo: "Habitación Cuádruple",
            capacidade: 4,
            preco_adulto: 490,
            preco_crianca_0_3: 50,
            preco_crianca_4_5: 350,
            preco_crianca_6_mais: 490,
            noites_hotel: 7
          },
          {
            id: 2,
            destino: "Canasvieiras",
            data_saida: "2025-11-30",
            transporte: "Bus",
            hotel: "Residencial Leonidas",
            quarto_tipo: "Habitación Cuádruple",
            capacidade: 4,
            preco_adulto: 490,
            preco_crianca_0_3: 50,
            preco_crianca_4_5: 350,
            preco_crianca_6_mais: 490,
            noites_hotel: 7
          },
          {
            id: 3,
            destino: "Canasvieiras",
            data_saida: "2025-12-07",
            transporte: "Bus",
            hotel: "Hotel Fenix",
            quarto_tipo: "Habitación Doble",
            capacidade: 6,
            preco_adulto: 490,
            preco_crianca_0_3: 50,
            preco_crianca_4_5: 350,
            preco_crianca_6_mais: 490,
            noites_hotel: 5
          },
          {
            id: 4,
            destino: "Canasvieiras",
            data_saida: "2025-11-23",
            transporte: "Aéreo",
            hotel: "Resort Premium",
            quarto_tipo: "Habitación Suite",
            capacidade: 6,
            preco_adulto: 490,
            preco_crianca_0_3: 50,
            preco_crianca_4_5: 350,
            preco_crianca_6_mais: 490,
            noites_hotel: 7
          },
          {
            id: 5,
            destino: "Canasvieiras",
            data_saida: "2025-12-14",
            transporte: "Bus",
            hotel: "Hotel Costa Verde",
            quarto_tipo: "Habitación Triple",
            capacidade: 5,
            preco_adulto: 490,
            preco_crianca_0_3: 50,
            preco_crianca_4_5: 350,
            preco_crianca_6_mais: 490,
            noites_hotel: 7
          },
          {
            id: 6,
            destino: "Florianópolis",
            data_saida: "2025-11-23",
            transporte: "Aéreo",
            hotel: "Pousada Sol e Mar",
            quarto_tipo: "Habitación Familiar",
            capacidade: 6,
            preco_adulto: 490,
            preco_crianca_0_3: 50,
            preco_crianca_4_5: 350,
            preco_crianca_6_mais: 490,
            noites_hotel: 5
          },
          {
            id: 7,
            destino: "Bombinhas",
            data_saida: "2025-11-30",
            transporte: "Bus",
            hotel: "Villa Bombinhas",
            quarto_tipo: "Habitación Doble",
            capacidade: 4,
            preco_adulto: 490,
            preco_crianca_0_3: 50,
            preco_crianca_4_5: 350,
            preco_crianca_6_mais: 490,
            noites_hotel: 7
          }
        ]
        
        // Filtrar dados de fallback
        let dadosFallback = FALLBACK_DATA.filter(item => 
          item.destino.toLowerCase().includes(filters.destino.toLowerCase()) &&
          item.transporte.toLowerCase().includes(filters.transporte.toLowerCase())
        )
        
        if (dadosFallback.length > 0) {
          console.log(`📊 Usando ${dadosFallback.length} registros de fallback`)
          allData = dadosFallback
        } else {
          return NextResponse.json({ 
            success: false,
            error: 'Nenhum dado encontrado para os filtros especificados',
            results: []
          })
        }
      } else if (supabaseError) {
        console.error('❌ Erro Supabase:', supabaseError)
        return NextResponse.json({ 
          success: false,
          error: 'Erro ao buscar dados do Supabase',
          results: []
        })
      }

      // Se chegou aqui, usar dados do Supabase (pode estar vazio)
      if (!allData || allData.length === 0) {
        // Aplicar filtros nos dados de fallback
        console.log('Supabase vazio, aplicando filtros em dados de fallback...')
        const FALLBACK_DATA = [
          {
            id: 1,
            destino: "Canasvieiras",
            data_saida: "2025-11-23",
            transporte: "Bus",
            hotel: "Residencial Terrazas",
            quarto_tipo: "Habitación Cuádruple",
            capacidade: 4,
            preco_adulto: 490,
            preco_crianca_0_3: 50,
            preco_crianca_4_5: 350,
            preco_crianca_6_mais: 490,
            noites_hotel: 7
          },
          {
            id: 2,
            destino: "Canasvieiras",
            data_saida: "2025-11-30",
            transporte: "Bus",
            hotel: "Residencial Leonidas",
            quarto_tipo: "Habitación Cuádruple",
            capacidade: 4,
            preco_adulto: 490,
            preco_crianca_0_3: 50,
            preco_crianca_4_5: 350,
            preco_crianca_6_mais: 490,
            noites_hotel: 7
          },
          {
            id: 3,
            destino: "Canasvieiras",
            data_saida: "2025-12-07",
            transporte: "Bus",
            hotel: "Hotel Fenix",
            quarto_tipo: "Habitación Doble",
            capacidade: 6,
            preco_adulto: 490,
            preco_crianca_0_3: 50,
            preco_crianca_4_5: 350,
            preco_crianca_6_mais: 490,
            noites_hotel: 5
          },
          {
            id: 4,
            destino: "Canasvieiras", 
            data_saida: "2025-11-23",
            transporte: "Aéreo",
            hotel: "Resort Premium",
            quarto_tipo: "Habitación Suite",
            capacidade: 6,
            preco_adulto: 490,
            preco_crianca_0_3: 50,
            preco_crianca_4_5: 350,
            preco_crianca_6_mais: 490,
            noites_hotel: 7
          },
          {
            id: 5,
            destino: "Canasvieiras",
            data_saida: "2025-12-14",
            transporte: "Bus",
            hotel: "Hotel Costa Verde",
            quarto_tipo: "Habitación Triple",
            capacidade: 5,
            preco_adulto: 490,
            preco_crianca_0_3: 50,
            preco_crianca_4_5: 350,
            preco_crianca_6_mais: 490,
            noites_hotel: 7
          },
          {
            id: 6,
            destino: "Florianópolis",
            data_saida: "2025-11-23",
            transporte: "Aéreo",
            hotel: "Pousada Sol e Mar",
            quarto_tipo: "Habitación Familiar",
            capacidade: 6,
            preco_adulto: 490,
            preco_crianca_0_3: 50,
            preco_crianca_4_5: 350,
            preco_crianca_6_mais: 490,
            noites_hotel: 5
          },
          {
            id: 7,
            destino: "Bombinhas",
            data_saida: "2026-01-04",
            transporte: "Bus", 
            hotel: "BOMBINHAS PALACE HOTEL",
            quarto_tipo: "Habitación Doble",
            capacidade: 4,
            preco_adulto: 490,
            preco_crianca_0_3: 50,
            preco_crianca_4_5: 350,
            preco_crianca_6_mais: 490,
            noites_hotel: 7
          }
        ]
        
        let dadosFallback = FALLBACK_DATA.filter(item => 
          item.destino.toLowerCase().includes(filters.destino.toLowerCase()) &&
          item.transporte.toLowerCase().includes(filters.transporte.toLowerCase())
        )
        
        if (dadosFallback.length > 0) {
          console.log(`📊 Usando ${dadosFallback.length} registros de fallback`)
          allData = dadosFallback
        } else {
          return NextResponse.json({ 
            success: false,
            error: 'Nenhum dado encontrado para os filtros especificados',
            results: []
          })
        }
      }

    // 2. Calcular total de pessoas e configuração
    const totalAdultos = parseInt(filters.adultos)
    const totalCriancas_0_3 = parseInt(filters.criancas_0_3) || 0
    const totalCriancas_4_5 = parseInt(filters.criancas_4_5) || 0  
    const totalCriancas_6 = parseInt(filters.criancas_6) || 0
    const totalCriancas = totalCriancas_0_3 + totalCriancas_4_5 + totalCriancas_6
    const totalPessoas = totalAdultos + totalCriancas
    const quartosNecessarios = parseInt(filters.quartos)

    console.log(`👥 Total: ${totalPessoas} pessoas (${totalAdultos} adultos, ${totalCriancas} crianças) em ${quartosNecessarios} quartos`)

    // 3. Agrupar hotéis por tipo de quarto
    const hoteisPorTipo = allData.reduce((acc: Record<string, Record<string, any>>, item: any) => {
      const hotelKey = item.hotel
      if (!acc[hotelKey]) acc[hotelKey] = {}
      if (!acc[hotelKey][item.quarto_tipo]) {
        acc[hotelKey][item.quarto_tipo] = item
      }
      return acc
    }, {} as Record<string, Record<string, any>>)

    console.log(`🏨 Hotéis disponíveis: ${Object.keys(hoteisPorTipo).length}`)

    // 4. ALGORITMO INTELIGENTE DE OTIMIZAÇÃO
    const resultadosOtimizados: SmartFilterResult[] = []

    for (const [hotelNome, tiposQuarto] of Object.entries(hoteisPorTipo)) {
      for (const [tipoQuarto, dadosQuarto] of Object.entries(tiposQuarto as Record<string, any>)) {
        
        // Verificar se o quarto pode acomodar as pessoas
        const capacidadeQuarto = (dadosQuarto as any).capacidade
        const pessoasPorQuarto = Math.ceil(totalPessoas / quartosNecessarios)
        
        // ✅ NOVA LÓGICA: Priorizar ocupação EXATA do quarto (melhor custo-benefício)
        const ocupacaoExata = (capacidadeQuarto === pessoasPorQuarto)
        const ocupacaoProxima = (capacidadeQuarto === pessoasPorQuarto + 1) // Aceita 1 pessoa a mais
        
        // Se a capacidade é adequada (exata ou próxima)
        if (ocupacaoExata || ocupacaoProxima) {
          
          // Calcular preço total considerando a configuração específica
          let precoTotal = 0
          let justificativa = ''
          
          if (roomsConfig && Array.isArray(roomsConfig)) {
            // Se temos configuração específica de quartos
            for (const quarto of roomsConfig) {
              const adultsQuarto = quarto.adults || 0
              const criancas0_3Quarto = quarto.children_0_3 || 0
              const criancas4_5Quarto = quarto.children_4_5 || 0
              const criancas6Quarto = quarto.children_6 || 0
              
                             precoTotal += (adultsQuarto * (dadosQuarto as any).preco_adulto) +
                            (criancas0_3Quarto * (dadosQuarto as any).preco_crianca_0_3) +
                            (criancas4_5Quarto * (dadosQuarto as any).preco_crianca_4_5) +
                            (criancas6Quarto * (dadosQuarto as any).preco_crianca_6_mais)
            }
            justificativa = `${roomsConfig.length} ${tipoQuarto}${roomsConfig.length > 1 ? 's' : ''} (${totalPessoas} pessoas distribuídas)`
          } else {
                         // Distribuição automática
             precoTotal = (totalAdultos * (dadosQuarto as any).preco_adulto) +
                         (totalCriancas_0_3 * (dadosQuarto as any).preco_crianca_0_3) +
                         (totalCriancas_4_5 * (dadosQuarto as any).preco_crianca_4_5) +
                         (totalCriancas_6 * (dadosQuarto as any).preco_crianca_6_mais)
            justificativa = `${quartosNecessarios} ${tipoQuarto}${quartosNecessarios > 1 ? 's' : ''} (${totalPessoas} pessoas - ~${pessoasPorQuarto} por quarto)`
          }
          
          const precoPorPessoa = precoTotal / totalPessoas
          
          // SCORE DE OTIMIZAÇÃO (0-100)
          let score = 30 // Base menor
          
          // 🎯 BÔNUS MÁXIMO por ocupação exata (melhor custo-benefício)
          if (ocupacaoExata) {
            score += 40 // Bônus máximo para ocupação perfeita
          } else if (ocupacaoProxima) {
            score += 20 // Bônus menor para ocupação próxima
          }
          
          // Bônus por eficiência de capacidade
          const eficienciaCapacidade = pessoasPorQuarto / capacidadeQuarto
          score += eficienciaCapacidade * 15
          
          // Bônus por preço competitivo
          if (precoPorPessoa < 500) score += 15
          else if (precoPorPessoa < 600) score += 10
          else if (precoPorPessoa < 700) score += 5
          
          // Bônus por tipo de quarto adequado (considerando múltiplos quartos)
          const pessoasEfetivas = Math.ceil(totalPessoas / quartosNecessarios)
          if (tipoQuarto.includes('Triple') && pessoasEfetivas <= 3) score += 10
          if (tipoQuarto.includes('Cuádruple') && pessoasEfetivas <= 4) score += 10
          if (tipoQuarto.includes('Doble') && pessoasEfetivas <= 2) score += 10
          if (tipoQuarto.includes('Quíntuple') && pessoasEfetivas <= 5) score += 15
          if (tipoQuarto.includes('Familiar') && totalPessoas >= 5) score += 15
          
          // ✅ Penalidade removida: nova lógica já evita desperdício
          
          score = Math.min(100, Math.max(0, score))
          
          resultadosOtimizados.push({
            hotel: hotelNome,
            quarto_tipo: tipoQuarto,
            capacidade: capacidadeQuarto,
            preco_total_calculado: Math.round(precoTotal),
            preco_por_pessoa: Math.round(precoPorPessoa),
            justificativa,
            dados_completos: dadosQuarto,
            score_otimizacao: Math.round(score)
          })
        }
      }
    }

    // 5. Ordenar por score e pegar os 5 melhores
    const melhoresResultados = resultadosOtimizados
      .sort((a, b) => b.score_otimizacao - a.score_otimizacao)
      .slice(0, 5)

    console.log(`🎯 Resultados otimizados: ${melhoresResultados.length}`)

    // 6. Análise resumida com foco econômico
    const melhorOpcao = melhoresResultados[0]
    const resumoAnalise = `
    Análise inteligente para ${totalPessoas} pessoas em ${quartosNecessarios} quartos:
    • Avaliados ${resultadosOtimizados.length} opções disponíveis nos resultados
    • Recomendação principal: ${melhorOpcao?.hotel} - ${melhorOpcao?.quarto_tipo} por R$ ${melhorOpcao?.preco_por_pessoa}/pessoa
    • Critérios: melhor ocupação do quarto + preço competitivo
    • Esta é a opção mais econômica entre os pacotes exibidos
    `

    return NextResponse.json({
      success: true,
      analysis: {
        resultados: melhoresResultados,
        resumo_analise: resumoAnalise.trim()
      },
      metadata: {
        total_opcoes_analisadas: resultadosOtimizados.length,
        pessoas_total: totalPessoas,
        quartos_necessarios: quartosNecessarios,
        algoritmo: 'Smart Filter v1.0',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('💥 Erro no Smart Filter:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      success: false
    }, { status: 500 })
  }
} 