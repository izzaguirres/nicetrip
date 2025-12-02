import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// Verificar se as variáveis de ambiente estão disponíveis
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const openaiKey = process.env.OPENAI_API_KEY

let openai: OpenAI | null = null
let supabase: any = null

// Inicializar OpenAI apenas se a chave estiver disponível
if (openaiKey) {
  openai = new OpenAI({
    apiKey: openaiKey,
  })
}

// Inicializar Supabase apenas se as credenciais estiverem disponíveis
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
}

interface SearchFilters {
  destino?: string
  cidade_saida?: string
  transporte?: string
  data_saida?: string
  pessoas?: number
}

// Dados de fallback para quando o Supabase não estiver disponível
const ENABLE_FALLBACK = (process.env.NEXT_PUBLIC_ENABLE_FALLBACK || '').toLowerCase() === 'true'
const DEBUG = process.env.NEXT_PUBLIC_DEBUG_LOGS === 'true' || process.env.DEBUG_LOGS === 'true'
const FALLBACK_PACOTES = [
  {
    id: 1,
    destino: "Canasvieiras",
    cidade_saida: "Buenos Aires",
    transporte: "Bus",
    data_saida: "2025-10-17",
    hotel: "Residencial Terrazas",
    preco_adulto: 450,
    preco_crianca_0_3: 0,
    preco_crianca_4_5: 225,
    preco_crianca_6_mais: 315,
    descricao: "Pacote completo com hospedagem e transporte",
    duracao: "7 dias / 6 noites"
  },
  {
    id: 2,
    destino: "Florianópolis",
    cidade_saida: "Buenos Aires",
    transporte: "Aéreo",
    data_saida: "2025-10-18",
    hotel: "Hotel Fenix",
    preco_adulto: 680,
    preco_crianca_0_3: 0,
    preco_crianca_4_5: 340,
    preco_crianca_6_mais: 476,
    descricao: "Pacote premium com voo e hotel 4 estrelas",
    duracao: "5 dias / 4 noites"
  },
  {
    id: 3,
    destino: "Bombinhas",
    cidade_saida: "São Paulo",
    transporte: "Bus",
    data_saida: "2025-10-19",
    hotel: "Residencial Leonidas",
    preco_adulto: 520,
    preco_crianca_0_3: 0,
    preco_crianca_4_5: 260,
    preco_crianca_6_mais: 364,
    descricao: "Pacote família com atividades inclusas",
    duracao: "6 dias / 5 noites"
  }
]

