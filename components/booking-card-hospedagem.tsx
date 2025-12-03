"use client"

import { Bed, MessageCircle, Sparkles, Calendar, Check, Info, ChevronRight } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface BookingCardHospedagemProps {
  basePrice: number
  destino: string
  dataViagem: Date
  diasNoites: { dias: number, noites: number }
  checkin?: string | null
  checkout?: string | null
  quartosIndividuais: any[]
  valorDiaria: number
  precoTotalReal: number
  formatPriceWithCurrency: (val: number) => string
  onBook: () => void
  itemTitle?: string
  determinarTipoQuarto: (quarto: any) => string
}

export function BookingCardHospedagem({
  basePrice,
  destino,
  dataViagem,
  diasNoites,
  checkin,
  checkout,
  quartosIndividuais,
  valorDiaria,
  precoTotalReal,
  formatPriceWithCurrency,
  onBook,
  itemTitle,
  determinarTipoQuarto
}: BookingCardHospedagemProps) {
  
  const totalCriancasGratis = quartosIndividuais.reduce((acc, q) => acc + (q.criancas_0_3 || 0) + (q.criancas_4_5 || 0), 0)

  return (
    <div className="sticky top-32 bg-white border border-gray-100 rounded-[2rem] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      
      {/* Header de Preço */}
      <div className="mb-8">
        <div className="flex flex-col items-start">
          <div className="flex items-baseline gap-2 w-full justify-between">
             <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight font-manrope">
               {formatPriceWithCurrency(precoTotalReal)}
             </h3>
             <span className="text-sm text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-lg">Total Final</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 font-medium">
             Incluye todos los impuestos y tasas
          </p>
        </div>
      </div>
      
      <Separator className="bg-gray-100 my-6" />

      {/* Resumo da Viagem */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
           <span className="text-sm font-bold text-slate-900">Tu Estancia</span>
           <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              <Bed className="w-3 h-3" strokeWidth={2} />
              Hospedaje
           </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
           <div className="bg-slate-100 rounded-2xl p-3 border border-slate-200 hover:bg-slate-200/50 transition-colors">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                 Check-in
              </p>
              <p className="text-sm font-bold text-slate-900">
                 {checkin ? new Date(checkin + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
              </p>
           </div>
           <div className="bg-slate-100 rounded-2xl p-3 border border-slate-200 hover:bg-slate-200/50 transition-colors">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                 Check-out
              </p>
              <p className="text-sm font-bold text-slate-900">
                 {checkout ? new Date(checkout + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
              </p>
           </div>
        </div>

        <div className="bg-slate-100 rounded-2xl p-3 border border-slate-200 flex items-center justify-between text-xs text-slate-700 font-bold hover:bg-slate-200/50 transition-colors">
            <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{diasNoites.noites} Noches</span>
            </div>
            <div className="h-4 w-px bg-slate-300"></div>
            <span>{destino}</span>
        </div>
      </div>

      {/* Detalhes Financeiros (Hospedagem) */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
           Desglose por cuarto
        </h4>
        
        <div className="space-y-3 text-sm">
          {quartosIndividuais.map((quarto: any, idx: number) => {
              const tipoQuarto = determinarTipoQuarto(quarto);
              
              return (
                <div key={idx} className="group">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600 font-medium flex items-center gap-2">
                       <Bed className="w-3.5 h-3.5 text-orange-500" /> 
                       Cuarto {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900">{formatPriceWithCurrency(valorDiaria)}</span>
                  </div>
                  
                  {/* Detalhes Ocupação */}
                  <div className="pl-5 text-xs text-slate-500 space-y-1 mt-1 border-l-2 border-slate-100 ml-1.5">
                     <div className="flex justify-between">
                        <span>Tipo: {tipoQuarto}</span>
                     </div>
                     
                     {quarto.adultos > 0 && (
                        <div>{quarto.adultos} Adulto{quarto.adultos > 1 ? 's' : ''}</div>
                     )}
                     
                     {quarto.criancas_6 > 0 && <div>{quarto.criancas_6} Niño{quarto.criancas_6 > 1 ? 's' : ''} (6+ años)</div>}
                     {quarto.criancas_4_5 > 0 && <div>{quarto.criancas_4_5} Niño{quarto.criancas_4_5 > 1 ? 's' : ''} (4-5 años)</div>}
                     {quarto.criancas_0_3 > 0 && <div>{quarto.criancas_0_3} Niño{quarto.criancas_0_3 > 1 ? 's' : ''} (0-3 años)</div>}
                  </div>
                </div>
              )
          })}
          
          {/* Regra de Criança Grátis */}
          {totalCriancasGratis > 0 && (
             <div className="mt-4 bg-green-50 border border-green-100 p-3 rounded-xl flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-green-700 leading-snug font-medium">
                   Beneficio aplicado: 1 niño de 0 a 5 años gratis cada 2 adultos pagantes.
                </p>
             </div>
          )}
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
        <span>Consultar Disponibilidad</span>
      </a>
      
      <p className="text-center text-[11px] text-gray-400 mt-3 font-medium">
        No se cobrará nada al hacer clic
      </p>
    </div>
  )
}