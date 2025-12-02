
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    
    console.log("🤖 AI Insight Request Iniciado")
    console.log("🔑 API Key presente?", !!apiKey)

    if (!apiKey) {
      console.error("❌ API Key não encontrada nas variáveis de ambiente")
      return NextResponse.json(
        { error: "API Key não configurada.", details: "Verifique o arquivo .env.local e adicione GEMINI_API_KEY." },
        { status: 503 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Tentando usar o modelo Pro mais recente
    // Se o "gemini-3-pro-preview" ainda não estiver disponível, faça fallback manual aqui se necessário.
    // Por enquanto, vamos usar o gemini-1.5-pro que é o modelo de alta capacidade estável.
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" })

    const data = await req.json()
    
    const prompt = `
      Atue como um Head de Growth & Analytics para a agência de viagens "Nice Trip".
      Analise os dados de performance abaixo (referentes ao período selecionado) e gere um relatório executivo conciso.
      
      ## Dados do Período
      - Buscas Totais: ${data.totalSearches}
      - Tendência de Buscas: ${data.growth?.searches}% (período anterior)
      - Conversões (WhatsApp): ${data.totalConversions}
      - Taxa de Conversão: ${data.conversionRate}%
      
      ## Top Destinos (Demanda)
      ${data.topDestinations?.map((d: any) => `- ${d.destino}: ${d.count} buscas`).join('\n') || "Sem dados significativos"}
      
      ## Top Transportes (Preferência)
      ${data.topTransportes?.map((t: any) => `- ${t.transporte}: ${t.count} buscas`).join('\n') || "Sem dados significativos"}
      
      ## Objetivo
      Identificar gargalos de conversão e oportunidades de receita imediata.
      
      ## Formato de Saída (Markdown)
      Crie uma resposta estruturada com os seguintes tópicos (use emojis para facilitar a leitura):
      
      ### 📊 Diagnóstico Rápido
      Um parágrafo resumindo a saúde atual das vendas. O crescimento é real ou sazonal? A conversão está saudável (benchmark: 1-3%)?
      
      ### 🚀 Oportunidades de Ouro
      Liste 2 destinos ou pacotes que estão com alta demanda mas talvez precisem de mais destaque ou ofertas melhores.
      
      ### ⚠️ Atenção Necessária
      Aponte 1 ponto crítico (ex: queda nas buscas, conversão baixa em mobile, ou um destino que parou de performar).
      
      ### 💡 Ação Recomendada
      Uma única ação prática para a equipe de marketing ou vendas executar HOJE.
    `

    console.log("🚀 Enviando prompt para o Gemini (Model: gemini-3-pro-preview)...")
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    console.log("✅ Resposta da IA recebida com sucesso")

    return NextResponse.json({ insight: text })

  } catch (error: any) {
    console.error("💥 ERRO CRÍTICO NA ROTA DE IA:", error)
    
    // Extrair mensagem de erro útil
    let errorMessage = "Falha desconhecida ao processar inteligência."
    let errorDetails = error.message
    
    if (error.message?.includes("API key not valid")) {
        errorMessage = "API Key Inválida."
        errorDetails = "A chave configurada no .env.local não é válida."
    } else if (error.message?.includes("404") || error.message?.includes("not found")) {
        errorMessage = "Modelo não encontrado."
        errorDetails = "O modelo de IA solicitado não está disponível para esta chave."
    }

    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: 500 }
    )
  }
}
