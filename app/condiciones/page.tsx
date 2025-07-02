"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, FileText, Bus, Plane, Scale } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface Condition {
  id: number
  tipo: string
  titulo: string
  conteudo: string
  transporte?: string
}

export default function CondicionesPage() {
  const router = useRouter()
  const [conditions, setConditions] = useState<Condition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchConditions()
  }, [])

  const fetchConditions = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 CONDICIONES: Buscando condições no Supabase...')

      // Buscar condições gerais (ID 9) e transporte específico (IDs 3 e 4)
      const { data, error } = await supabase
        .from('package_content_templates')
        .select(`
          id,
          transporte,
          titulo,
          condicoes_cancelacao_completa,
          condicoes_equipaje_completa,
          condicoes_documentos_completa
        `)
        .in('id', [3, 4, 9])
        .eq('ativo', true)

      if (error) {
        console.error('❌ CONDICIONES: Erro do Supabase:', error)
        throw error
      }

      console.log('📊 CONDICIONES: Dados recebidos:', data)

      // Processar dados para o formato esperado - ordem: Generales, Bus, Aéreo
      const processedConditions: Condition[] = []

      // 1. Condições Gerais (ID 9) - PRIMEIRA
      const condicionesGenerales = data?.find((item: any) => item.id === 9)
      if (condicionesGenerales) {
        processedConditions.push({
          id: 9,
          tipo: 'generales',
          titulo: 'Generales',
          conteudo: condicionesGenerales.condicoes_cancelacao_completa || 'Condiciones generales en desarrollo.'
        })
      }

      // 2. Condições Bus (ID 3) - SEGUNDA
      const condicionesBus = data?.find((item: any) => item.id === 3)
      if (condicionesBus) {
        processedConditions.push({
          id: 3,
          tipo: 'bus',
          titulo: 'Bús',
          conteudo: condicionesBus.condicoes_cancelacao_completa || 'Condiciones de viaje en bus.',
          transporte: 'Bus'
        })
      }

      // 3. Condições Aéreo (ID 4) - TERCEIRA
      const condicionesAereo = data?.find((item: any) => item.id === 4)
      if (condicionesAereo) {
        processedConditions.push({
          id: 4,
          tipo: 'aereo',
          titulo: 'Aéreo',
          conteudo: condicionesAereo.condicoes_cancelacao_completa || 'Condiciones de viaje aéreo.',
          transporte: 'Aéreo'
        })
      }

      console.log('✅ CONDICIONES: Condições processadas:', processedConditions)
      setConditions(processedConditions)

    } catch (err) {
      console.error('❌ CONDICIONES: Erro ao buscar condições:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      
      // Fallback data
      setConditions([
        {
          id: 9,
          tipo: 'generales',
          titulo: 'Generales',
          conteudo: 'Condiciones generales de contratación y uso de servicios...'
        },
        {
          id: 3,
          tipo: 'bus',
          titulo: 'Bús',
          conteudo: 'Condiciones específicas para viajes en bus...'
        },
        {
          id: 4,
          tipo: 'aereo',
          titulo: 'Aéreo',
          conteudo: 'Condiciones específicas para viajes aéreos...'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      // Processar texto em negrito
      const processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      
      return (
        <p 
          key={index} 
          className="mb-3 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      )
    })
  }

  const getTabIcon = (tipo: string) => {
    switch (tipo) {
      case 'generales': return <Scale className="w-4 h-4" />
      case 'bus': return <Bus className="w-4 h-4" />
      case 'aereo': return <Plane className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 lg:px-[70px] max-w-6xl">
          {/* Breadcrumb */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <button 
                onClick={() => router.push('/')}
                className="hover:text-[#EE7215] transition-colors"
              >
                Inicio
              </button>
              <span>/</span>
              <span className="text-gray-900 font-medium">Condiciones</span>
            </nav>
          </div>

          {/* Header da Página */}
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Condiciones de Servicio
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Consulta nuestras condiciones generales y específicas por tipo de viaje
            </p>
          </div>

          {/* Conteúdo */}
          {loading ? (
            <div className="space-y-6">
              <div className="h-12 bg-gray-200 rounded-2xl animate-pulse" />
              <div className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
            </div>
          ) : error ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-red-600 mb-4">Error al cargar las condiciones</p>
                <Button 
                  onClick={fetchConditions}
                  className="bg-[#EE7215] hover:bg-[#EE7215]/90"
                >
                  Intentar Nuevamente
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#EE7215] to-[#F7931E] text-white p-6">
                <CardTitle className="flex items-center gap-3">
                  <FileText className="w-6 h-6" />
                  Términos y Condiciones
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-0">
                <Tabs defaultValue="generales" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 rounded-none border-b bg-white h-16">
                    {conditions.map((condition) => (
                      <TabsTrigger
                        key={condition.tipo}
                        value={condition.tipo}
                        className="flex items-center gap-2 data-[state=active]:bg-[#EE7215]/5 data-[state=active]:text-[#EE7215] data-[state=active]:border-b-2 data-[state=active]:border-[#EE7215] h-14 rounded-none"
                      >
                        {getTabIcon(condition.tipo)}
                        <span className="hidden sm:inline">{condition.titulo}</span>
                        <span className="sm:hidden">
                          {condition.tipo === 'generales' ? 'General' : 
                           condition.tipo === 'bus' ? 'Bús' : 'Aéreo'}
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {conditions.map((condition) => (
                    <TabsContent 
                      key={condition.tipo} 
                      value={condition.tipo}
                      className="p-8 lg:p-12 min-h-[400px]"
                    >
                      <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-8">
                          {getTabIcon(condition.tipo)}
                          <h2 className="text-2xl font-bold text-gray-900">
                            {condition.titulo}
                          </h2>
                        </div>
                        
                        <div className="prose prose-lg max-w-none text-gray-700">
                          {formatContent(condition.conteudo)}
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Botão Voltar */}
          <div className="mt-12 text-center">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 hover:border-[#EE7215] hover:text-[#EE7215] transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 