"use client"

import { useState, useEffect, Suspense, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { buildWhatsappMessage, openWhatsapp, logWhatsappConversion } from "@/lib/whatsapp"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Paseo, fetchPaseoById } from "@/lib/passeios-service"
import { formatCustomText } from '@/lib/text-formatter'
import { getPaseoGalleryImages } from "@/lib/paseos-data"
import {
  Star,
  Share,
  ChevronLeft,
  Check,
  Award,
  BookOpen,
  Headphones,
  Info,
  Sun,
  MapPin,
  Clock,
} from 'lucide-react'
import { FadeIn } from "@/components/ui/fade-in"
import { PackageGallery } from "@/components/package-gallery"
import { BookingCardPaseo } from "@/components/booking-card-paseo"

function DetalhesPasseioContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [passeio, setPasseio] = useState<Paseo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'descripcion' | 'observaciones' | 'avaliacoes'>('descripcion')

  // Capturar dados do filtro
  const mesUsuario = searchParams.get('mes') || searchParams.get('month')
  const adultosFiltro = parseInt(searchParams.get('adultos') || '2')
  const criancas03Filtro = parseInt(searchParams.get('criancas_0_3') || '0')
  const criancas45Filtro = parseInt(searchParams.get('criancas_4_5') || '0')
  const criancas6Filtro = parseInt(searchParams.get('criancas_6_plus') || '0')
  const passeioId = searchParams.get('id')

  // Função para formatar mês
  const formatarMesExibicao = (mesParam: string | null): string => {
    if (!mesParam) return "Fecha a consultar"
    if (mesParam.includes('-')) {
      const [ano, mes] = mesParam.split('-')
      const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ]
      const mesIndex = parseInt(mes) - 1
      if (mesIndex >= 0 && mesIndex < 12) {
        return `${meses[mesIndex]} de ${ano}`
      }
    }
    return mesParam
  }

  const sendPasseioWhatsapp = (origin: string) => {
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || ''
    // Recalcular breakdown apenas para o payload se necessario, mas BookingCard ja faz isso visualmente.
    // Aqui precisamos enviar os dados brutos.
    const payload = {
      paseo: passeio?.nome || '-',
      mes: mesUsuario ? formatarMesExibicao(mesUsuario) : undefined,
      adultos: adultosFiltro,
      ninos: criancas03Filtro + criancas45Filtro + criancas6Filtro,
      currency: 'USD',
      link: typeof window !== 'undefined' ? window.location.href : '',
    }
    const mensagem = buildWhatsappMessage('paseo', payload) // Simplificado, a função buildWhatsappMessage lida com detalhes se passados corretamente

    logWhatsappConversion({
      origem: origin,
      paseo: payload.paseo,
      mes: payload.mes,
      adultos: payload.adultos,
      ninos: payload.ninos,
      currency: payload.currency,
    })

    openWhatsapp(phone, mensagem)
  }

  useEffect(() => {
    if (passeioId) {
      const getPaseo = async () => {
        try {
          setLoading(true)
          const data = await fetchPaseoById(passeioId)
          if (data) {
            setPasseio(data)
          } else {
            setError('Passeio não encontrado.')
          }
        } catch (err) {
          setError('Falha ao buscar dados do passeio.')
        } finally {
          setLoading(false)
        }
      }
      getPaseo()
    } else {
      setError('ID do passeio não fornecido.')
      setLoading(false)
    }
  }, [passeioId])

  const galleryImages = useMemo(() => {
    if (!passeio) return [];
    return passeio.imagens_galeria && passeio.imagens_galeria.length > 0
      ? [passeio.imagem_url, ...passeio.imagens_galeria].filter(Boolean) as string[]
      : getPaseoGalleryImages(passeio.nome);
  }, [passeio]);

  const customFormat = (text: string | null | undefined): string => {
    if (!text) return ''
    return text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em class="text-orange-600 not-italic">$1</em>')
      .replace(/#\*\*([^*]+)\*\*#/g, '<strong class="text-red-600">$1</strong>')
      .replace(/\n/g, '<br />');
  }

  const handleShare = async () => {
    if (!passeio) return;
    const shareData = {
      title: `${passeio.nome} - Nice Trip`,
      text: `Confira este passeio incrível: ${passeio.nome}!`,
      url: window.location.href
    }
    try {
      await navigator.share(shareData)
    } catch (err) {
      console.error('Error sharing:', err)
      try {
         await navigator.clipboard.writeText(window.location.href);
         alert('Link copiado para a área de transferência!');
      } catch (e) {}
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !passeio) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{error || "Passeio não encontrado"}</h2>
        <Button onClick={() => router.push('/')}>Voltar para a Home</Button>
      </div>
    );
  }
  
  const infoItems = [
    passeio.local_saida && { text: `Embarque desde ${passeio.local_saida}` },
    passeio.horario_saida && { text: `Horario de salida: ${passeio.horario_saida}` },
    passeio.inclui_transporte && { text: `Transporte ida y vuelta en Bús` },
    passeio.guia_turistico && { text: `Guía turístico` },
    passeio.opcionais_texto && { text: passeio.opcionais_texto }
  ].filter(Boolean) as { text: string }[];

  const sobrePasseioCards = [
    { icon: Award, title: passeio.info_1_titulo, text: passeio.info_1_texto },
    { icon: Sun, title: passeio.info_2_titulo, text: passeio.info_2_texto },
    { icon: BookOpen, title: passeio.info_3_titulo, text: passeio.info_3_texto },
    { icon: Headphones, title: passeio.info_4_titulo, text: passeio.info_4_texto },
  ].filter(card => !!card.text);

  const avaliacoes = [
    { nome: 'Ana García', data: '2 semanas atrás', texto: '¡Una experiencia inolvidable! El guía fue súper atento y los lugares son increíbles. Lo recomiendo al 100%.' },
    { nome: 'Marcos López', data: '1 mes atrás', texto: 'Muy bien organizado. Perfecto para conocer varios puntos importantes en un solo día. La comida opcional valió la pena.' },
    { nome: 'Juliana Costa', data: '1 mes atrás', texto: 'El paseo es hermoso y muy completo. El tiempo en la playa fue perfecto para relajarse. ¡Volvería a hacerlo!' },
  ];

  return (
    <div className="pt-24 lg:pt-28 pb-12 lg:pb-8">
      <div className="container mx-auto px-4 lg:px-[70px]">
        <div className="relative flex items-center justify-between mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-base font-medium text-gray-900 hover:text-[#EE7215] transition-colors duration-200 group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform duration-200" />
            <span>Volver</span>
          </button>
          <button 
            onClick={handleShare}
            className="text-gray-700 hover:text-orange-500 transition-colors"
          >
            <Share className="w-5 h-5" />
          </button>
        </div>

        {/* Galeria de Fotos */}
        <FadeIn>
           <PackageGallery images={galleryImages} />
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
          {/* Coluna de Conteúdo */}
          <FadeIn delay={0.2} className="lg:col-span-2 space-y-10">
            
            {/* 1. Header Premium (Igual PackageInfo) */}
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-3">
                   <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-[10px] font-bold uppercase tracking-wider border border-orange-100">
                      Paseo
                   </span>
                   {(passeio.avaliacao_media || 5) > 4.5 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                         <Star className="w-3 h-3 fill-slate-600" /> Guest Favorite
                      </span>
                   )}
                </div>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                  {passeio.nome}
                </h1>
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                   <MapPin className="w-4 h-4" />
                   <span className="underline decoration-slate-300 underline-offset-4 cursor-pointer hover:text-orange-600 transition-colors">{passeio.local}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2 border-t border-slate-100 mt-2">
                 <div className="flex items-center gap-1.5">
                    <Star className="w-5 h-5 fill-orange-500 text-orange-500" />
                    <span className="text-lg font-bold text-slate-900">{passeio.avaliacao_media || "4.9"}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full mx-1"></span>
                    <span className="text-sm text-slate-600 underline decoration-slate-200 underline-offset-4 cursor-pointer hover:text-slate-900">{passeio.total_avaliacoes || "124"} evaluaciones</span>
                 </div>
                 <div className="h-8 w-px bg-slate-200"></div>
                 <div className="flex items-center gap-4">
                    {passeio.duracion && (
                      <div className="flex items-center gap-2">
                         <div className="p-2 bg-slate-50 rounded-full"><Clock className="w-4 h-4 text-slate-700" /></div>
                         <span className="text-sm font-medium text-slate-700">{passeio.duracion}</span>
                      </div>
                    )}
                 </div>
              </div>
            </div>

            {/* 2. Informações Principais (Highlights Style) */}
            <div className="py-6 border-t border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Info className="w-5 h-5 text-orange-500" /> Informaciones Importantes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {infoItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-xl transition-colors">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 text-orange-600">
                        <Check className="w-4 h-4" strokeWidth={2.5} />
                      </div>
                      <span className="text-slate-700 text-sm font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
            </div>

            {/* 3. Abas Clean (Underline Style) */}
            <div className="space-y-6">
              <div className="border-b border-slate-200">
                <div className="flex gap-8 overflow-x-auto scrollbar-hide">
                  <button 
                     onClick={() => setActiveTab("descripcion")}
                     className={`pb-4 text-sm font-bold tracking-wide transition-all duration-300 border-b-2 whitespace-nowrap ${activeTab === "descripcion" ? "border-orange-600 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"}`}
                  >
                     Sobre el paseo
                  </button>
                  <button 
                     onClick={() => setActiveTab("observaciones")}
                     className={`pb-4 text-sm font-bold tracking-wide transition-all duration-300 border-b-2 whitespace-nowrap ${activeTab === "observaciones" ? "border-orange-600 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"}`}
                  >
                     Observaciones
                  </button>
                  <button 
                     onClick={() => setActiveTab("avaliaciones")}
                     className={`pb-4 text-sm font-bold tracking-wide transition-all duration-300 border-b-2 whitespace-nowrap ${activeTab === "avaliaciones" ? "border-orange-600 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"}`}
                  >
                     Opiniones
                  </button>
                </div>
              </div>

              <div className="min-h-[150px] animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === 'descripcion' && (
                  <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatCustomText(passeio.descricao || passeio.descricao_longa || 'Sin descripción disponible.') }} />
                )}
                {activeTab === 'observaciones' && (
                  <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatCustomText(passeio.observacoes || 'Sin observaciones adicionales.') }} />
                )}
                {activeTab === 'avaliacoes' && (
                  <div className="space-y-6 not-prose">
                    <div className="flex flex-col md:flex-row gap-8 items-start pb-6 border-b border-slate-100">
                        <div className="bg-slate-50 p-6 rounded-3xl flex flex-col items-center justify-center min-w-[200px] text-center border border-slate-100">
                           <div className="text-5xl font-extrabold text-slate-900 tracking-tighter">{passeio.avaliacao_media || 4.9}</div>
                           <div className="flex my-2 gap-1">{[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < Math.floor(passeio.avaliacao_media || 4.9) ? 'fill-orange-400 text-orange-400' : 'fill-slate-200 text-slate-200'}`} />
                           ))}
                           </div>
                           <div className="text-xs font-medium text-slate-600">{passeio.total_avaliacoes || 124} opiniones</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {avaliacoes.map((review, index) => (
                        <div key={index} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-700 text-xs">{review.nome.charAt(0)}</div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{review.nome}</p>
                              <p className="text-[10px] text-slate-500">{review.data}</p>
                            </div>
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed">{review.texto}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 4. Cards Sobre o Passeio (Visual Premium Renovado) */}
            {sobrePasseioCards.length > 0 && (
              <div className="border-t border-slate-200 pt-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Award className="w-6 h-6 text-orange-600" />
                  </div>
                  Detalles de la experiencia
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sobrePasseioCards.map((card, index) => (
                      <div key={index} className="group bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-orange-100 transition-all duration-300 flex flex-col gap-4">
                        {card.title && (
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-orange-50 group-hover:scale-110 transition-all duration-300">
                                <card.icon className="w-6 h-6 text-slate-400 group-hover:text-orange-500 transition-colors" strokeWidth={1.5} />
                             </div>
                             <h4 className="font-bold text-lg text-slate-900 leading-tight">{card.title}</h4>
                          </div>
                        )}
                        <div className="text-slate-600 text-sm leading-relaxed pl-1" dangerouslySetInnerHTML={{ __html: customFormat(card.text) }}></div>
                      </div>
                  ))}
                </div>
              </div>
            )}
          </FadeIn>

          {/* Coluna de Reserva */}
          <FadeIn delay={0.4} className="lg:col-span-1">
             <BookingCardPaseo
                paseo={passeio}
                filters={{
                   mes: mesUsuario,
                   adultos: adultosFiltro,
                   criancas_0_3: criancas03Filtro,
                   criancas_4_5: criancas45Filtro,
                   criancas_6_plus: criancas6Filtro
                }}
                onBook={() => sendPasseioWhatsapp('detalhes-passeio')}
                formatarMesExibicao={formatarMesExibicao}
             />
          </FadeIn>
        </div>
      </div>
    </div>
  )
}

export default function DetalhesPasseioPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div></div>}>
        <DetalhesPasseioContent />
      </Suspense>
      <Footer />
    </div>
  )
}