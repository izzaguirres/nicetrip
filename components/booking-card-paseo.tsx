"use client"

import { useMemo } from "react"
import { MessageCircle, Calendar, Users, Clock, MapPin } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Paseo } from "@/lib/passeios-service"
import { formatPrice } from "@/lib/utils"

interface BookingCardPaseoProps {
  paseo: Paseo
  filters: {
    mes: string | null
    adultos: number
    criancas_0_3: number
    criancas_4_5: number
    criancas_6_plus: number
  }
  onBook: () => void
  formatarMesExibicao: (mes: string | null) => string
}

export function BookingCardPaseo({ paseo, filters, onBook, formatarMesExibicao }: BookingCardPaseoProps) {
  
  const currencyPasseio = 'USD'

  const formatCurrencyNumber = (value: number): string => {
    const safe = Number.isFinite(value) ? value : 0
    return safe.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }

  const formatPriceWithCurrency = (value: number): string =>
    `${currencyPasseio} ${formatCurrencyNumber(Math.max(0, value))}`

  const participantesBreakdown = useMemo(() => {
    const items = []
    const addParticipant = (label: string, quantidade: number, unit?: number | null) => {
      if (!quantidade || quantidade <= 0) return
      const normalizedUnit = Number.isFinite(Number(unit)) ? Number(unit) : 0
      items.push({
        label,
        quantidade,
        unit: normalizedUnit,
        total: quantidade * normalizedUnit,
      })
    }

    addParticipant('Adultos', filters.adultos, paseo.preco_adulto)
    addParticipant('Niños (0-3)', filters.criancas_0_3, paseo.preco_crianca_0_3)
    addParticipant('Niños (4-5)', filters.criancas_4_5, paseo.preco_crianca_4_5)
    addParticipant('Niños 6+', filters.criancas_6_plus, paseo.preco_crianca_6_10)

    return items
  }, [paseo, filters])

  const totalPasseio = useMemo(
    () => participantesBreakdown.reduce((sum, item) => sum + (item.total ?? 0), 0),
    [participantesBreakdown]
  )

  const isSobConsulta = paseo.sob_consulta
  const valorTotalDisplay = isSobConsulta ? 'A consultar' : (totalPasseio > 0 ? formatPriceWithCurrency(totalPasseio) : 'A consultar')

  return (
    <div className="sticky top-32 bg-white border border-gray-100 rounded-[2rem] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      
      {/* Header de Preço */}
      <div className="mb-8">
        <div className="flex flex-col items-start">
          <div className="flex items-baseline gap-2 w-full justify-between">
             <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight font-manrope">
               {valorTotalDisplay}
             </h3>
             {!isSobConsulta && <span className="text-sm text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-lg">Total Final</span>}
          </div>
          {!isSobConsulta && (
             <p className="text-xs text-gray-400 mt-1 font-medium">
                Precio por {participantesBreakdown.reduce((acc, item) => acc + item.quantidade, 0)} personas
             </p>
          )}
        </div>
      </div>
      
      <Separator className="bg-gray-100 my-6" />

      {/* Resumo do Passeio */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
           <span className="text-sm font-bold text-slate-900">Resumen</span>
           <div className="flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
              <MapPin className="w-3 h-3" strokeWidth={2} />
              Paseo
           </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
           <div className="bg-slate-100 rounded-2xl p-3 border border-slate-200 hover:bg-slate-200/50 transition-colors flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                   Fecha Seleccionada
                </p>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                   <Calendar className="w-4 h-4 text-orange-500" />
                   {formatarMesExibicao(filters.mes)}
                </p>
              </div>
           </div>
        </div>
        
        {paseo.horario_saida && (
            <div className="bg-slate-100 rounded-2xl p-3 border border-slate-200 hover:bg-slate-200/50 transition-colors flex items-center justify-between">
                <div className="flex flex-col">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Horario de Salida
                    </p>
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    {paseo.horario_saida}
                    </p>
                </div>
            </div>
        )}
      </div>

      {/* Detalhes Financeiros */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
           Participantes
        </h4>
        
        <div className="space-y-3 text-sm">
          {participantesBreakdown.map((item, idx) => (
            <div key={idx} className="group flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
              <span className="text-slate-600 font-medium flex items-center gap-2">
                 <Users className="w-3.5 h-3.5 text-slate-400" /> 
                 {item.quantidade} {item.label}
              </span>
              {!isSobConsulta && (
                 <div className="text-right">
                    <span className="font-bold text-slate-900">{formatPriceWithCurrency(item.total || 0)}</span>
                    {item.quantidade > 1 && (
                       <p className="text-[10px] text-slate-400">({formatPriceWithCurrency(item.unit || 0)} c/u)</p>
                    )}
                 </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Book Button */}
      <a
        onClick={(e) => {
          e.preventDefault()
          onBook()
        }}
        href="#"
        className="w-full mt-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-lg py-4 px-6 rounded-full shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 group"
      >
        <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
        <span>{isSobConsulta ? 'Consultar Precios' : 'Consultar Disponibilidad'}</span>
      </a>
      
      <p className="text-center text-[11px] text-gray-400 mt-3 font-medium">
        No se cobrará nada al hacer clic
      </p>
    </div>
  )
}