export async function POST(req: Request) {
  try {
    if (DEBUG) console.log('Endpoint sugerir-pacotes chamado');
    
    const body = await req.json()
    if (DEBUG) console.log('Body recebido:', body);
    
    const { destino, data_saida, transporte, cidade_saida, pessoas } = body

    let pacotes = FALLBACK_PACOTES

    // Tentar buscar dados do Supabase se estiver configurado
    if (supabase) {
      if (DEBUG) console.log('Buscando dados do Supabase...');
      try {
        const { data: supabasePacotes, error } = await supabase
          .from('disponibilidades')
          .select('*')

        if (!error && supabasePacotes && supabasePacotes.length > 0) {
          pacotes = supabasePacotes
          if (DEBUG) console.log(`Encontrados ${pacotes.length} pacotes no Supabase`);
        } else {
          if (ENABLE_FALLBACK) {
            if (DEBUG) console.log('Usando dados de fallback - Supabase indisponível ou sem dados');
          } else {
            pacotes = []
          }
        }
      } catch (supabaseError) {
        console.error('Erro ao conectar com Supabase:', supabaseError);
        if (ENABLE_FALLBACK) {
          if (DEBUG) console.log('Usando dados de fallback')
        } else {
          pacotes = []
        }
      }
    } else {
      if (ENABLE_FALLBACK) {
        if (DEBUG) console.log('Supabase não configurado, usando dados de fallback')
      } else {
        pacotes = []
      }
    }

    // Se não há chave da OpenAI, fazer filtro manual
    if (!openai) {
      if (DEBUG) console.log('OpenAI não configurada, fazendo filtro manual...');
      const pacotesFiltrados = pacotes.filter(item => {
        if (destino && item.destino !== destino) return false
        if (cidade_saida && item.cidade_saida !== cidade_saida) return false
        if (transporte && item.transporte !== transporte) return false
        if (data_saida && item.data_saida !== data_saida) return false
        return true
      }).slice(0, 10)

      return NextResponse.json({ 
        success: true,
        pacotes: pacotesFiltrados,
        total: pacotesFiltrados.length,
        sugestoes: pacotesFiltrados.length === 0 ? [
          'Nenhum pacote encontrado com essas opções',
          'Experimente mudar a data ou o tipo de transporte',
          'Considere destinos próximos ou datas flexíveis'
        ] : [
          `Encontrados ${pacotesFiltrados.length} pacotes disponíveis`,
          'Filtros aplicados com sucesso'
        ]
      })
    }

    // Usar ChatGPT se disponível
    if (DEBUG) console.log('Chamando ChatGPT...');
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente de viagens especializado. Ajude a recomendar os melhores pacotes baseando-se nos critérios escolhidos pelo usuário. Sempre retorne um JSON válido com os pacotes mais adequados.',
          },
          {
            role: 'user',
            content: `O usuário buscou:
- Destino: ${destino || 'qualquer'}
- Data de saída: ${data_saida || 'qualquer'}
- Transporte: ${transporte || 'qualquer'}
- Cidade de saída: ${cidade_saida || 'qualquer'}
- Número de pessoas: ${pessoas || 2}

Aqui estão os pacotes disponíveis (formato JSON):
${JSON.stringify(pacotes)}

Filtre os pacotes mais adequados com base na busca. Se não encontrar correspondência exata, recomende as opções mais parecidas (ex: datas próximas, mesmo destino, hotéis similares). 

IMPORTANTE: Retorne APENAS um JSON válido com os pacotes recomendados (máximo 10), ordenados por relevância. Não adicione explicações ou texto extra.

Formato esperado:
[
  {pacote1},
  {pacote2},
  ...
]`,
          },
        ],
      })

      const respostaGPT = completion.choices[0]?.message.content
      if (DEBUG) console.log('Resposta GPT recebida:', respostaGPT?.substring(0, 200) + '...');

      if (!respostaGPT) {
        throw new Error('Resposta vazia do ChatGPT')
      }

      const resultado = JSON.parse(respostaGPT)
      console.log(`GPT retornou ${resultado.length} pacotes`);
      
      return NextResponse.json({ 
        success: true,
        pacotes: resultado,
        total: resultado.length,
        sugestoes: resultado.length === 0 ? [
          'Nenhum pacote encontrado com essas opções',
          'Experimente mudar a data ou o tipo de transporte',
          'Considere destinos próximos ou datas flexíveis'
        ] : [
          `🤖 IA encontrou ${resultado.length} pacotes recomendados`,
          'Sugestões personalizadas baseadas na sua busca'
        ]
      })
    } catch (gptError) {
      console.error('Erro ao usar ChatGPT:', gptError);
      if (DEBUG) console.log('Fallback para filtro manual');
      
      // Fallback: retornar pacotes filtrados manualmente
      const pacotesFiltrados = pacotes.filter(item => {
        if (destino && item.destino !== destino) return false
        if (cidade_saida && item.cidade_saida !== cidade_saida) return false
        if (transporte && item.transporte !== transporte) return false
        if (data_saida && item.data_saida !== data_saida) return false
        return true
      }).slice(0, 10)

      return NextResponse.json({ 
        success: true,
        pacotes: pacotesFiltrados,
        total: pacotesFiltrados.length,
        sugestoes: pacotesFiltrados.length === 0 ? [
          'Nenhum pacote encontrado com essas opções',
          'Experimente mudar a data ou o tipo de transporte'
        ] : [
          `Encontrados ${pacotesFiltrados.length} pacotes disponíveis`,
          'Busca realizada com filtros manuais'
        ]
      })
    }
  } catch (e) {
    console.error('Erro geral no endpoint:', e)
    
    // Retornar dados de fallback apenas se habilitado
    if (ENABLE_FALLBACK) {
      return NextResponse.json({ 
        success: true,
        pacotes: FALLBACK_PACOTES,
        total: FALLBACK_PACOTES.length,
        sugestoes: [
          'Mostrando pacotes de demonstração',
          'Configure as variáveis de ambiente para funcionalidade completa',
          'Pacotes disponíveis para teste'
        ]
      }, { status: 200 })
    }
    
    return NextResponse.json({ success: false, pacotes: [], total: 0 }, { status: 500 })
  }
} 