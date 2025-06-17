"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { 
  Star, 
  MapPin, 
  Calendar, 
  Users, 
  Wifi, 
  Car, 
  Coffee, 
  Utensils, 
  Heart,
  Share,
  ChevronLeft,
  ChevronRight,
  Check,
  Shield,
  Award,
  Clock,
  Camera,
  Bed,
  Sun,
  ArrowRight
} from "lucide-react"

export default function DetalhesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const [activeTab, setActiveTab] = useState("descripcion")
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  
  // Dados dinâmicos da URL
  const hotelName = searchParams.get('hotel') || 'Hotel Premium'
  const destino = searchParams.get('destino') || 'Florianópolis'
  const preco = parseInt(searchParams.get('preco') || '2850')
  
  // Dados de quartos e pessoas
  const quartos = parseInt(searchParams.get('quartos') || '1')
  const adultos = parseInt(searchParams.get('adultos') || '2')
  const criancas_0_3 = parseInt(searchParams.get('criancas_0_3') || '0')
  const criancas_4_5 = parseInt(searchParams.get('criancas_4_5') || '0')
  const criancas_6 = parseInt(searchParams.get('criancas_6') || '0')
  
  const totalCriancas = criancas_0_3 + criancas_4_5 + criancas_6
  const totalPessoas = adultos + totalCriancas
  const temMultiplosQuartos = quartos > 1
  
  // Função para distribuir pessoas pelos quartos (igual ao card de resultados)
  const getQuartosIndividuais = () => {
    // ✅ TENTAR LER CONFIGURAÇÃO ESPECÍFICA POR QUARTO DA URL
    const quartosEspecificos = searchParams.get('rooms_config')
    
    if (quartosEspecificos) {
      try {
        // Se existe configuração específica, decodificar e usar
        const configDecoded = JSON.parse(decodeURIComponent(quartosEspecificos))
        console.log('🎯 CONFIGURAÇÃO ESPECÍFICA ENCONTRADA:', configDecoded)
        console.log('📋 QUARTOS MAPEADOS:', configDecoded.map((room: any, index: number) => ({
          numero: index + 1,
          adultos: room.adults || 0,
          criancas_0_3: room.children_0_3 || 0,
          criancas_4_5: room.children_4_5 || 0,
          criancas_6: room.children_6 || 0
        })))
        
        return configDecoded.map((room: any, index: number) => ({
          numero: index + 1,
          adultos: room.adults || 0,
          criancas_0_3: room.children_0_3 || 0,
          criancas_4_5: room.children_4_5 || 0,
          criancas_6: room.children_6 || 0
        }))
      } catch (error) {
        console.log('⚠️ Erro ao decodificar configuração específica, usando distribuição automática')
      }
    }
    
    // ✅ FALLBACK: Distribuição automática (comportamento atual)
    console.log('📊 USANDO DISTRIBUIÇÃO AUTOMÁTICA')
    const quartosArray = []
    const adultosPorQuarto = Math.floor(adultos / quartos)
    
    for (let i = 0; i < quartos; i++) {
      quartosArray.push({
        numero: i + 1,
        adultos: adultosPorQuarto + (i < (adultos % quartos) ? 1 : 0),
        criancas_0_3: Math.floor(criancas_0_3 / quartos) + (i < (criancas_0_3 % quartos) ? 1 : 0),
        criancas_4_5: Math.floor(criancas_4_5 / quartos) + (i < (criancas_4_5 % quartos) ? 1 : 0),
        criancas_6: Math.floor(criancas_6 / quartos) + (i < (criancas_6 % quartos) ? 1 : 0)
      })
    }
    return quartosArray
  }
  
  const quartosIndividuais = getQuartosIndividuais()
  
  // 💰 VALORES REAIS DO SUPABASE (conforme tabela disponibilidades)
  const dadosPacote = {
    preco_adulto: 490,         // R$ 490,00
    preco_crianca_0_3: 50,     // R$ 50,00
    preco_crianca_4_5: 350,    // R$ 350,00  
    preco_crianca_6_mais: 490  // R$ 490,00
  }
  
  // 🧮 CALCULAR PREÇO EXATO POR QUARTO baseado nos dados reais do Supabase
  const calcularPrecoQuarto = (quarto: any) => {
    return (
      (quarto.adultos * dadosPacote.preco_adulto) +
      (quarto.criancas_0_3 * dadosPacote.preco_crianca_0_3) +
      (quarto.criancas_4_5 * dadosPacote.preco_crianca_4_5) +
      (quarto.criancas_6 * dadosPacote.preco_crianca_6_mais)
    )
  }
  
  // 💰 USAR O PREÇO ESPECÍFICO DO CARD CLICADO (via URL)
  // Se o preço veio da URL (card específico), usar esse preço
  // Caso contrário, calcular baseado nos quartos configurados
  const precoCalculadoInterno = quartosIndividuais.reduce((total: number, quarto: any) => {
    return total + calcularPrecoQuarto(quarto)
  }, 0)
  
  // ✅ SEMPRE USAR O PREÇO DO CARD SELECIONADO (que vem via URL)
  const precoTotalReal = preco || precoCalculadoInterno
  
  console.log('💰 DEBUG PREÇO DETALHES:')
  console.log('  - Preço da URL (card selecionado):', preco)
  console.log('  - Preço calculado interno:', precoCalculadoInterno)
  console.log('  - Preço final usado:', precoTotalReal)
  
  // Determinar tipo de quarto baseado na ocupação
  const determinarTipoQuarto = (quarto: any) => {
    const totalPessoasQuarto = quarto.adultos + quarto.criancas_0_3 + quarto.criancas_4_5 + quarto.criancas_6
    if (totalPessoasQuarto >= 3) return "Triple"
    if (totalPessoasQuarto === 2) return "Habitación Doble"
    return "Individual"
  }
  
  // Formatar ocupação do quarto
  const formatarOcupacaoQuarto = (quarto: any) => {
    const partes = []
    if (quarto.adultos > 0) partes.push(`${quarto.adultos} Adulto${quarto.adultos > 1 ? 's' : ''}`)
    const totalCriancasQuarto = quarto.criancas_0_3 + quarto.criancas_4_5 + quarto.criancas_6
    if (totalCriancasQuarto > 0) partes.push(`${totalCriancasQuarto} Niño${totalCriancasQuarto > 1 ? 's' : ''}`)
    return partes.join(', ')
  }
  
  const packageData = {
    id: searchParams.get('id') || '1',
    name: `${hotelName} - ${destino}`,
    location: `${destino}, Santa Catarina`,
    hotel: hotelName,
    rating: 4.9,
    reviewCount: 127,
    price: preco,
    originalPrice: preco + 350,
    dataViagem: searchParams.get('data') || '2025-10-02',
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80"
    ],
    description: `Disfrute de una experiencia única en ${destino} con nuestro paquete premium. Hospedaje en ${hotelName} con vista al mar, transporte cómodo y experiencias gastronómicas exclusivas.`,
    highlights: [
      "Vista panorámica del océano",
      `${hotelName} - Excelencia en hospedaje`,
      "Transporte ejecutivo incluido",
      "Desayuno gourmet",
      "Acceso a playa privada"
    ],
    amenities: [
      { icon: Wifi, name: "Wi-Fi gratuito" },
      { icon: Car, name: "Estacionamiento" },
      { icon: Coffee, name: "Desayuno" },
      { icon: Utensils, name: "Restaurante" },
    ],
    includes: [
      "Hospedagem por 4 noites",
      "Café da manhã completo",
      "Transporte ida e volta",
      "Tour guiado pela ilha",
      "Seguro viagem"
    ],
    checkIn: "15:00",
    checkOut: "11:00",
    duration: "4 dias / 3 noites"
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === packageData.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? packageData.images.length - 1 : prev - 1
    )
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0) // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextImage()
    }
    if (isRightSwipe) {
      prevImage()
    }
  }

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: `${packageData.name} - Nice Trip`,
      text: `¡Mira este increíble paquete en ${destino}! Desde $ ${packageData.price.toLocaleString()}`,
      url: window.location.href
    }

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        alert('¡Link copiado al portapapeles!')
      }
    } catch (error) {
      console.log('Error sharing:', error)
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('¡Link copiado al portapapeles!')
      } catch (clipboardError) {
        console.log('Clipboard error:', clipboardError)
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <div className="pt-24 lg:pt-28 pb-24 lg:pb-8">
        <div className="container mx-auto px-4 lg:px-[70px]">
          {/* Back Button */}
          <div className="mb-6">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-base font-medium text-gray-900 hover:text-[#EE7215] transition-colors duration-200 group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform duration-200" />
              <span>Volver</span>
            </button>
          </div>

          {/* Title & Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              {/* Badge Paquete */}
              <div className="mb-2">
                <span className="inline-block text-xs font-light text-gray-600 uppercase tracking-wide bg-gray-100 border border-gray-200 px-2 py-1 rounded-md">
                  Paquete
                </span>
              </div>
              
              {/* Título Principal */}
              <h1 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">
                {packageData.name}
              </h1>
              
              {/* Rating e Localização */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4">
                {/* Rating */}
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-normal text-gray-900 text-sm">{packageData.rating}</span>
                  <span className="font-light text-gray-600 text-xs">({packageData.reviewCount} avaliaciones)</span>
                </div>
                
                {/* Localização */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:gap-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span className="font-normal text-gray-900 text-sm">{searchParams.get('destino') || 'Canasvieiras'}</span>
                  </div>
                  <span className="font-light text-gray-600 text-xs lg:ml-1">Florianópolis, Santa Catarina</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-4 lg:mt-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 font-normal"
                onClick={handleShare}
              >
                <Share className="w-4 h-4" />
                Compartir
              </Button>
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="mb-8">
            {/* Mobile: Carrossel Swipeable */}
            <div className="lg:hidden">
              <div className="relative">
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-2">
                  {packageData.images.map((image, index) => (
                    <div 
                      key={index} 
                      className="relative flex-shrink-0 w-full snap-start"
                      onClick={() => {
                        setCurrentImageIndex(index)
                        setShowAllPhotos(true)
                      }}
                    >
                      <Image
                        src={image}
                        alt={`Imagen ${index + 1}`}
                        width={400}
                        height={250}
                        className="w-full h-64 object-cover cursor-pointer rounded-xl"
                      />
                    </div>
                  ))}
                </div>
                {/* Indicadores de posição */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {packageData.images.map((_, index) => (
                    <div 
                      key={index} 
                      className="w-2 h-2 rounded-full bg-white/60"
                    />
                  ))}
                </div>
                {/* Botão Ver todas las fotos */}
                <button 
                  onClick={() => setShowAllPhotos(true)}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-medium text-gray-900 flex items-center gap-2 hover:bg-white transition-all"
                >
                  <Camera className="w-4 h-4" />
                  Ver todas
                </button>
              </div>
            </div>

            {/* Desktop: Grid Original */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-2 rounded-2xl overflow-hidden">
              {/* Main Image */}
              <div className="lg:col-span-2 lg:row-span-2 relative group">
                <Image
                  src={packageData.images[0]}
                  alt="Imagen principal"
                  width={800}
                  height={600}
                  className="w-full h-full object-cover cursor-pointer transition-all duration-300 group-hover:brightness-90"
                  onClick={() => setShowAllPhotos(true)}
                />
              </div>
              
              {/* Secondary Images */}
              {packageData.images.slice(1, 5).map((image, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={image}
                    alt={`Imagen ${index + 2}`}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover cursor-pointer transition-all duration-300 group-hover:brightness-90"
                    onClick={() => setShowAllPhotos(true)}
                  />
                  {index === 3 && packageData.images.length > 5 && (
                    <div 
                      className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer"
                      onClick={() => setShowAllPhotos(true)}
                    >
                      <div className="text-white text-center">
                        <Camera className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-sm font-medium">Ver todas las fotos</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-4">
              {/* Package Info with Badges */}
              <div className="pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <div className="inline-flex items-center gap-1.5 text-xs font-normal text-orange-700 bg-gradient-to-r from-orange-100 to-orange-200 px-2.5 py-1 rounded-full border border-orange-300 shadow-sm">
                    <Sun className="w-3 h-3 text-orange-600" />
                    4 días
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-normal text-blue-700 bg-gradient-to-r from-blue-100 to-blue-200 px-2.5 py-1 rounded-full border border-blue-300 shadow-sm">
                    <Bed className="w-3 h-3 text-blue-600" />
                    3 noches
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-normal text-green-700 bg-gradient-to-r from-green-100 to-green-200 px-2.5 py-1 rounded-full border border-green-300 shadow-sm">
                    <Shield className="w-3 h-3 text-green-600" />
                    Seguro incluido
                  </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex bg-gray-50 p-0.5 rounded-lg mb-3 max-w-fit">
                  <button
                    onClick={() => setActiveTab("descripcion")}
                    className={`px-3 py-1.5 text-sm font-normal rounded-md transition-all duration-200 ${
                      activeTab === "descripcion"
                        ? "bg-white text-[#EE7215] shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    Descripción
                  </button>
                  <button
                    onClick={() => setActiveTab("condiciones")}
                    className={`px-3 py-1.5 text-sm font-normal rounded-md transition-all duration-200 ${
                      activeTab === "condiciones"
                        ? "bg-white text-[#EE7215] shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    Condiciones
                  </button>
                  <button
                    onClick={() => setActiveTab("avaliaciones")}
                    className={`px-3 py-1.5 text-sm font-normal rounded-md transition-all duration-200 ${
                      activeTab === "avaliaciones"
                        ? "bg-white text-[#EE7215] shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    Avaliaciones
                  </button>
                </div>

                {/* Tab Content */}
                <div className="min-h-[120px]">
                  {activeTab === "descripcion" && (
                    <div className="space-y-2">
                      <p className="text-gray-700 text-sm font-light leading-relaxed">
                        {packageData.description}
                      </p>
                      <p className="text-gray-700 text-sm font-light leading-relaxed">
                        Ubicado a solo 50 metros de la playa de {destino}, nuestro hotel socio ofrece comodidad y 
                        practicidad para su estadía. Con piscina, restaurante y habitaciones espaciosas, tendrá todo lo que necesita 
                        para relajarse después de un día de playa o excursiones.
                      </p>
                      <p className="text-gray-700 text-sm font-light leading-relaxed">
                        El paquete incluye traslado de ida y vuelta del aeropuerto, desayuno completo todos los días, y dos 
                        excursiones exclusivas: un city tour por Florianópolis y un paseo en barco por la Bahía Norte con parada 
                        en la Isla del Francés.
                      </p>
                    </div>
                  )}
                  
                  {activeTab === "condiciones" && (
                    <div className="space-y-3">
                      <h4 className="font-normal text-gray-900 text-sm">Condiciones de cancelación</h4>
                      <p className="text-gray-700 text-sm font-light">Cancelación gratuita hasta 24 horas antes del viaje.</p>
                      
                      <h4 className="font-normal text-gray-900 text-sm mt-4">Política de equipaje</h4>
                      <p className="text-gray-700 text-sm font-light">Incluye 1 maleta de hasta 23kg por persona.</p>
                      
                      <h4 className="font-normal text-gray-900 text-sm mt-4">Requisitos</h4>
                      <ul className="list-disc list-inside text-gray-700 text-sm font-light space-y-1">
                        <li>Documento de identidad válido</li>
                        <li>Vacunas al día (consultar requisitos actuales)</li>
                        <li>Seguro de viaje incluido en el paquete</li>
                      </ul>
                    </div>
                  )}
                  
                  {activeTab === "avaliaciones" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-gray-900">{packageData.rating}</div>
                        <div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <div className="text-xs font-light text-gray-600">{packageData.reviewCount} avaliaciones</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="border-b border-gray-200 pb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                            <div>
                              <div className="font-normal text-gray-900 text-sm">María González</div>
                              <div className="text-xs font-light text-gray-600">Hace 2 semanas</div>
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm font-light">Excelente experiencia, el hotel muy limpio y el personal muy amable. Los passeios fueron increíbles!</p>
                        </div>
                        
                        <div className="border-b border-gray-200 pb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                            <div>
                              <div className="font-normal text-gray-900 text-sm">Carlos Silva</div>
                              <div className="text-xs font-light text-gray-600">Hace 1 mes</div>
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm font-light">Perfecto para familias. Los niños se divirtieron mucho en la piscina y la playa está muy cerca.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* O que este pacote oferece - New Section */}
              <div className="pb-8 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Qué ofrece este paquete
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packageData.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-3 py-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-[#EE7215] rounded-full"></div>
                      </div>
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comodidades */}
              <div className="pb-8 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Comodidades
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {packageData.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3 py-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <amenity.icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-gray-700">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Localización */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Ubicación
                </h3>
                <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center mb-3 relative overflow-hidden">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-light">Mapa interativo em breve</p>
                    <p className="text-sm text-gray-500 font-light">{searchParams.get('destino') || 'Canasvieiras'}, Florianópolis</p>
                  </div>
                  <button 
                    className="absolute bottom-3 right-3 bg-white px-3 py-1.5 rounded-lg shadow-sm text-sm font-normal text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      // Placeholder para abrir no Google Maps
                      const destino = searchParams.get('destino') || 'Canasvieiras'
                      const url = `https://www.google.com/maps/search/${encodeURIComponent(destino + ', Florianópolis, Santa Catarina')}`
                      window.open(url, '_blank')
                    }}
                  >
                    Ver en Maps
                  </button>
                </div>
                <div className="text-sm text-gray-600 font-light space-y-1">
                  <p>• A solo 50 metros de la playa</p>
                  <p>• 2.6 km del centro de Florianópolis</p>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-5">
                  {temMultiplosQuartos ? (
                    /* Layout para Múltiplos Quartos - IGUAL ao card de resultados */
                    <>
                      <div className="mb-4">
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Desglose por cuarto:</h4>
                        
                        {quartosIndividuais.map((quarto: any, quartoIndex: number) => {
                          const precoQuartoCalculado = calcularPrecoQuarto(quarto)
                          const tipoQuarto = determinarTipoQuarto(quarto)
                          const ocupacao = formatarOcupacaoQuarto(quarto)
                          
                          return (
                            <div key={quartoIndex} className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-5 h-5 bg-[#EE7215] rounded-lg flex items-center justify-center">
                                  <Bed className="w-3 h-3 text-white" />
                                </div>
                                <div className="text-left">
                                  <div className="text-sm font-bold text-gray-800">
                                    🛏️ Cuarto {quartoIndex + 1}: {ocupacao}
                                  </div>
                                  <div className="text-xs text-gray-600 font-medium">
                                    {tipoQuarto}
                                  </div>
                                </div>
                              </div>
                              <div className="text-base font-black text-[#EE7215]">
                                $ {precoQuartoCalculado.toLocaleString()}
                              </div>
                            </div>
                          )
                        })}
                        
                        {/* Total destacado */}
                        <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-[#EE7215]/10 to-[#F7931E]/10 rounded-xl border-2 border-[#EE7215]/30 hover:border-[#EE7215]/50 transition-all duration-200">
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-gradient-to-r from-[#EE7215] to-[#F7931E] rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs font-black">💰</span>
                            </div>
                            <div className="text-base font-black text-gray-900">
                              Total ({quartos} cuartos)
                            </div>
                          </div>
                          <div className="text-xl font-black text-[#EE7215]">
                            $ {precoTotalReal.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="text-sm font-medium text-gray-600 mb-3">
                        Total para {adultos} Adultos, {totalCriancas} Niños en {quartos} cuartos
                      </div>
                    </>
                  ) : (
                    /* Layout para Quarto Único */
                    <>
                      <div className="mb-4">
                        <h4 className="text-sm font-normal text-gray-900 mb-2">Habitación</h4>
                        <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded-lg">
                          <div className="w-4 h-4 bg-[#EE7215] rounded flex items-center justify-center">
                            <Bed className="w-2.5 h-2.5 text-white" />
                          </div>
                          <div>
                            <div className="text-xs font-normal text-gray-800">
                              {determinarTipoQuarto(quartosIndividuais[0])}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-normal text-gray-900 mb-2">Personas</h4>
                        <div className="text-sm font-light text-gray-700">
                          {formatarOcupacaoQuarto(quartosIndividuais[0])}
                        </div>
                      </div>

                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        $ {precoTotalReal.toLocaleString()}
                      </div>
                      <div className="text-xs font-light text-gray-600 mb-3">
                        Total para {formatarOcupacaoQuarto(quartosIndividuais[0])}
                      </div>
                    </>
                  )}

                  <div className="inline-flex items-center gap-1.5 text-xs font-normal text-green-700 bg-gradient-to-r from-green-100 to-green-200 px-2.5 py-1 rounded-full border border-green-300 shadow-sm mb-3">
                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
                    Todo incluido • Bus + Hotel
                  </div>

                  {/* Travel Date */}
                  <div className="mb-4">
                    <div className="border border-gray-300 rounded-lg p-2.5">
                      <label className="text-xs font-light text-gray-600 uppercase">Día de salida</label>
                      <div className="text-sm font-normal text-gray-900 mt-1">
                        {new Date(packageData.dataViagem).toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Book Button */}
                  <button className="relative w-full bg-gradient-to-r from-[#FF6B35] via-[#EE7215] to-[#F7931E] hover:from-[#FF5722] hover:via-[#E65100] hover:to-[#FF8F00] text-white font-bold py-3 px-6 rounded-xl shadow-[0_6px_20px_rgba(238,114,21,0.4)] hover:shadow-[0_8px_25px_rgba(238,114,21,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] transform-gpu overflow-hidden group/btn mb-3">
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                    
                    <span className="relative flex items-center justify-center gap-2 text-sm">
                      <span className="font-bold tracking-wide">Reservar</span>
                    </span>
                  </button>

                  <p className="text-center text-xs font-light text-gray-600 mb-3">
                    No se cobrará aún
                  </p>

                  {/* Price Breakdown */}
                  <div className="space-y-2 text-xs border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-light text-gray-600">$ {precoTotalReal.toLocaleString()} x 1 paquete</span>
                      <span className="font-normal text-gray-900">$ {precoTotalReal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm border-t border-gray-200 pt-2">
                      <span>Total</span>
                      <span>$ {precoTotalReal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Award className="w-5 h-5 text-blue-600" />
                    <span>Paquete verificado y aprobado</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span>Atención personalizada por WhatsApp</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Overlay */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <div className="text-sm font-light text-gray-600">Precio total</div>
            <div className="text-lg font-bold text-gray-900">$ {precoTotalReal.toLocaleString()}</div>
            <div className="text-xs font-light text-gray-600">
              {temMultiplosQuartos 
                ? `${adultos} Adultos, ${totalCriancas} Niños en ${quartos} cuartos`
                : formatarOcupacaoQuarto(quartosIndividuais[0])
              }
            </div>
          </div>
          <div className="flex flex-col items-center">
            <button className="relative bg-gradient-to-r from-[#FF6B35] via-[#EE7215] to-[#F7931E] hover:from-[#FF5722] hover:via-[#E65100] hover:to-[#FF8F00] text-white font-bold py-2.5 px-6 rounded-xl shadow-[0_6px_20px_rgba(238,114,21,0.4)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] transform-gpu overflow-hidden group/btn mb-1">
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
              
              <span className="relative flex items-center justify-center gap-2 text-sm">
                <span className="font-bold tracking-wide">Reservar</span>
              </span>
            </button>
            <p className="text-xs font-light text-gray-600">No se cobrará aún</p>
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {showAllPhotos && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Header com botões */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
            <button 
              onClick={() => setShowAllPhotos(false)}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-all flex items-center gap-2"
            >
              <ChevronLeft className="w-6 h-6" />
              <span className="text-sm font-medium">Volver</span>
            </button>
            
            <button 
              onClick={() => setShowAllPhotos(false)}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-all"
            >
              ×
            </button>
          </div>
          
          <div 
            className="relative w-full h-full flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <button 
              onClick={prevImage}
              className="absolute left-4 text-white hover:bg-white/20 p-3 rounded-full z-10 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <Image
              src={packageData.images[currentImageIndex]}
              alt={`Foto ${currentImageIndex + 1}`}
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain select-none"
            />
            
            <button 
              onClick={nextImage}
              className="absolute right-4 text-white hover:bg-white/20 p-3 rounded-full z-10 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {currentImageIndex + 1} / {packageData.images.length}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
} 