"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, FileText, Bus, Plane, Scale, CheckSquare, XSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

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
  const [activeTab, setActiveTab] = useState('generales')

  useEffect(() => {
    fetchConditions()
  }, [])

  const fetchConditions = async () => {
    try {
      setLoading(true)
      setError(null)

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

      if (error) throw error

      const processedConditions: Condition[] = []
      const generales = data?.find((item: any) => item.id === 9)
      if (generales) {
        processedConditions.push({
          id: 9,
          tipo: 'generales',
          titulo: 'Generales',
          conteudo: generales.condicoes_cancelacao_completa || 'Condiciones generales no disponibles.'
        })
      }

      const bus = data?.find((item: any) => item.id === 3)
      if (bus) {
        const busContent = [
          `✅ 1) CONDICIONES DE CANCELACIÓN`,
          bus.condicoes_cancelacao_completa,
          `\n✅ 2) POLÍTICA DE EQUIPAJE`,
          bus.condicoes_equipaje_completa,
          `\n✅ 3) REQUISITOS DE DOCUMENTOS`,
          bus.condicoes_documentos_completa
        ].join('\n\n');

        processedConditions.push({
          id: 3,
          tipo: 'bus',
          titulo: 'Bús',
          conteudo: busContent || 'Condiciones de viaje en bus no disponibles.',
          transporte: 'Bus'
        })
      }

      const aereo = data?.find((item: any) => item.id === 4)
      if (aereo) {
        const aereoContent = [
          `✅ 1) CONDICIONES DE CANCELACIÓN`,
          aereo.condicoes_cancelacao_completa,
          `\n✅ 2) POLÍTICA DE EQUIPAJE`,
          aereo.condicoes_equipaje_completa,
          `\n✅ 3) REQUISITOS DE DOCUMENTOS`,
          aereo.condicoes_documentos_completa
        ].join('\n\n');

        processedConditions.push({
          id: 4,
          tipo: 'aereo',
          titulo: 'Aéreo',
          conteudo: aereoContent || 'Condiciones de viaje aéreo no disponibles.',
          transporte: 'Aéreo'
        })
      }
      
      setConditions(processedConditions)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const processBold = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  const formatContent = (content: string) => {
    if (!content) return <p>Contenido no disponible.</p>;
    
    return content.split('\n').map((line, index) => {
      // Title with Green Check (e.g., "✅ 1) NUESTROS PRECIOS INCLUYEN:")
      if (line.match(/^✅\s*\d+\)/)) {
        const text = line.replace(/^✅\s*\d+\)\s*/, '');
        return (
          <div key={index} className="flex items-start gap-3 mb-4">
            <CheckSquare className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <h3 className="text-base font-bold text-gray-800" dangerouslySetInnerHTML={{ __html: processBold(text) }} />
          </div>
        );
      }

      // Title with Red Cross (e.g., "❌ 2) NUESTROS PRECIOS NO INCLUYEN:")
      if (line.match(/^❌\s*\d+\)/)) {
        const text = line.replace(/^❌\s*\d+\)\s*/, '');
        return (
          <div key={index} className="flex items-start gap-3 mb-4 mt-6">
            <XSquare className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
            <h3 className="text-base font-bold text-gray-800" dangerouslySetInnerHTML={{ __html: processBold(text) }} />
          </div>
        );
      }

      // List item (e.g., "* Servicios detallados...")
      if (line.trim().startsWith('*')) {
        const text = line.trim().substring(1).trim();
        return (
          <div key={index} className="flex items-start gap-2 pl-8 mb-2">
            <span className="text-gray-600 mt-1 text-sm">•</span>
            <p className="text-gray-600 text-sm" dangerouslySetInnerHTML={{ __html: processBold(text) }} />
          </div>
        );
      }

      // Regular paragraph
      if (line.trim()) {
        return (
          <p key={index} className="text-gray-600 mb-3 text-sm" dangerouslySetInnerHTML={{ __html: processBold(line) }} />
        );
      }
      
      return null;
    });
  }

  const getTabIcon = (tipo: string) => {
    switch (tipo) {
      case 'generales': return <Scale className="w-4 h-4" />
      case 'bus': return <Bus className="w-4 h-4" />
      case 'aereo': return <Plane className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const activeCondition = conditions.find(c => c.tipo === activeTab);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 lg:px-[70px]">
          <section className="relative w-full h-48 md:h-64 lg:h-80 rounded-2xl overflow-hidden">
            <Image 
              src="/images/condiciones.jpg"
              alt="Mostrador de check-in de viagens"
              fill
              className="object-cover"
              priority
            />
          </section>
        </div>

        <div className="container mx-auto px-4 lg:px-[70px] max-w-4xl py-12 lg:py-16">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-full mb-4">
              Condiciones
            </span>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Condiciones de Servicio
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitás saber antes de viajar con Nice Trip.
            </p>
          </div>

          {loading ? (
            <div className="space-y-6">
              <div className="h-12 w-80 mx-auto bg-gray-200 rounded-2xl animate-pulse" />
              <div className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
            </div>
          ) : error ? (
            <div className="text-center py-12 border rounded-2xl bg-gray-50">
              <p className="text-red-600 mb-4">Error al cargar las condiciones</p>
              <Button 
                onClick={fetchConditions}
                className="bg-[#EE7215] hover:bg-[#EE7215]/90"
              >
                Intentar Nuevamente
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex justify-center mb-10">
                <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl">
                  {conditions.map((condition) => (
                    <button
                      key={condition.tipo}
                      onClick={() => setActiveTab(condition.tipo)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        activeTab === condition.tipo
                          ? 'bg-white text-orange-600 shadow-sm border border-gray-200'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {getTabIcon(condition.tipo)}
                      <span>{condition.titulo}</span>
                    </button>
                  ))}
                </div>
              </div>

              {activeCondition && (
                <div className="animate-fade-in bg-gray-50 border border-gray-200 rounded-2xl p-6 lg:p-8">
                  <h2 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-wider">
                    {activeCondition.titulo === 'Generales' ? 'Condiciones Generales' : `Condiciones para ${activeCondition.titulo}`}
                  </h2>
                  <div className="space-y-4">
                    {formatContent(activeCondition.conteudo)}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-16 text-center">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 hover:border-[#EE7215] hover:text-[#EE7215] transition-all duration-300 rounded-xl"
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