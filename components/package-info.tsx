"use client"

import { useState, useEffect, useMemo } from "react"
import { Star, Sun, Moon, Check, Plane, Calendar, Clock, ArrowRight, Wifi, AirVent, Tv, Refrigerator, Waves, Utensils, Shield, Sparkles, Clock as ClockIcon, Car, ChefHat, Bath, Flame, Gamepad2, Coffee, Circle, MapPin, Bus } from "lucide-react"
import { formatHora } from "@/lib/voos-service"
import { generateSmartReviews } from "@/lib/reviews-data"
import dynamic from 'next/dynamic'

const MapDisplay = dynamic(() => import('@/components/ui/map-display'), {
  ssr: false,
  loading: () => <div className="bg-gray-200 animate-pulse w-full h-full rounded-xl"></div>
});

interface PackageInfoProps {
  packageData: any
  diasNoites: { dias: number, noites: number }
  hospedagemData: any
  packageDescription: any
  packageConditions: any
  transporte: string
  saida: string
  voosInfo: any
  addons: any[]
  selectedAddons: string[]
  onAddonToggle: (id: string) => void
}

export function PackageInfo({
  packageData,
  diasNoites,
  hospedagemData,
  packageDescription,
  packageConditions,
  transporte,
  saida,
  voosInfo,
  addons,
  selectedAddons,
  onAddonToggle
}: PackageInfoProps) {
  const [activeTab, setActiveTab] = useState("descripcion")
  const [showConditionsModal, setShowConditionsModal] = useState(false)
  const [selectedConditionType, setSelectedConditionType] = useState<'cancelacion' | 'equipaje' | 'documentos' | null>(null)

  // Gerar reviews inteligentes baseados no nome do hotel
  const reviewsData = useMemo(() => generateSmartReviews(packageData.name || "Hotel"), [packageData.name])

  const getIconComponent = (icone: string) => {
    const key = (icone || '').toLowerCase().trim()
    const iconMap: { [key: string]: any } = {
      'wifi': Wifi, 'aire': AirVent, 'tv': Tv, 'fridge': Refrigerator, 'pool': Waves,
      'restaurant': Utensils, 'safe': Shield, 'cleaning': Sparkles, 'reception': ClockIcon,
      'parking': Car, 'kitchen': ChefHat, 'hot_tub': Bath, 'bbq': Flame, 'gamepad': Gamepad2, 'coffee': Coffee
    }
    return iconMap[key] || Circle
  }

  const processMarkdownFormatting = (text: string): string => text ? text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br />') : ''
  
  const openConditionsModal = (type: 'cancelacion' | 'equipaje' | 'documentos') => { setSelectedConditionType(type); setShowConditionsModal(true); document.body.style.overflow = 'hidden' }
  const closeConditionsModal = () => { setShowConditionsModal(false); setSelectedConditionType(null); document.body.style.overflow = 'unset' }

  // Fechar modal com ESC
  useEffect(() => {
    const handleConditionsEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showConditionsModal) {
        closeConditionsModal()
      }
    }
    if (showConditionsModal) {
      document.addEventListener('keydown', handleConditionsEsc)
      return () => document.removeEventListener('keydown', handleConditionsEsc)
    }
  }, [showConditionsModal])

  return (
    <div className="space-y-10">
      
      {/* 1. Header Premium */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-3">
             <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-[10px] font-bold uppercase tracking-wider border border-orange-100">
                {transporte || 'Paquete'}
             </span>
             {reviewsData.averageRating > 4.5 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                   <Star className="w-3 h-3 fill-slate-600" /> Guest Favorite
                </span>
             )}
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            {packageData.name}
          </h1>
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
             <MapPin className="w-4 h-4" />
             <span className="underline decoration-slate-300 underline-offset-4 cursor-pointer hover:text-orange-600 transition-colors">{packageData.location}</span>
          </div>
        </div>

        <div className="flex items-center gap-6 pt-2 border-t border-slate-100 mt-2">
           <div className="flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-orange-500 text-orange-500" />
              <span className="text-lg font-bold text-slate-900">{reviewsData.averageRating}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full mx-1"></span>
              <span className="text-sm text-slate-600 underline decoration-slate-200 underline-offset-4 cursor-pointer hover:text-slate-900">{reviewsData.totalCount} evaluaciones</span>
           </div>
           <div className="h-8 w-px bg-slate-200"></div>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="p-2 bg-slate-50 rounded-full"><Sun className="w-4 h-4 text-slate-700" /></div>
                 <span className="text-sm font-medium text-slate-700">{diasNoites.dias} días</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="p-2 bg-slate-50 rounded-full"><Moon className="w-4 h-4 text-slate-700" /></div>
                 <span className="text-sm font-medium text-slate-700">{diasNoites.noites} noches</span>
              </div>
           </div>
        </div>
      </div>

      {/* 2. Comodidades - Grid Moderno */}
      {hospedagemData?.comodidades && hospedagemData.comodidades.length > 0 && (
        <div className="py-6 border-t border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Lo que ofrece este lugar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packageData.amenities.map((amenity: any, index: number) => {
              const IconComponent = getIconComponent(amenity.icon);
              return (
                <div key={index} className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <IconComponent className="w-6 h-6 text-slate-600" strokeWidth={1.5} />
                  <span className="text-slate-700 text-base">{amenity.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 3. Abas Clean (Underline) */}
      <div className="space-y-6">
        <div className="border-b border-slate-200">
          <div className="flex gap-8 overflow-x-auto scrollbar-hide">
            <button 
               onClick={() => setActiveTab("descripcion")}
               className={`pb-4 text-sm font-bold tracking-wide transition-all duration-300 border-b-2 whitespace-nowrap ${activeTab === "descripcion" ? "border-orange-600 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"}`}
            >
               Sobre el paquete
            </button>
            <button 
               onClick={() => setActiveTab("condiciones")}
               className={`pb-4 text-sm font-bold tracking-wide transition-all duration-300 border-b-2 whitespace-nowrap ${activeTab === "condiciones" ? "border-orange-600 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"}`}
            >
               Condiciones
            </button>
            <button 
               onClick={() => setActiveTab("avaliaciones")}
               className={`pb-4 text-sm font-bold tracking-wide transition-all duration-300 border-b-2 whitespace-nowrap ${activeTab === "avaliaciones" ? "border-orange-600 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"}`}
            >
               Opiniones
            </button>
          </div>
        </div>

        <div className="min-h-[120px] animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeTab === "descripcion" && (
            <div className="space-y-6">
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                {packageDescription?.descripcion 
                  ? (<div dangerouslySetInnerHTML={{ __html: processMarkdownFormatting(packageDescription.descripcion) }} />) 
                  : (<p>{`¡Vive la experiencia completa en ${packageData.name}! Nuestro paquete te ofrece días de aventura, incluyendo hospedaje. Transporte cómodo, desayunos incluidos y tiempo suficiente para explorar cada rincón de esta paradisíaca playa.`}</p>)
                }
              </div>
              
              {/* Highlights Integrados na Descrição */}
              <div className="bg-slate-50 rounded-2xl p-6 mt-6">
                 <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-500" /> Destacados del paquete
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(packageData.highlights || []).map((highlight: string, index: number) => (
                       <div key={index} className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                             <Check className="w-3 h-3 text-green-600" strokeWidth={3} />
                          </div>
                          <span className="text-sm text-slate-700 font-medium">{highlight}</span>
                       </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {activeTab === "condiciones" && (
            <div className="space-y-6">
              {packageConditions ? (
                <div className="grid gap-6">
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                     <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-orange-500" /> Cancelación
                     </h4>
                     <p className="text-slate-600 text-sm leading-relaxed">{packageConditions.cancelacion}</p>
                  </div>
                  
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                     <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                        <span className="text-lg">🧳</span> Equipaje
                     </h4>
                     <p className="text-slate-600 text-sm leading-relaxed">{packageConditions.equipaje}</p>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                     <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                        <span className="text-lg">📄</span> Requisitos
                     </h4>
                     <ul className="space-y-2">
                        <li className="flex gap-2 text-sm text-slate-600">
                           <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1.5 flex-shrink-0"></span>
                           <span>{packageConditions.documentos}</span>
                        </li>
                        <li className="flex gap-2 text-sm text-slate-600">
                           <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1.5 flex-shrink-0"></span>
                           <span>Vacunas al día (consultar requisitos actuales)</span>
                        </li>
                        <li className="flex gap-2 text-sm text-slate-600">
                           <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1.5 flex-shrink-0"></span>
                           <span>Seguro de viaje incluido</span>
                        </li>
                     </ul>
                     
                     {(packageConditions.documentos_completa || packageConditions.equipaje_completa || packageConditions.cancelacion_completa) && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                           <button onClick={() => openConditionsModal('documentos')} className="text-orange-600 hover:text-orange-700 text-sm font-bold flex items-center gap-1">
                              Ver condiciones completas <ArrowRight className="w-3 h-3" />
                           </button>
                        </div>
                     )}
                  </div>
                </div>
              ) : packageConditions === null && transporte ? (
                <div className="flex items-center gap-3 py-8 justify-center bg-slate-50 rounded-xl">
                   <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                   <span className="text-slate-500 text-sm font-medium">Cargando condiciones...</span>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-sm">Condiciones estándar aplicadas.</div>
              )}
            </div>
          )}

          {activeTab === "avaliaciones" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
               {/* Header e Breakdown */}
               <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Nota Principal */}
                  <div className="bg-slate-50 p-6 rounded-3xl flex flex-col items-center justify-center min-w-[200px] text-center border border-slate-100">
                     <div className="text-6xl font-extrabold text-slate-900 tracking-tighter">{reviewsData.averageRating}</div>
                     <div className="flex my-2 gap-1">{[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.floor(reviewsData.averageRating) ? 'fill-orange-400 text-orange-400' : 'fill-slate-200 text-slate-200'}`} />
                     ))}
                     </div>
                     <div className="text-sm font-medium text-slate-600">Baseado en {reviewsData.totalCount} opiniones</div>
                  </div>

                  {/* Barras de Progresso */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 w-full">
                     {[ 
                        { label: "Limpieza", value: reviewsData.breakdown.limpieza },
                        { label: "Ubicación", value: reviewsData.breakdown.ubicacion },
                        { label: "Servicio", value: reviewsData.breakdown.servicio },
                        { label: "Precio/Calidad", value: reviewsData.breakdown.precio_calidad },
                     ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                           <span className="text-sm font-medium text-slate-700 w-24">{item.label}</span>
                           <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-slate-800 rounded-full" style={{ width: `${(item.value / 5) * 100}%` }}></div>
                           </div>
                           <span className="text-sm font-bold text-slate-900 w-8 text-right">{item.value}</span>
                        </div>
                     ))}
                  </div>
               </div>
               
               <div className="border-t border-slate-100"></div>

               {/* Lista de Reviews */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviewsData.reviews.map((review, i) => (
                     <div key={i} className="p-5 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className="flex items-start justify-between mb-3">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-700 font-bold text-sm shadow-sm">
                                 {review.avatar}
                              </div>
                              <div>
                                 <div className="font-bold text-slate-900 text-sm">{review.author}</div>
                                 <div className="text-xs text-slate-500">{review.date}</div>
                              </div>
                           </div>
                           {review.tags && review.tags.length > 0 && (
                              <span className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                 {review.tags[0]}
                              </span>
                           )}
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">"{review.content}"</p>
                     </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Vuelos e Info Adicional */}
      <div className="border-t border-slate-200 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Coluna Voo / Info */}
          <div className="space-y-8">
             {transporte === 'Aéreo' && (
                <div>
                   <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Plane className="w-5 h-5 text-orange-500" /> Información de Vuelos
                   </h3>
                   <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      {!voosInfo && (<div className="text-sm text-slate-500 italic">Cargando horarios...</div>)}
                      {voosInfo && (
                         <div className="space-y-6">
                            <div className="flex items-center justify-between">
                               <span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-full">{saida} ⇄ {packageData.location.split(',')[0]}</span>
                            </div>
                            
                            {/* Ida */}
                            {voosInfo.ida.length > 0 && (
                               <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                     <span className="w-2 h-2 bg-green-500 rounded-full"></span> Ida
                                  </div>
                                  {voosInfo.ida.map((v: any, idx: number) => (
                                     <div key={`ida-${idx}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex flex-col">
                                           <span className="text-lg font-bold text-slate-900">{formatHora(v.saida_hora)}</span>
                                           <span className="text-xs text-slate-500">{v.aeroporto_saida || v.origem}</span>
                                        </div>
                                        <div className="flex flex-col items-center px-4">
                                           <span className="text-xs text-slate-400">Directo</span>
                                           <div className="w-16 h-px bg-slate-300 my-1 relative">
                                              <Plane className="w-3 h-3 text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90" />
                                           </div>
                                        </div>
                                        <div className="flex flex-col text-right">
                                           <span className="text-lg font-bold text-slate-900">{formatHora(v.chegada_hora)}</span>
                                           <span className="text-xs text-slate-500">{v.aeroporto_chegada || v.destino}</span>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            )}

                            {/* Volta */}
                            {voosInfo.volta.length > 0 && (
                               <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                     <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Vuelta
                                  </div>
                                  {voosInfo.volta.map((v: any, idx: number) => (
                                     <div key={`volta-${idx}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex flex-col">
                                           <span className="text-lg font-bold text-slate-900">{formatHora(v.saida_hora)}</span>
                                           <span className="text-xs text-slate-500">{v.aeroporto_saida || v.origem}</span>
                                        </div>
                                        <div className="flex flex-col items-center px-4">
                                           <span className="text-xs text-slate-400">Directo</span>
                                           <div className="w-16 h-px bg-slate-300 my-1 relative">
                                              <Plane className="w-3 h-3 text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90" />
                                           </div>
                                        </div>
                                        <div className="flex flex-col text-right">
                                           <span className="text-lg font-bold text-slate-900">{formatHora(v.chegada_hora)}</span>
                                           <span className="text-xs text-slate-500">{v.aeroporto_chegada || v.destino}</span>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            )}
                         </div>
                      )}
                   </div>
                   
                   {voosInfo?.bagagem && (
                      <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                         <div className="bg-amber-100 p-2 rounded-full h-fit"><span className="text-lg">🧳</span></div>
                         <div>
                            <p className="text-sm font-bold text-amber-900">Equipaje Incluido</p>
                            <ul className="mt-1 text-xs text-amber-800 space-y-1">
                               <li>• Carry-on + artículo personal: hasta {voosInfo.bagagem.carry ?? '-'} kg</li>
                               <li>• Maleta despachada: hasta {voosInfo.bagagem.despachada ?? '-'} kg</li>
                            </ul>
                         </div>
                      </div>
                   )}
                </div>
             )}

             {/* Addons - Visual Premium */}
             <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                   <Sparkles className="w-5 h-5 text-orange-500" /> Personaliza tu viaje
                </h3>
                <div className="grid grid-cols-1 gap-3">
                   {addons.map((service: any) => {
                      const isSelected = selectedAddons.includes(service.id);
                      const IconComponent = getIconComponent(service.icon || 'Sparkles');
                      return (
                         <div 
                           key={service.id} 
                           onClick={() => onAddonToggle(service.id)} 
                           className={`group relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${isSelected ? 'border-orange-500 bg-white shadow-[0_4px_20px_rgba(249,115,22,0.15)]' : 'border-slate-100 bg-white hover:border-orange-200 hover:shadow-md'}`}
                         >
                            {/* Background de Seleção Animado */}
                            <div className={`absolute inset-0 bg-orange-50 transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'}`}></div>

                            <div className="relative flex items-center gap-4 z-10">
                               <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-orange-500 text-white rotate-3 scale-110 shadow-md' : 'bg-slate-100 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-500'}`}>
                                  <IconComponent className="w-6 h-6" strokeWidth={1.5} />
                               </div>
                               <div>
                                  <p className={`font-bold text-base mb-0.5 transition-colors ${isSelected ? 'text-orange-900' : 'text-slate-900'}`}>{service.name}</p>
                                  <p className="text-xs text-slate-500 max-w-[220px] leading-relaxed">{service.description}</p>
                               </div>
                            </div>
                            
                            <div className="relative flex flex-col items-end gap-1 z-10">
                               <div className="text-right">
                                  <p className={`font-extrabold text-base ${isSelected ? 'text-orange-600' : 'text-slate-900'}`}>USD {service.price}</p>
                                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">por persona</p>
                               </div>
                               <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-orange-500 border-orange-500 scale-100 opacity-100' : 'border-slate-300 bg-transparent scale-90 opacity-50 group-hover:border-orange-300'}`}>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                               </div>
                            </div>
                         </div>
                      )
                   })}
                </div>
             </div>
          </div>

          {/* Coluna Mapa */}
          <div>
             <h3 className="text-xl font-bold text-slate-900 mb-4">Ubicación</h3>
             <div className="bg-slate-100 rounded-3xl h-[400px] w-full relative overflow-hidden border border-slate-200 shadow-inner group">
                {hospedagemData?.latitude && hospedagemData?.longitude ? (
                   <MapDisplay latitude={hospedagemData.latitude} longitude={hospedagemData.longitude} hotelName={packageData.name} />
                ) : (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                      <MapPin className="w-10 h-10 mb-2 opacity-50" />
                      <span className="text-sm font-medium">Mapa carregando...</span>
                   </div>
                )}
                
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-sm">
                   <p className="text-sm font-bold text-slate-900">{packageData.name}</p>
                   <p className="text-xs text-slate-500 truncate">{packageData.location}</p>
                   {hospedagemData?.distancia_praia && (
                      <div className="mt-2 flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-md">
                         <Waves className="w-3 h-3" /> {hospedagemData.distancia_praia}m de la playa
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>

      {showConditionsModal && selectedConditionType && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { closeConditionsModal() } }}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200"><h2 className="text-lg font-bold text-gray-900">{selectedConditionType === 'cancelacion' && 'Condiciones de Cancelación Completas'}{selectedConditionType === 'equipaje' && 'Política de Equipaje Completa'}{selectedConditionType === 'documentos' && 'Requisitos Completos'}</h2><button onClick={closeConditionsModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"><span className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</span></button></div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]"><div className="prose prose-sm max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: processMarkdownFormatting((selectedConditionType === 'cancelacion' && packageConditions?.cancelacion_completa) || (selectedConditionType === 'equipaje' && packageConditions?.equipaje_completa) || (selectedConditionType === 'documentos' && packageConditions?.documentos_completa) || 'Conteúdo não disponível.') }} /></div>
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50"><div className="text-sm text-gray-600">Para consultas adicionales, contáctanos por WhatsApp</div><button onClick={closeConditionsModal} className="px-4 py-2 bg-[#EE7215] hover:bg-[#E65100] text-white text-sm font-medium rounded-lg transition-colors">Cerrar</button></div>
          </div>
        </div>
      )}
    </div>
  )
}