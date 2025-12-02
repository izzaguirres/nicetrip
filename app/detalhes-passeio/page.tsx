"use client"

import { useState, useEffect, Suspense, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image, { StaticImageData } from "next/image"
import { Button } from "@/components/ui/button"
import { buildWhatsappMessage, openWhatsapp, logWhatsappConversion } from "@/lib/whatsapp"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Paseo, fetchPaseoById } from "@/lib/passeios-service"
import { formatCustomText } from '@/lib/text-formatter'
import { getPaseoGalleryImages } from "@/lib/paseos-data"
import {
  Star,
  MapPin,
  Clock,
  Users,
  Share,
  ChevronLeft,
  ChevronRight,
  Check,
  Camera,
  Sun,
  Moon,
  MessageCircle,
  Bus,
  Award,
  BookOpen,
  Headphones,
  Info,
} from 'lucide-react'
import { FadeIn } from "@/components/ui/fade-in"

type WhatsappParticipant = {
  label: string
  quantidade: number
  unit?: number
  total?: number
}

function DetalhesPasseioContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [passeio, setPasseio] = useState<Paseo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showAllPhotos, setShowAllPhotos] = useState(false)

  // ✅ NOVO: Capturar dados do filtro do usuário
  const mesUsuario = searchParams.get('mes') || searchParams.get('month')
  const adultosFiltro = parseInt(searchParams.get('adultos') || '2')
  const criancas03Filtro = parseInt(searchParams.get('criancas_0_3') || '0')
  const criancas45Filtro = parseInt(searchParams.get('criancas_4_5') || '0')
  const criancas6Filtro = parseInt(searchParams.get('criancas_6_plus') || '0')
  
  // ✅ NOVO: Função para formatar mês para exibição
  const formatarMesExibicao = (mesParam: string | null): string => {
    if (!mesParam) return "Fecha a consultar"
    
    // Se está no formato "2026-01", converter para "Enero de 2026"
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
    
    return mesParam // Fallback se já estiver formatado
  }
  
  // ✅ NOVO: Função para formatar pessoas selecionadas
  const formatarPessoasSelecionadas = (): string => {
    const totalPessoas = adultosFiltro + criancas03Filtro + criancas45Filtro + criancas6Filtro
    if (totalPessoas === 0) return "2 Adultos" // Fallback
    
    const partes = []
    if (adultosFiltro > 0) partes.push(`${adultosFiltro} Adulto${adultosFiltro > 1 ? 's' : ''}`)
    if (criancas03Filtro > 0) partes.push(`${criancas03Filtro} Niño${criancas03Filtro > 1 ? 's' : ''} (0-3)`)
    if (criancas45Filtro > 0) partes.push(`${criancas45Filtro} Niño${criancas45Filtro > 1 ? 's' : ''} (4-5)`)  
    if (criancas6Filtro > 0) partes.push(`${criancas6Filtro} Niño${criancas6Filtro > 1 ? 's' : ''} (6+)`)
    
    return partes.join(', ')
  }

  const currencyPasseio = 'USD'

  const formatCurrencyNumber = (value: number): string => {
    const safe = Number.isFinite(value) ? value : 0
    return safe.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }

  const formatPriceWithCurrency = (value: number): string =>
    `${currencyPasseio} ${formatCurrencyNumber(Math.max(0, value))}`

  const participantesBreakdown: WhatsappParticipant[] = useMemo(() => {
    if (!passeio) return []

    const items: PaseoParticipant[] = []
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

    addParticipant('Adultos', adultosFiltro, passeio.preco_adulto)
    addParticipant('Niños (0-3)', criancas03Filtro, passeio.preco_crianca_0_3)
    addParticipant('Niños (4-5)', criancas45Filtro, passeio.preco_crianca_4_5)
    addParticipant('Niños 6+', criancas6Filtro, passeio.preco_crianca_6_10)

    return items
  }, [passeio, adultosFiltro, criancas03Filtro, criancas45Filtro, criancas6Filtro])

  const totalPasseio = useMemo(
    () => participantesBreakdown.reduce((sum, item) => sum + (item.total ?? 0), 0),
    [participantesBreakdown]
  )

  const valorTotalDisplay = totalPasseio > 0 ? formatPriceWithCurrency(totalPasseio) : 'A consultar'

  const buildPaseoWhatsappData = () => {
    const observaciones = passeio?.observacoes
      ? passeio.observacoes
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean)
      : undefined

    return {
      paseo: passeio?.nome || '-',
      mes: mesUsuario ? formatarMesExibicao(mesUsuario) : undefined,
      adultos: adultosFiltro,
      ninos: criancas03Filtro + criancas45Filtro + criancas6Filtro,
      participantes: participantesBreakdown,
      currency: currencyPasseio,
      total: totalPasseio > 0 ? totalPasseio : undefined,
      local: passeio?.local_saida,
      horario: passeio?.horario_saida,
      punto_encuentro: passeio?.local,
      observaciones,
      link: typeof window !== 'undefined' ? window.location.href : '',
    }
  }

  const sendPasseioWhatsapp = (origin: string) => {
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || ''
    const payload = buildPaseoWhatsappData()
    const mensagem = buildWhatsappMessage('paseo', payload)

    logWhatsappConversion({
      origem: origin,
      paseo: payload.paseo,
      mes: payload.mes,
      adultos: payload.adultos,
      ninos: payload.ninos,
      total: payload.total,
      currency: payload.currency,
    })

    openWhatsapp(phone, mensagem)
  }

  // Suporte a swipe no modal de fotos
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  // Aba ativa (descricao, observaciones, avaliacoes)
  const [activeTab, setActiveTab] = useState<'descripcion' | 'observaciones' | 'avaliacoes'>('descripcion')

  // ✅ Parâmetros da URL - Usando os valores corretos do filtro
  const passeioId = searchParams.get('id')
  const adultos = adultosFiltro.toString() // Usar valor do filtro
  const criancas_0_3 = criancas03Filtro.toString() // Usar valor do filtro  
  const criancas_4_5 = criancas45Filtro.toString() // Usar valor do filtro
  const criancas_6_10 = criancas6Filtro.toString() // Usar valor do filtro (6+)
  const totalCriancas = criancas03Filtro + criancas45Filtro + criancas6Filtro

  // ✅ MOVER useMemo PARA CIMA - Sistema de imagens (deve vir antes das funções que o usam)
  const galleryImages = useMemo(() => {
    if (!passeio) return [];
    return passeio.imagens_galeria && passeio.imagens_galeria.length > 0
      ? [passeio.imagem_url, ...passeio.imagens_galeria].filter(Boolean) as string[]
      : getPaseoGalleryImages(passeio.nome);
  }, [passeio]);

  // ✅ Funções que dependem de galleryImages (agora vêm depois do useMemo)
  const nextImage = () => {
    if (!passeio) return;
    setCurrentImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    if (!passeio) return;
    setCurrentImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) nextImage();
    if (distance < -50) prevImage();
  }

  // ✅ Função para fechar modal
  const closeModal = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowAllPhotos(false);
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
      text: `Confira este passeio increíble: ${passeio.nome}!`,
      url: window.location.href
    }
    try {
      await navigator.share(shareData)
    } catch (err) {
      console.error('Error sharing:', err)
      alert('Link copiado para a área de transferência!');
      navigator.clipboard.writeText(window.location.href);
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Ocorreu um Erro</h2>
        <p className="text-gray-700 mb-6">{error}</p>
        <Button onClick={() => router.push('/')}>Voltar para a Home</Button>
      </div>
    );
  }

  if (!passeio) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Passeio Não Encontrado</h2>
        <p className="text-gray-600 mb-6">O passeio que você está procurando não existe ou foi removido.</p>
        <Button onClick={() => router.push('/')}>Ver outros passeios</Button>
      </div>
    );
  }
  
  // ✅ Sistema de imagens já declarado no topo da função
  
  // Usando dados reais do Supabase para a seção "Informaciones"
  const infoItems = [
    passeio.local_saida && { text: `Embarque desde ${passeio.local_saida}` },
    passeio.horario_saida && { text: `Horario de salida: ${passeio.horario_saida}` },
    passeio.inclui_transporte && { text: `Transporte ida y vuelta en Bús` },
    passeio.guia_turistico && { text: `Guía turístico` },
    passeio.opcionais_texto && { text: passeio.opcionais_texto }
  ].filter(Boolean) as { text: string }[];

  // Cartões "Sobre o Passeio" – usamos apenas os textos (títulos opcionais)
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
    { nome: 'Ricardo Martins', data: '2 meses atrás', texto: 'Excelente relación calidad-precio. El transporte fue cómodo y puntual. El equipo de Nice Trip es muy profesional.' },
    { nome: 'Fernanda Lima', data: '3 meses atrás', texto: 'Ideal para toda la familia. Mis hijos se divirtieron mucho y se sintieron seguros todo el tiempo. ¡Gracias!' },
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
        <FadeIn className="mb-8">

          {/* Mobile – carrossel swipe */}
          <div className="lg:hidden">
            <div className="relative">
              <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-2">
                {galleryImages.map((image: string | StaticImageData, index: number) => (
                  <div
                    key={index}
                    className="relative flex-shrink-0 w-full snap-start"
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setShowAllPhotos(true);
                    }}
                  >
                    <Image
                      src={image}
                      alt={`Imagen ${index + 1}`}
                      width={800}
                      height={600}
                      className="h-64 w-full object-cover rounded-xl"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Grid */}
          <div className="hidden lg:grid lg:grid-cols-4 lg:grid-rows-2 gap-2 h-[550px] rounded-2xl overflow-hidden">
            <div className="lg:col-span-2 lg:row-span-2 relative group">
              <Image
                src={galleryImages[0] || "/placeholder.jpg"}
                alt="Imagen principal del paseo"
                fill
                className="object-cover cursor-pointer"
                onClick={() => { setCurrentImageIndex(0); setShowAllPhotos(true); }}
              />
            </div>
            {galleryImages.slice(1, 5).map((image: string | StaticImageData, index: number) => (
              <div key={index} className="relative group h-full w-full">
                <Image
                  src={image}
                  alt={`Imagen ${index + 2}`}
                  fill
                  className="object-cover cursor-pointer"
                  onClick={() => { setCurrentImageIndex(index + 1); setShowAllPhotos(true); }}
                />
                {index === 3 && galleryImages.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer" onClick={() => setShowAllPhotos(true)}>
                    <div className="text-white text-center">
                      <Camera className="w-6 h-6 mx-auto mb-1" />
                      <span>Ver todas</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </FadeIn>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Coluna de Conteúdo */}
          <FadeIn delay={0.2} className="lg:col-span-2 space-y-10">
            {/* Bloco de Título conforme Páginas de Detalhes Padrão */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div>
                <span className="inline-block text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-full">
                  PASEO
                </span>
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900">
                {passeio.nome}
              </h1>
              <p className="text-lg text-gray-500">{passeio.local}</p>

              <div className="flex items-center justify-center space-x-4 md:space-x-6 w-full pt-4">
                {passeio.avaliacao_media && (
                  <>
                    <div className="flex flex-col items-center space-y-1">
                      <span className="font-bold text-sm text-gray-900">{passeio.avaliacao_media}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < (passeio.avaliacao_media ?? 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />)}
                      </div>
                    </div>
                    <div className="w-px h-10 bg-gray-200"></div>
                  </>
                )}
                <div className="text-sm font-medium text-gray-900 text-center w-28">
                  El Paseo más buscado
                </div>
                {passeio.total_avaliacoes && (
                  <>
                    <div className="w-px h-10 bg-gray-200"></div>
                    <div className="flex flex-col items-center space-y-1">
                      <span className="font-bold text-sm text-gray-900">{passeio.total_avaliacoes}</span>
                      <span className="text-xs text-gray-600">avaliaciones</span>
                    </div>
                  </>
                )}
              </div>

              {/* Linha de duração (horas) */}
              {passeio.duracion && (
                <div className="flex items-center gap-4 pt-2">
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Clock className="w-5 h-5 text-gray-900" />
                    <span>{passeio.duracion}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t"></div>

            {/* Seção Informaciones conforme Anexo 4 */}
            <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  Informaciones
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {infoItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="text-gray-700">{item.text}</span>
                    </div>
                  ))}
                </div>
            </div>
            
            <div className="border-t"></div>

            {/* Abas de Conteúdo */}
            <div>
              <div className="flex justify-center mb-6">
                <div className="flex bg-gray-100 p-1 rounded-lg shadow-inner">
                  <button onClick={() => setActiveTab("descripcion")} className={`px-4 py-2 text-sm font-semibold rounded-md ${activeTab === "descripcion" ? "bg-white text-orange-600 shadow" : "text-gray-600"}`}>Descripción</button>
                  <button onClick={() => setActiveTab("observaciones")} className={`px-4 py-2 text-sm font-semibold rounded-md ${activeTab === "observaciones" ? "bg-white text-orange-600 shadow" : "text-gray-600"}`}>Observaciones</button>
                  <button onClick={() => setActiveTab("avaliacoes")} className={`px-4 py-2 text-sm font-semibold rounded-md ${activeTab === "avaliacoes" ? "bg-white text-orange-600 shadow" : "text-gray-600"}`}>Avaliaciones</button>
                </div>
              </div>
              <div className="prose max-w-none text-gray-700 min-h-[150px]">
                {activeTab === 'descripcion' && (
                  passeio.descricao ? (
                    <div dangerouslySetInnerHTML={{ __html: formatCustomText(passeio.descricao) }} />
                  ) : passeio.descricao_longa ? (
                    <div dangerouslySetInnerHTML={{ __html: formatCustomText(passeio.descricao_longa) }} />
                  ) : (
                    <p className="text-gray-500 italic">Nenhuma descrição detalhada disponível.</p>
                  )
                )}
                {activeTab === 'observaciones' && (
                  passeio.observacoes ? (
                    <div dangerouslySetInnerHTML={{ __html: formatCustomText(passeio.observacoes) }} />
                  ) : (
                    <p className="text-gray-500 italic">Nenhuma observação adicional disponível.</p>
                  )
                )}
                {activeTab === 'avaliacoes' && (
                  <div className="space-y-4 not-prose">
                    {avaliacoes.map((review, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-orange-500">{review.nome.charAt(0)}</div>
                          <div>
                            <p className="font-semibold text-gray-900">{review.nome}</p>
                            <p className="text-xs text-gray-500">{review.data}</p>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">{review.texto}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t"></div>
            
            {/* Seção Sobre o Passeio conforme Anexo 5 */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Sobre o Passeio
              </h3>
              {sobrePasseioCards.length > 0 ? (
                <div className="space-y-4">
                  {sobrePasseioCards.map((card, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                        {card.title && (
                          <h4 className="font-bold text-xl text-gray-800 mb-1">{card.title}</h4>
                        )}
                        <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: customFormat(card.text) }}></div>
                      </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Info className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Nenhum detalhe adicional disponível para este passeio.</p>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Coluna de Reserva conforme Padrão */}
          <FadeIn delay={0.4} className="lg:col-span-1">
            <div className="sticky top-28 bg-[#EEEEEE] border border-gray-200 rounded-3xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-center mb-6">¡Asegura tu lugar en este Paseo Especial!</h3>
              
              <div className="mb-6 space-y-3">
                 <div className="flex justify-between items-center bg-white p-3 rounded-xl">
                    <span className="font-semibold text-sm text-gray-700">Fecha</span>
                    <span className="font-bold text-sm text-gray-900">{formatarMesExibicao(mesUsuario)}</span>
                 </div>
                 <div className="text-center text-sm text-gray-600 flex items-center justify-center gap-2 pt-2">
                     <Bus className="w-4 h-4"/>
                     <span className="font-medium">{passeio.nome}</span>
                 </div>
              </div>

              <div className="bg-white rounded-2xl p-4 mb-4">
                <h4 className="text-sm font-bold text-gray-900 mb-2">Desglose de participantes</h4>
                <div className="space-y-2 text-sm border-t pt-3 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{adultos} Adulto{parseInt(adultos) > 1 ? 's' : ''}</span>
                  </div>
                  {parseInt(criancas_0_3) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{criancas_0_3} Niño{parseInt(criancas_0_3) > 1 ? 's' : ''} (0-3 años)</span>
                    </div>
                  )}
                  {parseInt(criancas_4_5) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{criancas_4_5} Niño{parseInt(criancas_4_5) > 1 ? 's' : ''} (4-5 años)</span>
                    </div>
                  )}
                  {parseInt(criancas_6_10) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{criancas_6_10} Niño{parseInt(criancas_6_10) > 1 ? 's' : ''} (6-10 años)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                 <div className="flex justify-between items-center font-bold">
                    <span className="text-gray-800">Valor Total</span>
                    <span className="text-lg text-gray-900">{valorTotalDisplay}</span>
                 </div>
              </div>

              <a
                onClick={(e) => {
                  e.preventDefault()
                  sendPasseioWhatsapp('detalhes-passeio')
                }}
                className="w-full bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-5 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Hablar com Operador
              </a>
              <p className="text-center text-xs text-gray-500 mt-2">
                No se cobrará aún
              </p>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Photo Modal (padrão das outras páginas) */}
      {showAllPhotos && passeio && (
        <div
          className="fixed inset-0 bg-black z-[9999] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-[10001]">
            <button
              onClick={closeModal}
              className="text-white hover:bg-white/20 p-3 rounded-full transition-all flex items-center gap-2 bg-black/20 backdrop-blur-sm cursor-pointer"
              type="button"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Volver</span>
            </button>

            <button
              onClick={closeModal}
              className="text-white hover:bg-white/20 p-3 rounded-full transition-all text-xl font-bold bg-black/20 backdrop-blur-sm w-12 h-12 flex items-center justify-center cursor-pointer"
              type="button"
            >
              ×
            </button>
          </div>

          {/* Imagem */}
          <div
            className="relative w-full h-full flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Botão anterior */}
            {galleryImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 text-white hover:bg-white/20 p-3 rounded-full bg-black/20 backdrop-blur-sm"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <Image
              src={galleryImages[currentImageIndex] || '/placeholder.jpg'}
              alt={`Foto ${currentImageIndex + 1}`}
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain select-none"
            />

            {/* Botão próximo */}
            {galleryImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 text-white hover:bg-white/20 p-3 rounded-full bg-black/20 backdrop-blur-sm"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
            {currentImageIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}
    </div>
  )
}


export default function DetalhesPasseioPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div></div>}>
        <DetalhesPasseioContent />
      </Suspense>
      <Footer />
    </div>
  )
} 
