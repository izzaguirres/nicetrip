"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { 
  ArrowLeft, 
  Bus, 
  Plane, 
  Scale, 
  ChevronRight,
  ScrollText,
  Printer
} from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { FadeIn } from "@/components/ui/fade-in"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

// --- 1. DADOS ESTÁTICOS GARANTIDOS (FALLBACK) ---
// Isso garante que o conteúdo NUNCA suma, mesmo se o banco falhar.
const STATIC_CONTENT = {
  generales: {
    title: "Términos Generales",
    content: `## Reservas y Pagos
**Opción A:** 30% del valor total para reservar, más un 20% como refuerzo (con fecha de pago a combinar) y el 50% restante 15 días antes del check-in.
**Opción B:** 50% del valor total para reservar y el restante al momento del check-in.

Las modalidades de cobro permitidas y aceptadas por la empresa son las siguientes:
* Depósitos y/o transferencias bancarias a las cuentas informadas por la empresa.
* Otros medios, como efectivo y/o transferencias internacionales, debidamente informados por la empresa bajo las condiciones específicas de cada caso.

**Importante:** Cada pago realizado deberá ser informado por el cliente a la empresa a través de los medios vigentes (WhatsApp: +55 48 9860-1754).

__SEPARATOR__

## Cancelaciones
**Parcialmente reembolsable:** Permite la cancelación con reembolso parcial. El 10% del valor total del tour es tomado en concepto de reserva y **no es reembolsable.**
En caso de enfermedad, fuerza mayor o fallecimiento de un familiar directo (siempre con justificativo), el cliente contará con un reconocimiento del importe abonado para aplicarlo en un próximo tour o servicio, así como la posibilidad de transferir su reserva.

## Gestión de cancelación y/o modificaciones
La cancelación y/o modificación puede gestionarse a través de nuestro canal de atención al cliente.`
  },
  bus: {
    title: "Paquetes en Bus",
    content: `## Política de Cancelación
Cancelación gratuita hasta 24 horas antes del viaje.

__SEPARATOR__

## Equipaje Permitido
Equipaje sin restricciones de peso en bus.

__SEPARATOR__

## Documentación Requerida
Solo documento de identidad válido requerido.`
  },
  aereo: {
    title: "Paquetes Aéreos",
    content: `## Política de Cancelación
Cancelación gratuita hasta 72 horas antes del vuelo.

__SEPARATOR__

## Equipaje Permitido
Incluye 1 maleta de hasta 23kg por persona en vuelo.

__SEPARATOR__

## Documentación Requerida
Documento de identidad válido y confirmación de vuelo.`
  }
}

