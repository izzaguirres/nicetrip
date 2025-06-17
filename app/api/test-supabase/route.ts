import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Testando conexão com Supabase...')
    
    // Testar conexão básica
    const { data: testData, error: testError } = await supabase
      .from('disponibilidades')
      .select('*')
      .limit(5)

    if (testError) {
      console.error('❌ Erro na conexão:', testError)
      return NextResponse.json({
        success: false,
        error: testError.message,
        message: 'Erro na conexão com Supabase'
      })
    }

    console.log('✅ Conexão OK! Dados encontrados:', testData?.length || 0)

    // Buscar dados específicos do RESIDENCIAL TERRAZAS
    const { data: terrazasData, error: terrazasError } = await supabase
      .from('disponibilidades')
      .select('*')
      .ilike('hotel', '%TERRAZAS%')

    console.log('🏨 Dados do TERRAZAS:', terrazasData?.length || 0)

    // Buscar todos os hotéis únicos
    const { data: hoteisData, error: hoteisError } = await supabase
      .from('disponibilidades')
      .select('hotel, quarto_tipo, preco_adulto, preco_crianca_0_3, preco_crianca_4_5, preco_crianca_6_mais')
      .order('hotel')

    return NextResponse.json({
      success: true,
      total_registros: testData?.length || 0,
      sample_data: testData?.slice(0, 3),
      terrazas_data: terrazasData,
      todos_hoteis: hoteisData,
      message: 'Conexão com Supabase funcionando!'
    })

  } catch (error) {
    console.error('💥 Erro crítico:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      message: 'Falha na conexão com Supabase'
    })
  }
} 