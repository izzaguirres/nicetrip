"use client"

import { Bed, ChevronRight, MessageCircle, Sparkles, Plane, Bus, Info, Check } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { logWhatsappConversion } from "@/lib/whatsapp"

interface BookingCardProps {
  searchType: string
  basePrice: number
  transporte: string
  saida: string
  destino: string
  dataViagem: Date
  diasNoites: { dias: number, noites: number }
  checkin?: string | null
  checkout?: string | null
  quartosIndividuais: any[]
  roomsBreakdown: any[] | null
  quartosDetalhados?: any[]
  dadosPacote: { preco_adulto: number }
  taxesAereo: number
  taxesPeopleCount: number
  taxesAdultsCount: number
  taxesKids2a5Count: number
  pricingSummary: any
  precoOriginalFromUrl: number | null
  preco: number
  addonsPrice: number
  selectedAddonsDetails?: { name: string; price: number }[]
  appliedDiscountRules: any[]
  installments: number
  installmentValue: number
  formatPriceWithCurrency: (val: number) => string
  onBook: () => void
  itemTitle?: string
}

export function BookingCard({
  searchType,
  basePrice,
  transporte,
  saida,
  destino,
  dataViagem,
  diasNoites,
  checkin,
  checkout,
  quartosIndividuais,
  roomsBreakdown,
  quartosDetalhados,
  dadosPacote,
  taxesAereo,
  taxesPeopleCount,
  taxesAdultsCount,
  taxesKids2a5Count,
  pricingSummary,
  precoOriginalFromUrl,
  preco,
  addonsPrice,
  selectedAddonsDetails,
  appliedDiscountRules,
  installments,
  installmentValue,
  formatPriceWithCurrency,
  onBook,
  itemTitle
}: BookingCardProps) {
  
  const packageBaseOriginal = pricingSummary?.originalUSD ?? precoOriginalFromUrl ?? basePrice
  const packageBaseFinal = pricingSummary?.totalUSD ?? (preco > 0 ? preco : basePrice)
  const packageDiscountUSD = Math.max(0, packageBaseOriginal - packageBaseFinal)
  const hasPackageDiscount = packageDiscountUSD > 0
  
  const precoTotalOriginal = packageBaseOriginal + addonsPrice + taxesAereo
  const precoTotalReal = packageBaseFinal + addonsPrice + taxesAereo

  return (
    <div className="sticky top-32 bg-white border border-gray-100 rounded-[2rem] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      
      {/* Header de Preço */}
      <div className="mb-8">
        <div className="flex flex-col items-start">
          {hasPackageDiscount && (
             <span className="text-sm text-gray-400 line-through font-medium mb-1">
                {formatPriceWithCurrency(precoTotalOriginal)}
             </span>
          )}
          <div className="flex items-baseline gap-2 w-full justify-between">
             <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight font-manrope">
               {formatPriceWithCurrency(precoTotalReal)}
             </h3>
             <span className="text-sm text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-lg">Total Final</span>
          </div>
          {installments > 1 && searchType === 'paquetes' && (
             <p className="text-sm font-semibold text-green-600 mt-2 flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                hasta {installments}x de {formatPriceWithCurrency(installmentValue)}
             </p>
          )}
        </div>
      </div>
      
      <Separator className="bg-gray-100 my-6" />

      {/* Resumo da Viagem */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
           <span className="text-sm font-bold text-slate-900">Tu Viaje</span>
           {searchType === 'paquetes' && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                 {transporte === 'Aéreo' ? <Plane className="w-3 h-3" strokeWidth={2} /> : <Bus className="w-3 h-3" strokeWidth={2} />}
                 {transporte}
              </div>
           )}
        </div>

        <div className="grid grid-cols-2 gap-3">
           <div className="bg-slate-100 rounded-2xl p-3 border border-slate-200 hover:bg-slate-200/50 transition-colors">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                 {searchType === 'paquetes' ? 'Ida' : 'Check-in'}
              </p>
              <p className="text-sm font-bold text-slate-900">
                 {searchType === 'paquetes' 
                    ? dataViagem.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' }) 
                    : (checkin ? new Date(checkin + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '-')}
              </p>
           </div>
           <div className="bg-slate-100 rounded-2xl p-3 border border-slate-200 hover:bg-slate-200/50 transition-colors">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                 {searchType === 'paquetes' ? 'Vuelta' : 'Check-out'}
              </p>
              <p className="text-sm font-bold text-slate-900">
                 {searchType === 'paquetes'
                    ? new Date(new Date(dataViagem).setDate(dataViagem.getUTCDate() + diasNoites.dias)).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' })
                    : (checkout ? new Date(checkout + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '-')}
              </p>
           </div>
        </div>

        {searchType === 'paquetes' && (
           <div className="bg-slate-100 rounded-2xl p-3 border border-slate-200 flex items-center justify-between text-xs text-slate-700 font-bold hover:bg-slate-200/50 transition-colors">
              <span>{saida}</span>
              <div className="h-px flex-1 bg-slate-300 mx-3 relative">
                 <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-300 p-1 rounded-full">
                    <ChevronRight className="w-3 h-3 text-slate-500" />
                 </div>
              </div>
              <span>{destino}</span>
           </div>
        )}
      </div>

      {/* Detalhes Financeiros (Accordion Like) */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
           Detalles del precio
        </h4>
        
        <div className="space-y-3 text-sm">
          {/* Base Package Breakdown */}
          {(quartosDetalhados || quartosIndividuais).map((quarto: any, idx: number) => {
              const isDetalhado = !!quartosDetalhados
              const calcRoom = isDetalhado ? quarto : null
              const breakdown = calcRoom?.breakdown
              const totalQuarto = calcRoom?.totalBaseUSD || 0
              
              if (!isDetalhado) return null

              const unitAdult = calcRoom.unitAdult || 0
              // Correção robusta para detectar Aéreo independente de acentuação
              const transporteNorm = (transporte || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
              const isAereoTransport = transporteNorm.includes('aer') || transporteNorm.includes('avion')
              
              // Lógica de Preços (Aéreo vs Bus)
              const childPriceFaixa1 = isAereoTransport ? 160 : 50  
              const childPriceFaixa2 = isAereoTransport ? 500 : 350 
              
              // Labels (Aéreo vs Bus)
              const labelFaixa1 = isAereoTransport ? '0-2 años' : '0-3 años'
              const labelFaixa2 = isAereoTransport ? '2-5 años' : '4-5 años'

              return (
                <div key={idx} className="group">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600 font-medium flex items-center gap-2">
                       <Bed className="w-3.5 h-3.5 text-orange-500" /> 
                       Cuarto {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900">{formatPriceWithCurrency(totalQuarto)}</span>
                  </div>
                  
                  {/* Micro breakdown */}
                  <div className="pl-5 text-xs text-slate-500 space-y-1 mt-1 border-l-2 border-slate-100 ml-1.5">
                    {breakdown.adultosCobrados > 0 && (
                      <div className="flex justify-between">
                        <span>{breakdown.adultosCobrados} Adulto{breakdown.adultosCobrados > 1 ? 's' : ''}</span>
                        <span>{formatPriceWithCurrency(unitAdult)}/u</span>
                      </div>
                    )}
                    {/* Crianças Faixa 2 (4-5 ou Aéreo 3-5) */}
                    {breakdown.criancas4a5ComTarifaReduzida > 0 && (
                      <div className="flex justify-between">
                        <span>{breakdown.criancas4a5ComTarifaReduzida} Niño(s) ({labelFaixa2})</span>
                        <span>{formatPriceWithCurrency(childPriceFaixa2)}/u</span>
                      </div>
                    )}
                    {/* Crianças Faixa 1 (0-3 ou Aéreo 0-2) */}
                    {breakdown.criancas0a3ComTarifaReduzida > 0 && (
                      <div className="flex justify-between">
                        <span>{breakdown.criancas0a3ComTarifaReduzida} Niño(s) ({labelFaixa1})</span>
                        <span>{formatPriceWithCurrency(childPriceFaixa1)}/u</span>
                      </div>
                    )}
                  </div>
                </div>
              )
          })}

          {/* Impostos Aéreos */}
          {searchType === 'paquetes' && transporte === 'Aéreo' && taxesAereo > 0 && (
             <div className="pt-3 mt-3 border-t border-dashed border-slate-200">
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-1.5">
                      <span className="text-slate-600">Tasas e Impuestos</span>
                      <TooltipProvider>
                         <Tooltip>
                            <TooltipTrigger>
                               <Info className="w-3.5 h-3.5 text-slate-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                               <p>0–2 exentos. Aplicado a adultos y 2–5 años.</p>
                            </TooltipContent>
                         </Tooltip>
                      </TooltipProvider>
                   </div>
                   <span className="font-medium text-slate-900">{formatPriceWithCurrency(taxesAereo)}</span>
                </div>
             </div>
          )}

          {/* Adicionais */}
          {selectedAddonsDetails && selectedAddonsDetails.length > 0 && (
             <div className="pt-3 mt-3 border-t border-dashed border-slate-200 space-y-2">
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Adicionales</p>
                {selectedAddonsDetails.map((addon, idx) => (
                   <div key={idx} className="flex justify-between items-center">
                      <span className="text-slate-600">{addon.name}</span>
                      <span className="font-medium text-slate-900">{formatPriceWithCurrency(addon.price)}</span>
                   </div>
                ))}
             </div>
          )}
          
          {/* Regra de Criança (Hospedagem) */}
          {searchType === 'habitacion' && (
             <div className="mt-4 bg-blue-50 p-3 rounded-xl flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700 leading-snug">
                   La primera criança de 0 a 5 años es gratuita.
                </p>
             </div>
          )}
        </div>
      </div>

      {/* Total Highlight */}
      {hasPackageDiscount && (
         <div className="mt-6 bg-green-50 rounded-xl p-3 flex items-center justify-center gap-2 text-sm font-bold text-green-700 border border-green-100">
            <Sparkles className="w-4 h-4" />
            Ahorras {formatPriceWithCurrency(packageDiscountUSD)}
         </div>
      )}

      {/* Book Button */}
      <a
        onClick={(e) => {
          e.preventDefault()
          logWhatsappConversion({
             origem: 'detalhes_page',
             destino: destino,
             transporte: transporte,
             tipo: searchType,
             item: itemTitle || 'N/A'
          })
          onBook()
        }}
        href="#"
        className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg py-4 px-6 rounded-full shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 group"
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