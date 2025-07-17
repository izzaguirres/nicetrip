"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image, { StaticImageData } from "next/image"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getHospedagemData } from "@/lib/hospedagens-service"
import { packageConditionsService } from "@/lib/package-conditions-service"
import { packageDescriptionService } from "@/lib/package-description-service"
import { calculateFinalPrice, calculateInstallments } from "@/lib/utils"
import { getHotelData } from '@/lib/hotel-data';
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
  PlusCircle,
  Shield,
  Award,
  Clock,
  Camera,
  Bed,
  Sun,
  Moon,
  ArrowRight,
  AirVent,
  Tv,
  Refrigerator,
  Waves,
  Sparkles,
  ChefHat,
  Bath,
  Flame,
  Gamepad2,
  Circle,
  MessageCircle,
  Plane,
  Bus
} from "lucide-react"
import dynamic from 'next/dynamic'

const MapDisplay = dynamic(() => import('@/components/ui/map-display'), {
  ssr: false,
  loading: () => <div className="bg-gray-200 animate-pulse w-full h-full rounded-xl"></div>
});

export default function DetalhesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const [activeTab, setActiveTab] = useState("descripcion")
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const [hospedagemData, setHospedagemData] = useState<any>(null);
  const [packageConditions, setPackageConditions] = useState<any>(null)
  const [packageDescription, setPackageDescription] = useState<{titulo: string, descripcion: string} | null>(null)
  const [showConditionsModal, setShowConditionsModal] = useState(false)
  const [selectedConditionType, setSelectedConditionType] = useState<'cancelacion' | 'equipaje' | 'documentos' | null>(null)
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);

  // Dados dinâmicos da URL (movidos para o topo)
  const hotelName = searchParams.get('hotel') || 'Hotel Premium'
  const displayName = getHotelData(hotelName)?.displayName || hotelName;
  const destino = searchParams.get('destino') || 'Florianópolis'
  const preco = parseInt(searchParams.get('preco') || '0')
  const transporte = searchParams.get('transporte') || 'Bús'
  const saida = searchParams.get('salida') || 'Buenos Aires';
  const valorDiaria = parseFloat(searchParams.get('valor_diaria') || '0');
  const checkin = searchParams.get('checkin');
  const checkout = searchParams.get('checkout');
  
  // Dados de quartos e pessoas (movidos para o topo)
  const quartos = parseInt(searchParams.get('quartos') || '1')
  const adultos = parseInt(searchParams.get('adultos') || '2')
  const criancas_0_3 = parseInt(searchParams.get('criancas_0_3') || '0')
  const criancas_4_5 = parseInt(searchParams.get('criancas_4_5') || '0')
  const criancas_6 = parseInt(searchParams.get('criancas_6') || '0')
  
  const ADDITIONAL_SERVICES = [
    { id: 1, name: 'Butaca Cama', description: 'assento reclinável tipo cama', price: 100, icon: Bed },
    { id: 2, name: 'Butaca Especial Panorámica', description: 'frente al bus, com cafetera', price: 50, icon: Coffee },
    { id: 3, name: 'Media Pensión', description: 'Cenas restantes en el hotel', price: 90, icon: Utensils },
    { id: 4, name: 'Pack de 2 Actividades', description: 'experiências extras no destino', price: 70, icon: Waves },
    { id: 5, name: '6 Cenas + 2 Actividades', description: 'PROMOÇÃO', price: 120, icon: Sparkles },
  ];

  const handleAddonToggle = (serviceId: number) => {
    setSelectedAddons(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const addonsPrice = 0; // Adicionais não se aplicam a hospedagem

  // ✅ NOVO: Detectar se estamos no cliente (resolver hidratação)
  useEffect(() => {
    setIsClient(true)
  }, [])

  // ✅ NOVO: Fechar modal com tecla ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showAllPhotos) {
        setShowAllPhotos(false)
      }
    }

    if (showAllPhotos) {
      document.addEventListener('keydown', handleKeyDown)
      // Impedir scroll da página quando modal está aberta
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'auto'
    }
  }, [showAllPhotos])
  
  // Calcular noites a partir do check-in e checkout da URL
  const noitesCalculadas = (checkin && checkout) 
    ? Math.max(1, Math.ceil((new Date(checkout).getTime() - new Date(checkin).getTime()) / (1000 * 3600 * 24)))
    : 0;
  
  const totalCriancas = criancas_0_3 + criancas_4_5 + criancas_6
  const totalPessoas = adultos + totalCriancas
  const temMultiplosQuartos = quartos > 1

  // Função para distribuir pessoas pelos quartos (igual ao card de resultados)
  const getQuartosIndividuais = () => {
    const quartosEspecificos = searchParams.get('rooms_config')
    
    if (quartosEspecificos) {
      try {
        const configDecoded = JSON.parse(decodeURIComponent(quartosEspecificos))
        if (Array.isArray(configDecoded) && configDecoded.length > 0) {
            console.log('🎯 CONFIGURAÇÃO ESPECÍFICA ENCONTRADA:', configDecoded)
            return configDecoded.map((room: any, index: number) => ({
              numero: index + 1,
              adultos: room.adults || 0,
              criancas_0_3: room.children_0_3 || 0,
              criancas_4_5: room.children_4_5 || 0,
              criancas_6: room.children_6 || 0
            }));
        }
      } catch (error) {
        console.log('⚠️ Erro ao decodificar configuração específica, usando fallback:', error)
      }
    }
    
    // ✅ FALLBACK ROBUSTO: Sempre executa se a lógica acima falhar ou não retornar.
    console.log('📊 USANDO DISTRIBUIÇÃO AUTOMÁTICA DE FALLBACK')
    const quartos = parseInt(searchParams.get('quartos') || '1');
    const adultos = parseInt(searchParams.get('adultos') || '2');
    const criancas_0_3 = parseInt(searchParams.get('criancas_0_3') || '0');
    const criancas_4_5 = parseInt(searchParams.get('criancas_4_5') || '0');
    const criancas_6 = parseInt(searchParams.get('criancas_6') || '0');

    const quartosArray = []
    let adultosRestantes = adultos;
    let criancas_0_3_restantes = criancas_0_3;
    let criancas_4_5_restantes = criancas_4_5;
    let criancas_6_restantes = criancas_6;

    for (let i = 0; i < quartos; i++) {
      const adultosNesteQuarto = Math.floor(adultosRestantes / (quartos - i));
      const criancas03NesteQuarto = Math.floor(criancas_0_3_restantes / (quartos - i));
      const criancas45NesteQuarto = Math.floor(criancas_4_5_restantes / (quartos - i));
      const criancas6NesteQuarto = Math.floor(criancas_6_restantes / (quartos - i));
      
      quartosArray.push({
        numero: i + 1,
        adultos: adultosNesteQuarto,
        criancas_0_3: criancas03NesteQuarto,
        criancas_4_5: criancas45NesteQuarto,
        criancas_6: criancas6NesteQuarto
      })

      adultosRestantes -= adultosNesteQuarto;
      criancas_0_3_restantes -= criancas03NesteQuarto;
      criancas_4_5_restantes -= criancas45NesteQuarto;
      criancas_6_restantes -= criancas6NesteQuarto;
    }

    if(adultosRestantes > 0) quartosArray[0].adultos += adultosRestantes;
    if(criancas_0_3_restantes > 0) quartosArray[0].criancas_0_3 += criancas_0_3_restantes;
    if(criancas_4_5_restantes > 0) quartosArray[0].criancas_4_5 += criancas_4_5_restantes;
    if(criancas_6_restantes > 0) quartosArray[0].criancas_6 += criancas_6_restantes;

    return quartosArray
  }

  // Busca os dados do hotel (nome e imagens) do nosso mapa central
  const hotelData = getHotelData(hotelName);
  const packageImages = hotelData?.imageFiles || [
    // Fallback para hotéis sem imagens - usar Unsplash
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80"
  ];

  console.log('--- DEBUG DE IMAGENS ---');
  console.log(`Hotel: ${hotelName} -> Buscando por: ${displayName}`);
  console.log(`Imagens encontradas:`, packageImages.length);
  console.log('-------------------------');
  
  const quartosIndividuais = getQuartosIndividuais()

  // ✅ CARREGAR COMODIDADES REAIS DO HOTEL
  useEffect(() => {
    const carregarHospedagem = async () => {
      try {
        // Usa o displayName, que é o nome limpo e oficial
        const data = await getHospedagemData(displayName)
        setHospedagemData(data);
      } catch (error) {
        console.error('Erro ao carregar dados da hospedagem:', error)
      }
    }
    
    carregarHospedagem()
  }, [displayName])

  // ✅ CARREGAR CONDIÇÕES DINÂMICAS DO PACOTE
  useEffect(() => {
    const carregarCondicoes = async () => {
      try {
        console.log('🚀 CONDITIONS: Iniciando busca para transporte:', transporte)
        // Normalizar transporte (Bús -> Bus)
        const transporteNormalizado = transporte === 'Bús' ? 'Bus' : transporte
        console.log('🔧 CONDITIONS: Transporte normalizado:', transporte, '->', transporteNormalizado)
        console.log('🎯 CONDITIONS: Vai buscar pelos IDs 3 e 4 com transporte:', transporteNormalizado)
        
        const conditions = await packageConditionsService.getConditions(transporteNormalizado as 'Bus' | 'Aéreo')
        setPackageConditions(conditions)
        console.log('📋 CONDITIONS: Condições finais setadas:', conditions)
      } catch (error) {
        console.error('❌ CONDITIONS: Erro ao carregar condições:', error)
        setPackageConditions(null)
      }
    }
    
    if (transporte) {
      carregarCondicoes()
    } else {
      console.log('⚠️ CONDITIONS: Transporte não definido ainda')
    }
  }, [transporte])

  // ✅ CARREGAR DESCRIÇÕES DINÂMICAS DO PACOTE
  useEffect(() => {
    const carregarDescricoes = async () => {
      try {
        console.log('🚀 DESCRIPTIONS: Iniciando busca para:', { transporte, destino, hotelName })
        // Normalizar transporte (Bús -> Bus)
        const transporteNormalizado = transporte === 'Bús' ? 'Bus' : transporte
        console.log('🔧 DESCRIPTIONS: Transporte normalizado:', transporte, '->', transporteNormalizado)
        console.log('🎯 DESCRIPTIONS: Vai buscar com transporte normalizado:', transporteNormalizado)
        
        const description = await packageDescriptionService.getDescription(
          transporteNormalizado as 'Bus' | 'Aéreo',
          destino,
          hotelName
        )
        setPackageDescription(description)
        console.log('📋 DESCRIPTIONS: Descrição final setada:', description)
        console.log('🎯 DESCRIPTIONS: Título:', description.titulo)
        console.log('🎯 DESCRIPTIONS: Descrição detalhada preview:', description.descripcion.substring(0, 100) + '...')
      } catch (error) {
        console.error('❌ DESCRIPTIONS: Erro ao carregar descrição:', error)
        setPackageDescription(null)
      }
    }
    
    if (transporte && destino && hotelName) {
      carregarDescricoes()
    } else {
      console.log('⚠️ DESCRIPTIONS: Dados ainda não completos:', { transporte, destino, hotelName })
    }
  }, [transporte, destino, hotelName])
  
  // 💰 O preço total real é o preço que vem da URL, já calculado na página de resultados.
  const precoTotalReal = preco;

  console.log('💰 DEBUG PREÇO DETALHES:')
  console.log('  - Preço da URL (Final):', precoTotalReal)
  
  console.log('🚌 DEBUG TRANSPORTE:')
  console.log('  - Transporte da URL:', transporte)
  console.log('  - É Aéreo?:', transporte === 'Aéreo')
  console.log('  - É Bus?:', transporte === 'Bus')
  console.log('  - É Bús?:', transporte === 'Bús')
  
  console.log('📋 DEBUG CONDIÇÕES:')
  console.log('  - packageConditions:', packageConditions)
  console.log('  - packageConditions existe?:', !!packageConditions)
  
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

  // ✅ FUNÇÃO PARA MAPEAR ÍCONES DAS COMODIDADES
  // ✅ FUNÇÃO PARA PROCESSAR FORMATAÇÃO MARKDOWN
  const processMarkdownFormatting = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **texto** -> <strong>texto</strong>
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // *texto* -> <em>texto</em>  
      .replace(/\n/g, '<br />'); // quebras de linha simples
  }

  // ✅ FUNÇÃO PARA ABRIR MODAL COM CONDIÇÕES COMPLETAS
  const openConditionsModal = (type: 'cancelacion' | 'equipaje' | 'documentos') => {
    setSelectedConditionType(type)
    setShowConditionsModal(true)
    document.body.style.overflow = 'hidden' // Prevenir scroll do body
  }

  // ✅ FUNÇÃO PARA FECHAR MODAL
  const closeConditionsModal = () => {
    setShowConditionsModal(false)
    setSelectedConditionType(null)
    document.body.style.overflow = 'unset' // Restaurar scroll do body
  }

  // ✅ FECHAR MODAL DE CONDIÇÕES COM ESC
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

  const getIconComponent = (icone: string) => {
    const iconMap: { [key: string]: any } = {
      'wifi': Wifi,
      'aire': AirVent,
      'tv': Tv,
      'fridge': Refrigerator,
      'pool': Waves,
      'restaurant': ChefHat,
      'safe': Shield,
      'cleaning': Sparkles,
      'reception': Clock,
      'parking': Car,
      'kitchen': Utensils,
      'hot_tub': Bath,
      'bbq': Flame,
      'gamepad': Gamepad2,
    }
    
    return iconMap[icone] || Circle // Fallback para um círculo genérico
  }
  
  // Conteúdo dinâmico baseado no tipo de transporte e dados reais
  const getStaticPackageContent = () => {
    const isAereo = transporte === 'Aéreo'
    
    // Prioriza a descrição dinâmica do Supabase
    const finalDescription = packageDescription?.descripcion 
      ? packageDescription.descripcion
      : isAereo 
        ? `Experimente ${destino} com máximo confort! Nosso paquete aéreo premium incluye vuelos directos, hospedaje en ${hotelName} y ${noitesCalculadas} noches de relajación. Desayunos completos, tours exclusivos y todas las comodidades para que vivas unas vacaciones perfectas.`
        : `¡Vive la experiencia completa en ${destino}! Nuestro paquete en bus te ofrece ${noitesCalculadas} días de aventura, incluyendo ${noitesCalculadas} noches de hospedaje en ${hotelName}. Transporte cómodo con aire acondicionado, desayunos incluidos y tiempo suficiente para explorar cada rincón de esta paradisíaca playa.`;

    return {
      description: finalDescription,
      
      highlights: [
        transporte === 'Aéreo' ? "Viaje cómodo en avión premium" : "Viaje cómodo en bus premium",
        "Snack a bordo",
        "Alojamiento",
        "Coordinación en viaje y en destino",
        "Guias locales bilingües",
        "Kit de viaje",
        "Asistencia al viajero (ver mayores de 70 años)"
      ],
      
      includes: isAereo 
        ? [
            `Vuelos ida y vuelta`,
            `Hospedaje por ${noitesCalculadas} noches`,
            "Transfers aeropuerto-hotel",
            "Desayuno completo todos los días",
            "Seguro de viaje incluido"
          ]
        : [
            `Transporte en bus premium`,
            `Hospedaje por ${noitesCalculadas} noches`,
            "Viaje con aire acondicionado",
            "Desayuno completo todos los días",
            "Seguro de viaje incluido"
          ],

      condiciones: packageConditions || (isAereo 
        ? {
            cancelacion: "Cancelación gratuita hasta 72 horas antes del vuelo.",
            equipaje: "Incluye 1 maleta de hasta 23kg por persona en vuelo.",
            documentos: "Documento de identidad válido y confirmación de vuelo."
          }
        : {
            cancelacion: "Cancelación gratuita hasta 24 horas antes del viaje.",
            equipaje: "Equipaje sin restricciones de peso en bus.",
            documentos: "Solo documento de identidad válido requerido."
          })
    }
  }

  // Remove the now-redundant function
  // const staticContent = getStaticPackageContent()
  
  const packageData = {
    id: searchParams.get('id') || '1',
    name: displayName,
    location: `${destino}, Santa Catarina`,
    hotel: displayName, // Usar o nome limpo aqui também
    rating: 4.9,
    reviewCount: 127,
    price: preco,
    originalPrice: preco + 350,
    dataViagem: searchParams.get('data') || '2025-10-02',
    images: packageImages,
    description: packageDescription?.descripcion || "Cargando descripción...", // Use dynamic description
    highlights: [
        transporte === 'Aéreo' ? "Viaje cómodo en avión premium" : "Viaje cómodo en bus premium",
        "Snack a bordo",
        "Alojamiento",
        "Coordinación en viaje y en destino",
        "Guias locales bilingües",
        "Kit de viaje",
        "Asistencia al viajero (ver mayores de 70 años)"
      ],
    amenities: hospedagemData?.comodidades?.map((comodidade: any) => ({
      icon: getIconComponent(comodidade.icone),
      name: comodidade.nome
    })) || [],
    condiciones: packageConditions,
    duration: `${noitesCalculadas} noches`
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

  // ✅ FUNÇÃO PARA FORMATAÇÃO SEGURA DE PREÇOS (resolve hidratação)
  const formatPrice = (value: number): string => {
    if (!isClient) {
      // No servidor, usar formatação simples
      return value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    }
    // No cliente, usar toLocaleString brasileiro
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }

  const formatPriceWithCurrency = (value: number): string => {
    return `R$ ${formatPrice(value)}`;
  }

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: `${packageData.name} - Nice Trip`,
      text: `¡Mira este increíble paquete en ${destino}! Desde $ ${formatPrice(packageData.price)}`,
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
      <div className="pt-24 lg:pt-28 pb-12 lg:pb-8">
        <div className="container mx-auto px-4 lg:px-[70px]">
          {/* Back & Share Buttons */}
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

          {/* Photo Gallery */}
          <div className="mb-8">
            {/* Mobile: Carrossel Swipeable */}
            <div className="lg:hidden">
              <div className="relative">
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-2">
                  {packageData.images.map((image: string | StaticImageData, index) => (
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
                        width={800}
                        height={600}
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
            <div className="hidden lg:grid lg:grid-cols-4 lg:grid-rows-2 gap-2 h-[550px] rounded-2xl overflow-hidden">
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
              {packageData.images.slice(1, 5).map((image: string | StaticImageData, index: number) => (
                <div key={index} className="relative group h-full w-full">
                  <Image
                    src={image}
                    alt={`Imagen ${index + 2}`}
                    width={400}
                    height={300}
                    className={`w-full h-full object-cover cursor-pointer transition-all duration-300 group-hover:brightness-90`}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-8">

              {/* Title Section - CENTRALIZED */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex flex-col items-center space-y-2">
                  <div>
                    <span className="inline-block text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-full">
                      Alojamiento
                    </span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    {packageData.name}
                  </h1>
                  <p className="text-lg text-gray-500">{packageData.location}</p>
                </div>
                
                {/* Review Info */}
                <div className="flex items-center justify-center space-x-4 md:space-x-6">
                  <div className="flex flex-col items-center space-y-1">
                    <span className="font-bold text-sm text-gray-900">{packageData.rating}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                    </div>
                  </div>
                  <div className="w-px h-10 bg-gray-200"></div>
                  <div className="text-sm font-medium text-gray-900 text-center w-28">
                    Habitaciones completas
                  </div>
                  <div className="w-px h-10 bg-gray-200"></div>
                  <div className="flex flex-col items-center space-y-1">
                    <span className="font-bold text-sm text-gray-900">{packageData.reviewCount}</span>
                    <span className="text-xs text-gray-600">avaliaciones</span>
                  </div>
                </div>

                {/* Duration */}
                 <div className="flex items-center gap-4 pt-2">
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Moon className="w-5 h-5 text-gray-900" />
                    <span>{noitesCalculadas} noches</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              {hospedagemData?.comodidades && hospedagemData.comodidades.length > 0 && (
                <>
                  <div id="comodidades">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                      Qué ofrece este lugar
                    </h3>
                    <div className="flex flex-wrap justify-center gap-3">
                      {packageData.amenities.map((amenity: any, index: number) => {
                        const IconComponent = amenity.icon || Circle;
                        return (
                          <div key={index} className="flex items-center gap-2 bg-gray-100 border border-gray-200/80 rounded-full px-4 py-2">
                            <IconComponent className="w-4 h-4 text-gray-800 flex-shrink-0" />
                            <span className="text-gray-800 text-sm font-medium">{amenity.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="border-t border-gray-200"></div>
                </>
              )}

              {/* Package Info with Tabs */}
              <div className="pb-4">
                {/* Tabs Navigation */}
                <div className="flex justify-center mb-6">
                  <div className="flex bg-gray-100 p-1 rounded-lg shadow-inner">
                    <button
                      onClick={() => setActiveTab("descripcion")}
                      className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                        activeTab === "descripcion"
                          ? "bg-white text-orange-600 shadow-md"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Descripción
                    </button>
                    <button
                      onClick={() => setActiveTab("condiciones")}
                      className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                        activeTab === "condiciones"
                          ? "bg-white text-orange-600 shadow-md"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Condiciones
                    </button>
                    <button
                      onClick={() => setActiveTab("avaliaciones")}
                      className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                        activeTab === "avaliaciones"
                          ? "bg-white text-orange-600 shadow-md"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Avaliaciones
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="min-h-[120px]">
                  {activeTab === "descripcion" && (
                    <div className="space-y-3">
                      <div className="text-gray-700 text-sm font-light leading-relaxed">
                        {packageDescription?.descripcion ? (
                          <div 
                            className="prose prose-sm max-w-none text-gray-700"
                            dangerouslySetInnerHTML={{ 
                              __html: processMarkdownFormatting(packageDescription.descripcion)
                            }} 
                          />
                        ) : (
                          // Fallback
                          <p>
                            {`¡Vive la experiencia completa en ${destino}! Nuestro paquete te ofrece días de aventura, incluyendo hospedaje en ${hotelName}. Transporte cómodo, desayunos incluidos y tiempo suficiente para explorar cada rincón de esta paradisíaca playa.`}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {activeTab === "condiciones" && (
                    <div className="space-y-4">
                      {packageConditions ? (
                        // ✅ CONDIÇÕES DINÂMICAS DO SUPABASE
                        <>
                          {/* Condiciones de Cancelación */}
                          <div className="border-b border-gray-100 pb-3">
                            <h4 className="font-normal text-gray-900 text-sm mb-2">Condiciones de cancelación</h4>
                            <p className="text-gray-700 text-sm font-light mb-2">{packageConditions.cancelacion}</p>
                          </div>

                          {/* Política de Equipaje */}
                          <div className="border-b border-gray-100 pb-3">
                            <h4 className="font-normal text-gray-900 text-sm mb-2">Política de equipaje</h4>
                            <p className="text-gray-700 text-sm font-light mb-2">{packageConditions.equipaje}</p>
                          </div>

                          {/* Requisitos */}
                          <div className="pt-2">
                            <h4 className="font-normal text-gray-900 text-sm mb-2">Requisitos</h4>
                            <ul className="list-disc list-inside text-gray-700 text-sm font-light space-y-1 mb-2">
                              <li>{packageConditions.documentos}</li>
                              <li>Vacunas al día (consultar requisitos actuales)</li>
                              <li>Seguro de viaje incluido en el paquete</li>
                            </ul>
                            {(packageConditions.documentos_completa || packageConditions.equipaje_completa || packageConditions.cancelacion_completa) && (
                              <div className="mt-4">
                                <button
                                  onClick={() => openConditionsModal('documentos')}
                                  className="text-[#EE7215] hover:text-[#E65100] text-sm font-medium underline decoration-1 underline-offset-2 transition-colors"
                                >
                                  Ver Condiciones Completas
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      ) : packageConditions === null && transporte ? (
                        // ✅ LOADING STATE
                        <div className="flex items-center gap-2 py-4">
                          <div className="w-4 h-4 border-2 border-[#EE7215] border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-gray-500 text-sm">Cargando condiciones personalizadas...</span>
                        </div>
                      ) : (
                        // ✅ FALLBACK ESTÁTICO
                        <div className="space-y-4">
                          <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded mb-4">
                            <p className="text-sm text-blue-700 font-medium">
                              📋 Condiciones no disponibles en base de datos - usando contenido estático
                            </p>
                          </div>
                          
                          {/* Condiciones de Cancelación */}
                          <div className="border-b border-gray-100 pb-3">
                            <h4 className="font-normal text-gray-900 text-sm mb-2">Condiciones de cancelación</h4>
                            <p className="text-gray-700 text-sm font-light mb-2">
                              {transporte === 'Aéreo' 
                                ? "Cancelación gratuita hasta 72 horas antes del vuelo."
                                : "Cancelación gratuita hasta 24 horas antes del viaje."
                              }
                            </p>
                          </div>

                          {/* Política de Equipaje */}
                          <div className="border-b border-gray-100 pb-3">
                            <h4 className="font-normal text-gray-900 text-sm mb-2">Política de equipaje</h4>
                            <p className="text-gray-700 text-sm font-light mb-2">
                              {transporte === 'Aéreo' 
                                ? "Incluye 1 maleta de hasta 23kg por persona en vuelo."
                                : "Equipaje sin restricciones de peso en bus."
                              }
                            </p>
                          </div>

                          {/* Requisitos */}
                          <div>
                            <h4 className="font-normal text-gray-900 text-sm mb-2">Requisitos</h4>
                            <ul className="list-disc list-inside text-gray-700 text-sm font-light space-y-1 mb-2">
                              <li>
                                {transporte === 'Aéreo' 
                                  ? "Documento de identidad válido y confirmación de vuelo."
                                  : "Solo documento de identidad válido requerido."
                                }
                              </li>
                              <li>Vacunas al día (consultar requisitos actuales)</li>
                              <li>Seguro de viaje incluido en el paquete</li>
                            </ul>
                          </div>
                        </div>
                      )}
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

              {/* Localización */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  Ubicación
                </h3>
                <div className="bg-gray-100 rounded-xl h-60 md:h-80 flex items-center justify-center mb-3 relative overflow-hidden">
                  {hospedagemData?.latitude && hospedagemData?.longitude ? (
                    <MapDisplay 
                      latitude={hospedagemData.latitude}
                      longitude={hospedagemData.longitude}
                      hotelName={hotelName}
                    />
                  ) : (
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 font-light">Mapa interativo em breve</p>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-600 font-light space-y-1">
                  {hospedagemData?.distancia_praia && <p>• A solo {hospedagemData.distancia_praia} metros de la playa</p>}
                  <p>• {destino}, Santa Catarina</p>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-[#EEEEEE] border border-gray-200 rounded-3xl p-6 shadow-lg">
                  {/* Preço Total */}
                  <div className="text-center mb-6">
                    <h3 className="text-4xl font-bold text-gray-900 font-manrope">
                      {formatPriceWithCurrency(precoTotalReal)}
                    </h3>
                    <p className="text-sm text-gray-600">Valor total</p>
                  </div>
                  
                  {/* Detalhes da Reserva (Condicional) */}
                  <div className="mb-6 space-y-3">
                    <div className="flex justify-between gap-4">
                      <div className="w-1/2 text-left">
                        <p className="text-sm text-gray-600 mb-1">Check-in</p>
                        <div className="bg-white rounded-xl p-2 text-center">
                          <p className="font-medium text-gray-900 text-sm">{checkin ? new Date(checkin + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</p>
                        </div>
                      </div>
                      <div className="w-1/2 text-left">
                        <p className="text-sm text-gray-600 mb-1">Check-out</p>
                        <div className="bg-white rounded-xl p-2 text-center">
                          <p className="font-medium text-gray-900 text-sm">{checkout ? new Date(checkout + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {checkin && checkout && (
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <Bed className="w-5 h-5 text-gray-700" />
                        <p className="font-medium text-gray-900">
                          Hospedagem <span className="text-gray-500 font-normal">&gt;</span> {noitesCalculadas} Noches
                        </p>
                      </div>
                    )}
                  </div>


                  {/* Desglose por cuarto */}
                  <div className="bg-white rounded-2xl p-4 mb-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Desglose por cuarto</h4>
                    <div className="space-y-4">
                      {quartosIndividuais.map((quarto: any, quartoIndex: number) => {
                          const tipoQuarto = searchParams.get('quarto_tipo') || determinarTipoQuarto(quarto);
                          const criancas0a5nesteQuarto = quarto.criancas_0_3 + quarto.criancas_4_5;

                          return (
                            <div key={quartoIndex} className="border-t border-gray-100 pt-3">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-orange-600 flex items-center gap-2">
                                  <Bed className="w-4 h-4" />
                                  Cuarto {quartoIndex + 1}: <span className="text-gray-800">{tipoQuarto}</span>
                                </span>
                              </div>
                              <div className="space-y-2 text-sm text-gray-600">
                                {quarto.adultos > 0 && <span>{quarto.adultos} Adulto{quarto.adultos > 1 ? 's' : ''}</span>}
                                
                                {quarto.criancas_6 > 0 && <p>{quarto.criancas_6} Niño{quarto.criancas_6 > 1 ? 's' : ''} (6+ años)</p>}
                                {quarto.criancas_4_5 > 0 && <p>{quarto.criancas_4_5} Niño{quarto.criancas_4_5 > 1 ? 's' : ''} (4-5 años)</p>}
                                {quarto.criancas_0_3 > 0 && <p>{quarto.criancas_0_3} Niño{quarto.criancas_0_3 > 1 ? 's' : ''} (0-3 años)</p>}
                              </div>
                               <div className="flex justify-between items-baseline border-t border-dashed mt-3 pt-3">
                                <span className="font-semibold text-gray-700 text-sm">Total Cuarto {quartoIndex + 1}</span>
                                <div>
                                  <span className="font-bold text-gray-900">{formatPriceWithCurrency(valorDiaria)}</span>
                                  <span className="text-xs text-gray-500"> por noche</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                    {(criancas_0_3 + criancas_4_5) > 0 && (
                      <p className="text-xs text-gray-500 mt-4 text-center italic">
                        *La primera criança de 0 a 5 años es gratuita!
                      </p>
                    )}
                  </div>
                  
                  {/* Valor final */}
                   <div className="space-y-2">
                     <div className="flex justify-between items-center font-bold">
                        <span className="text-gray-800">Valor Total</span>
                        <span className="text-xl text-gray-900">{formatPriceWithCurrency(precoTotalReal)}</span>
                     </div>
                   </div>
                  

                  {/* Book Button */}
                  <button className="w-full bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-5 flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Hablar com Operador
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-2">
                    No se cobrará aún
                  </p>
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
            <div className="text-lg font-bold text-gray-900">$ {formatPrice(precoTotalReal)}</div>
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

      {/* Conditions Modal */}
      {showConditionsModal && selectedConditionType && (
        <div 
          className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeConditionsModal()
            }
          }}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {selectedConditionType === 'cancelacion' && 'Condiciones de Cancelación Completas'}
                {selectedConditionType === 'equipaje' && 'Política de Equipaje Completa'}
                {selectedConditionType === 'documentos' && 'Requisitos Completos'}
              </h2>
              <button
                onClick={closeConditionsModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</span>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div 
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: processMarkdownFormatting(
                    (selectedConditionType === 'cancelacion' && packageConditions?.cancelacion_completa) ||
                    (selectedConditionType === 'equipaje' && packageConditions?.equipaje_completa) ||
                    (selectedConditionType === 'documentos' && packageConditions?.documentos_completa) ||
                    'Conteúdo não disponível.'
                  )
                }} 
              />
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Para consultas adicionales, contáctanos por WhatsApp
              </div>
              <button
                onClick={closeConditionsModal}
                className="px-4 py-2 bg-[#EE7215] hover:bg-[#E65100] text-white text-sm font-medium rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {showAllPhotos && (
        <div 
          className="fixed inset-0 bg-black z-[9999] flex items-center justify-center"
          onClick={(e) => {
            // ✅ NOVO: Fechar ao clicar no fundo (backdrop)
            if (e.target === e.currentTarget) {
              console.log('🎯 FECHANDO MODAL VIA BACKDROP')
              setShowAllPhotos(false)
            }
          }}
        >
          {/* Header com botões */}
          <div className="absolute top-0 left-0 right-0 z-[10000] flex items-center justify-between p-4">
            <button 
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('🎯 FECHANDO MODAL VIA BOTÃO VOLVER')
                setShowAllPhotos(false)
              }}
              className="text-white hover:bg-white/20 p-3 rounded-full transition-all flex items-center gap-2 bg-black/20 backdrop-blur-sm cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Volver</span>
            </button>
            
            <button 
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('🎯 FECHANDO MODAL VIA BOTÃO X')
                setShowAllPhotos(false)
              }}
              className="text-white hover:bg-white/20 p-3 rounded-full transition-all text-xl font-bold bg-black/20 backdrop-blur-sm w-12 h-12 flex items-center justify-center cursor-pointer"
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
            {/* Botão Anterior */}
            {packageData.images.length > 1 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
                className="absolute left-4 text-white hover:bg-white/20 p-3 rounded-full z-10 transition-all bg-black/20 backdrop-blur-sm"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            
            <Image
              src={packageData.images[currentImageIndex]}
              alt={`Foto ${currentImageIndex + 1}`}
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain select-none cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Botão Próximo */}
            {packageData.images.length > 1 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
                className="absolute right-4 text-white hover:bg-white/20 p-3 rounded-full z-10 transition-all bg-black/20 backdrop-blur-sm"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
            {currentImageIndex + 1} / {packageData.images.length}
          </div>
          
          {/* Indicação de como fechar (apenas mobile) */}
          <div 
            className="lg:hidden absolute bottom-16 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('🎯 FECHANDO MODAL VIA TOQUE MOBILE')
              setShowAllPhotos(false)
            }}
          >
            Toque para fechar
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
} 