import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 GPT Filter iniciando...')
    
    const body = await request.json()
    const { filters, roomsConfig } = body
    
    console.log('📋 Filtros recebidos:', filters)
    console.log('🏠 Configuração de quartos:', roomsConfig)

    // 1. Buscar TODOS os dados do Supabase
    const { data: allData, error: supabaseError } = await supabase
      .from('disponibilidades')
      .select('*')
      .eq('destino', filters.destino)
      .eq('transporte', filters.transporte)
      .eq('data_saida', filters.data_saida)

    if (supabaseError) {
      console.error('❌ Erro Supabase:', supabaseError)
      return NextResponse.json({ 
        error: 'Erro ao buscar dados do Supabase',
        fallback: true 
      })
    }

    console.log(`📊 Dados encontrados: ${allData?.length || 0} registros`)

    if (!allData || allData.length === 0) {
      return NextResponse.json({ 
        error: 'Nenhum dado encontrado para os filtros especificados',
        results: []
      })
    }

    // 2. Calcular total de pessoas
    const totalAdultos = parseInt(filters.adultos)
    const totalCriancas = (parseInt(filters.criancas_0_3) || 0) + 
                         (parseInt(filters.criancas_4_5) || 0) + 
                         (parseInt(filters.criancas_6) || 0)
    const totalPessoas = totalAdultos + totalCriancas
    const quartosNecessarios = parseInt(filters.quartos)

    console.log(`👥 Total: ${totalPessoas} pessoas em ${quartosNecessarios} quartos`)

    // 3. Agrupar hotéis por tipo de quarto
    const hoteisPorTipo = allData.reduce((acc: Record<string, Record<string, any>>, item: any) => {
      const hotelKey = item.hotel
      if (!acc[hotelKey]) acc[hotelKey] = {}
      if (!acc[hotelKey][item.quarto_tipo]) {
        acc[hotelKey][item.quarto_tipo] = item
      }
      return acc
    }, {} as Record<string, Record<string, any>>)

    // 4. Preparar dados para o GPT
    const dadosParaGPT = {
      filtros: filters,
      configuracao_quartos: roomsConfig,
      total_pessoas: totalPessoas,
      quartos_necessarios: quartosNecessarios,
      hoteis_disponiveis: hoteisPorTipo
    }

    // 5. Prompt para o GPT
    const prompt = `
    Você é um especialista em reservas de hotel. Analise os dados abaixo e retorne os 5 MELHORES resultados otimizados.

    DADOS DA PESQUISA:
    ${JSON.stringify(dadosParaGPT, null, 2)}

    REGRAS PARA ANÁLISE:
    1. Considere o melhor custo-benefício para ${totalPessoas} pessoas em ${quartosNecessarios} quartos
    2. Escolha o tipo de quarto IDEAL para cada hotel (considerando capacidade vs preço)
    3. Priorize quartos que acomodem melhor a configuração específica
    4. Considere preços por pessoa (adulto/criança)
    5. Equilibre preço total vs qualidade

    CONFIGURAÇÃO ESPECÍFICA DOS QUARTOS:
    ${roomsConfig ? JSON.stringify(roomsConfig) : 'Distribuição automática necessária'}

    RETORNE UM JSON com exatamente esta estrutura:
    {
      "resultados": [
        {
          "hotel": "NOME_DO_HOTEL",
          "quarto_tipo": "TIPO_ESCOLHIDO",
          "preco_total_calculado": 0000,
          "justificativa": "Por que este é uma boa opção",
          "dados_completos": { objeto_do_supabase }
        }
      ],
      "resumo_analise": "Resumo da sua análise e critérios usados"
    }

    IMPORTANTE: Retorne APENAS o JSON, sem markdown ou texto adicional.
    `

    // 6. Chamar GPT
    console.log('🧠 Enviando para GPT...')
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em análise de dados de hotelaria e otimização de reservas. Retorne sempre respostas em JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })

    const gptResponse = completion.choices[0]?.message?.content

    if (!gptResponse) {
      throw new Error('GPT não retornou resposta')
    }

    console.log('🤖 Resposta GPT recebida')

    // 7. Parsear resposta do GPT
    let gptResult
    try {
      // Limpar possível markdown
      const cleanResponse = gptResponse.replace(/```json|```/g, '').trim()
      gptResult = JSON.parse(cleanResponse)
    } catch (parseError) {
      console.error('❌ Erro ao parsear GPT:', parseError)
      throw new Error('Erro ao processar resposta do GPT')
    }

    // 8. Validar e retornar
    return NextResponse.json({
      success: true,
      gpt_analysis: gptResult,
      original_data_count: allData.length,
      filtered_count: gptResult.resultados?.length || 0,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('💥 Erro no GPT Filter:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      success: false
    }, { status: 500 })
  }
} 