export default function CondicionesPage() {
  const router = useRouter()
  // Estado simples para tabs
  const [activeTab, setActiveTab] = useState<'generales' | 'bus' | 'aereo'>('generales')
  // Estado para conteúdo, inicializado COM DADOS REAIS
  const [contentData, setContentData] = useState(STATIC_CONTENT)
  const [loading, setLoading] = useState(true)

  // --- 2. FETCH SILENCIOSO (NÃO BLOQUEIA A TELA) ---
  useEffect(() => {
    const syncWithDatabase = async () => {
      try {
        // Busca tudo que estiver ativo e ordena para ter consistência
        const { data, error } = await supabase
          .from('package_content_templates')
          .select('*')
          .eq('ativo', true)
          .order('prioridade', { ascending: true }) // Admin usa prioridade=1, então vamos garantir que pegamos os certos
          .order('id', { ascending: true }) // Desempate determinístico para garantir que Bus pegue ID 1 (igual Admin) e não ID 3

        if (error || !data) return // Se der erro, mantém o estático

        // Atualiza o estado apenas se encontrar dados válidos
        const newContent = { ...STATIC_CONTENT }
        const norm = (s: string) => (s || '').toLowerCase().trim()

        // Helper para juntar partes (usando as colunas curtas E longas)
        const buildText = (row: any) => {
          const c1 = row.condicoes_cancelacao_completa || row.condicoes_cancelacao
          const c2 = row.condicoes_equipaje_completa || row.condicoes_equipaje
          const c3 = row.condicoes_documentos_completa || row.condicoes_documentos
          
          const parts = []
          if (c1) parts.push(`## Política de Cancelación\n\n${c1}`)
          if (c2) parts.push(`## Equipaje Permitido\n\n${c2}`)
          if (c3) parts.push(`## Documentación Requerida\n\n${c3}`)
          
          return parts.length > 0 ? parts.join('\n\n__SEPARATOR__\n\n') : null
        }

        // Mapeia Generales (Prioridade para ID 9 igual ao Admin ou busca por titulo)
        const generalesRow = data.find((i: any) => i.id === 9 || norm(i.titulo).includes('generales'))
        if (generalesRow) {
          const text = generalesRow.condicoes_cancelacao_completa || generalesRow.condicoes_cancelacao
          if (text) newContent.generales = { ...newContent.generales, content: text, title: generalesRow.titulo }
        }

        // Mapeia Bus (Alinhado com Admin: busca prioridade 1 preferencialmente)
        // Filtramos primeiro os de prioridade 1 se existirem
        const busRows = data.filter((i: any) => norm(i.transporte).includes('bus') || norm(i.transporte).includes('bús'))
        const busRow = busRows.find((i: any) => i.prioridade === 1) || busRows[0]
        
        if (busRow) {
          const text = buildText(busRow)
          if (text) newContent.bus = { ...newContent.bus, content: text, title: busRow.titulo }
        }

        // Mapeia Aereo (Alinhado com Admin)
        const aereoRows = data.filter((i: any) => norm(i.transporte).includes('aer') || norm(i.transporte).includes('aér'))
        const aereoRow = aereoRows.find((i: any) => i.prioridade === 1) || aereoRows[0]

        if (aereoRow) {
          const text = buildText(aereoRow)
          if (text) newContent.aereo = { ...newContent.aereo, content: text, title: aereoRow.titulo }
        }

        setContentData(newContent)
      } catch (err) {
        console.error('Erro ao sincronizar, mantendo fallback', err)
      } finally {
        setLoading(false)
      }
    }

    syncWithDatabase()
  }, [])

  // --- 3. PROCESSADOR VISUAL ---
  const processText = (text: string) => {
    if (!text) return "";
    
    let processed = text
      .replace(/✅/g, '')
      .replace(/❌/g, '')
      .replace(/__SEPARATOR__/g, '<hr class="my-10 border-t-2 border-slate-100" />')
      // Headers H2 (Laranja)
      .replace(/## (.*?)\n/g, '<h2 class="text-2xl font-bold text-slate-900 mt-8 mb-6 flex items-center gap-2"><span class="w-2 h-8 bg-orange-500 rounded-full inline-block"></span>$1</h2>')
      // Negrito
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
    
    const lines = processed.split('\n');
    let inList = false;
    let htmlLines = [];

    for (let line of lines) {
      let trimmed = line.trim();
      if (trimmed.startsWith('<h2') || trimmed.startsWith('<hr')) {
        if (inList) { htmlLines.push('</ul>'); inList = false; }
        htmlLines.push(trimmed);
        continue;
      }
      const isListItem = trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ');
      if (isListItem) {
        if (!inList) {
          htmlLines.push('<ul class="space-y-3 mb-6 text-slate-600">');
          inList = true;
        }
        htmlLines.push(`<li class="flex items-start gap-3"><span class="mt-2 w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></span><span class="flex-1 leading-relaxed">${trimmed.substring(2)}</span></li>`);
      } else {
        if (inList) { htmlLines.push('</ul>'); inList = false; }
        if (trimmed) htmlLines.push(`<p class="mb-4 text-slate-600 leading-relaxed text-base">${trimmed}</p>`);
      }
    }
    if (inList) htmlLines.push('</ul>');
    return htmlLines.join('');
  }

  const currentData = contentData[activeTab]

  // --- 4. RENDERIZAÇÃO LIMPA ---
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 lg:px-[70px]">
          
          {/* Header */}
          <FadeIn className="mb-12 md:mb-16 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              <ScrollText className="w-3 h-3" />
              Centro de Ayuda
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              Documentación y Reglas
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed">
              Accede a la información completa y actualizada sobre las condiciones de tu viaje.
            </p>
          </FadeIn>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* Sidebar */}
            <FadeIn delay={0.2} className="lg:w-72 flex-shrink-0">
              <div className="sticky top-28 z-30">
                <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                  <button
                    onClick={() => setActiveTab('generales')}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap border",
                      activeTab === 'generales'
                        ? "bg-white border-slate-200 text-orange-600 shadow-md scale-[1.02] lg:translate-x-2"
                        : "bg-transparent border-transparent text-slate-500 hover:bg-white/50 hover:text-slate-900"
                    )}
                  >
                    <Scale className={cn("w-4 h-4", activeTab === 'generales' ? "text-orange-500" : "text-slate-400")} />
                    Generales
                    {activeTab === 'generales' && <ChevronRight className="w-4 h-4 ml-auto text-orange-400 hidden lg:block" />}
                  </button>

                  <button
                    onClick={() => setActiveTab('bus')}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap border",
                      activeTab === 'bus'
                        ? "bg-white border-slate-200 text-orange-600 shadow-md scale-[1.02] lg:translate-x-2"
                        : "bg-transparent border-transparent text-slate-500 hover:bg-white/50 hover:text-slate-900"
                    )}
                  >
                    <Bus className={cn("w-4 h-4", activeTab === 'bus' ? "text-orange-500" : "text-slate-400")} />
                    Viajes en Bus
                    {activeTab === 'bus' && <ChevronRight className="w-4 h-4 ml-auto text-orange-400 hidden lg:block" />}
                  </button>

                  <button
                    onClick={() => setActiveTab('aereo')}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap border",
                      activeTab === 'aereo'
                        ? "bg-white border-slate-200 text-orange-600 shadow-md scale-[1.02] lg:translate-x-2"
                        : "bg-transparent border-transparent text-slate-500 hover:bg-white/50 hover:text-slate-900"
                    )}
                  >
                    <Plane className={cn("w-4 h-4", activeTab === 'aereo' ? "text-orange-500" : "text-slate-400")} />
                    Viajes Aéreos
                    {activeTab === 'aereo' && <ChevronRight className="w-4 h-4 ml-auto text-orange-400 hidden lg:block" />}
                  </button>
                </nav>

                <div className="hidden lg:block mt-8">
                  <div className="p-6 bg-[#111] rounded-2xl text-white shadow-xl">
                    <h4 className="font-bold mb-2 text-lg">¿Necesitas ayuda?</h4>
                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">Nuestro equipo está listo para aclarar cualquier punto.</p>
                    <Button 
                      variant="outline" 
                      className="w-full border-white/20 hover:bg-white hover:text-black bg-transparent text-white h-10 text-xs font-bold tracking-wide"
                      onClick={() => window.open("https://wa.me/5548998601754", "_blank")}
                    >
                      Contactar Soporte
                    </Button>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Área de Conteúdo (Unified Document Style) */}
            <div className="flex-1 min-w-0">
              <motion.div 
                key={activeTab} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="min-h-[500px]"
              >
                <div className="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-12 shadow-sm relative overflow-hidden">
                  
                  {/* Document Header */}
                  <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-8">
                    <div>
                      <span className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2 block">Documento Oficial</span>
                      <h2 className="text-3xl font-bold text-slate-900">{currentData.title}</h2>
                    </div>
                    <Button variant="outline" size="icon" className="hidden md:flex rounded-full border-slate-200 text-slate-400 hover:text-orange-600" title="Imprimir" onClick={() => window.print()}>
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Document Body */}
                  <article className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-orange-600">
                    <div dangerouslySetInnerHTML={{ __html: processText(currentData.content) }} />
                  </article>

                  {/* Document Footer */}
                  <div className="mt-16 pt-8 border-t border-slate-100 flex items-center gap-4 opacity-60">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <Scale className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="text-xs text-slate-400">
                      <p className="font-bold text-slate-600">Nice Trip Turismo</p>
                      <p>Este documento es válido para todas las reservas actuales.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs text-slate-400">Última actualización: Octubre 2025</span>
                <Button
                  onClick={() => router.back()}
                  variant="ghost"
                  className="text-slate-500 hover:text-orange-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}