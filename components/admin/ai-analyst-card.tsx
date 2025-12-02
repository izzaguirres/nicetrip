"use client"

import { useState } from "react"
import { AdminSurface } from "@/components/admin/surface"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, AlertTriangle, Copy } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { toast } from "@/hooks/use-toast"

interface AiAnalystCardProps {
  analyticsData: any
}

export function AiAnalystCard({ analyticsData }: AiAnalystCardProps) {
  const [insight, setInsight] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateInsight = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/analytics/ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analyticsData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.details || data.error || "Falha na IA")
      }
      
      setInsight(data.insight)
    } catch (err: any) {
      setError(err.message || "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (!insight) return
    navigator.clipboard.writeText(insight)
    toast({
      title: "Copiado!",
      description: "Análise copiada para a área de transferência.",
    })
  }

  return (
    <AdminSurface className="p-6 bg-gradient-to-br from-indigo-900 to-violet-900 text-white shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Nice Trip AI Analyst</h3>
              <p className="text-xs text-indigo-200">Inteligência Artificial Gemini 3 Pro Preview</p>
            </div>
          </div>
          {!insight && !loading && (
            <Button 
              onClick={generateInsight}
              className="bg-white/10 hover:bg-white/20 text-white border-0"
              size="sm"
            >
              Gerar Análise
            </Button>
          )}
        </div>

        {loading && (
          <div className="py-8 text-center space-y-3 animate-pulse">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-indigo-300" />
            <p className="text-sm text-indigo-200">Analisando milhares de dados com Gemini 3 Pro Preview...</p>
          </div>
        )}

        {error && (
          <div className="py-4 text-center text-red-300 bg-red-900/20 rounded-lg border border-red-500/30">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm font-semibold mb-1">Não foi possível gerar a análise.</p>
            <p className="text-xs opacity-80 mb-3">{error}</p>
            <Button 
              onClick={generateInsight}
              variant="link" 
              className="text-white underline mt-2"
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {insight && (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h4 className="text-lg font-bold text-white mb-2 mt-0" {...props} />,
                h2: ({node, ...props}) => <h5 className="text-base font-semibold text-indigo-100 mb-2 mt-4" {...props} />,
                ul: ({node, ...props}) => <ul className="space-y-1 my-2 list-disc pl-4 text-indigo-50" {...props} />,
                li: ({node, ...props}) => <li className="text-sm" {...props} />,
                p: ({node, ...props}) => <p className="text-sm text-indigo-100 leading-relaxed my-2" {...props} />,
                strong: ({node, ...props}) => <strong className="text-yellow-200 font-semibold" {...props} />
              }}
            >
              {insight}
            </ReactMarkdown>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end gap-2">
                <Button 
                  onClick={copyToClipboard}
                  variant="ghost" 
                  size="sm"
                  className="text-indigo-300 hover:text-white hover:bg-white/10 text-xs h-auto py-1"
                >
                  <Copy className="w-3 h-3 mr-1" /> Copiar
                </Button>
                <Button 
                  onClick={generateInsight}
                  variant="ghost" 
                  size="sm"
                  className="text-indigo-300 hover:text-white hover:bg-white/10 text-xs h-auto py-1"
                >
                  Atualizar Análise
                </Button>
            </div>
          </div>
        )}

        {!insight && !loading && !error && (
          <div className="py-6 text-center">
            <p className="text-sm text-indigo-200 max-w-md mx-auto">
              Clique para gerar um relatório executivo com oportunidades de vendas, gargalos e sugestões baseadas nos dados atuais.
            </p>
          </div>
        )}
      </div>
    </AdminSurface>
  )
}
