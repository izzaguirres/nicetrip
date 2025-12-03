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
import { supabase } from "@/lib/supabase" // Importar supabase client
import { buildWhatsappMessage, openWhatsapp, logWhatsappConversion } from "@/lib/whatsapp"
import { FadeIn } from "@/components/ui/fade-in"

// Novos componentes
import { PackageGallery } from "@/components/package-gallery"
import { PackageInfo } from "@/components/package-info"
import { BookingCardHospedagem } from "@/components/booking-card-hospedagem"

export default function DetalhesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [hospedagemData, setHospedagemData] = useState<any>(null);
  const [packageConditions, setPackageConditions] = useState<any>(null)
  const [packageDescription, setPackageDescription] = useState<{titulo: string, descripcion: string} | null>(null)
  const [hospedagemConditions, setHospedagemConditions] = useState<string | null>(null);

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

  // ✅ NOVO: Detectar se estamos no cliente (resolver hidratação)
  useEffect(() => {
    setIsClient(true)
  }, [])
  
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

  const quartosIndividuais = getQuartosIndividuais()

  // ✅ CARREGAR COMODIDADES REAIS DO HOTEL
  useEffect(() => {
    const carregarHospedagem = async () => {
      try {
        const data = await getHospedagemData(displayName)
        setHospedagemData(data);
      } catch (error) {
        console.error('Erro ao carregar dados da hospedagem:', error)
      }
    }
    
    carregarHospedagem()
  }, [displayName])

  // ✅ CARREGAR CONDIÇÕES DE HOSPEDAGEM
  useEffect(() => {
    const carregarHospedagemCondicoes = async () => {
      try {
        const { data, error } = await supabase
          .from('package_content_templates')
          .select('condicoes_cancelacao_completa')
          .eq('id', 15)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setHospedagemConditions(data.condicoes_cancelacao_completa);
        }
      } catch (error) {
        console.error('❌ CONDIÇÕES HOSPEDAGEM: Erro ao buscar condições:', error);
        setHospedagemConditions('Não foi possível carregar as condições.');
      }
    };

    carregarHospedagemCondicoes();
  }, []);

  // ✅ CARREGAR CONDIÇÕES DINÂMICAS DO PACOTE
  useEffect(() => {
    const carregarCondicoes = async () => {
      try {
        const transporteNormalizado = transporte === 'Bús' ? 'Bus' : transporte
        const conditions = await packageConditionsService.getConditions(transporteNormalizado as 'Bus' | 'Aéreo')
        setPackageConditions(conditions)
      } catch (error) {
        setPackageConditions(null)
      }
    }
    
    if (transporte) {
      carregarCondicoes()
    }
  }, [transporte])

  // ✅ CARREGAR DESCRIÇÕES DINÂMICAS DO PACOTE
  useEffect(() => {
    const carregarDescricoes = async () => {
      try {
        const transporteNormalizado = transporte === 'Bús' ? 'Bus' : transporte
        const description = await packageDescriptionService.getDescription(
          transporteNormalizado as 'Bus' | 'Aéreo',
          destino,
          hotelName
        )
        setPackageDescription(description)
      } catch (error) {
        setPackageDescription(null)
      }
    }
    
    if (transporte && destino && hotelName) {
      carregarDescricoes()
    }
  }, [transporte, destino, hotelName])
  
  // 💰 O preço total real é o preço que vem da URL
  const precoTotalReal = preco;

  // Determinar tipo de quarto baseado na ocupação
  const determinarTipoQuarto = (quarto: any) => {
    const totalPessoasQuarto = quarto.adultos + quarto.criancas_0_3 + quarto.criancas_4_5 + quarto.criancas_6
    if (totalPessoasQuarto >= 3) return "Triple"
    if (totalPessoasQuarto === 2) return "Habitación Doble"
    return "Individual"
  }
  
  // Formatar ocupação do quarto (para mobile)
  const formatarOcupacaoQuarto = (quarto: any) => {
    const partes = []
    if (quarto.adultos > 0) partes.push(`${quarto.adultos} Adulto${quarto.adultos > 1 ? 's' : ''}`)
    const totalCriancasQuarto = quarto.criancas_0_3 + quarto.criancas_4_5 + quarto.criancas_6
    if (totalCriancasQuarto > 0) partes.push(`${totalCriancasQuarto} Niño${totalCriancasQuarto > 1 ? 's' : ''}`)
    return partes.join(', ')
  }

  const getIconComponent = (icone: string) => {
    const iconMap: { [key: string]: any } = {
      'wifi': Wifi, 'aire': AirVent, 'tv': Tv, 'fridge': Refrigerator, 'pool': Waves,
      'restaurant': ChefHat, 'safe': Shield, 'cleaning': Sparkles, 'reception': Clock,
      'parking': Car, 'kitchen': Utensils, 'hot_tub': Bath, 'bbq': Flame, 'gamepad': Gamepad2,
    }
    return iconMap[icone] || Circle
  }
  
  const packageData = {
    id: searchParams.get('id') || '1',
    name: displayName,
    location: `${destino}, Santa Catarina`,
    hotel: displayName,
    rating: 4.9,
    reviewCount: 127,
    price: preco,
    originalPrice: preco + 350,
    dataViagem: searchParams.get('data') || '2025-10-02',
    images: packageImages,
    description: packageDescription?.descripcion || "Cargando descripción...",
    amenities: hospedagemData?.comodidades?.map((comodidade: any) => ({
      icon: comodidade.icone, // Passar string do icone, PackageInfo vai resolver
      name: comodidade.nome
    })) || [],
    highlights: hospedagemData?.highlights || [
        "Alojamiento",
        "Desayuno completo",
        "Wifi gratis",
        "Ubicación privilegiada",
        "Atención 24hs"
      ],
    condiciones: packageConditions,
    duration: `${noitesCalculadas} noches`
  }

  const buildHospedagemWhatsappData = () => {
    const habitaciones = (getQuartosIndividuais() || []).map((quarto: any, index: number) => ({
      label: `Habitación ${index + 1}`,
      adultos: Number(quarto.adultos || 0),
      children0to3: Number(quarto.criancas_0_3 || 0),
      children4to5: Number(quarto.criancas_4_5 || 0),
      children6plus: Number(quarto.criancas_6 || 0),
    }))

    return {
      destino,
      hotel: packageData.name,
      checkin: checkin || undefined,
      checkout: checkout || undefined,
      noches: noitesCalculadas || undefined,
      habitaciones,
      total: precoTotalReal,
      currency: 'BRL',
      extras: packageData.highlights,
      link: typeof window !== 'undefined' ? window.location.href : '',
    }
  }

  const sendHospedagemWhatsapp = (origin: string) => {
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || ''
    const payload = buildHospedagemWhatsappData()
    const mensagem = buildWhatsappMessage('habitacion', payload)

    logWhatsappConversion({
      origem: origin,
      hotel: payload.hotel,
      destino: payload.destino,
      checkin: payload.checkin,
      checkout: payload.checkout,
      noites: payload.noches,
      total: payload.total,
      currency: payload.currency,
      habitaciones: payload.habitaciones,
    })

    openWhatsapp(phone, mensagem)
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
    return `USD ${formatPrice(value)}`;
  }

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: `${packageData.name} - Nice Trip`,
      text: `¡Mira este increíble paquete en ${destino}! Desde USD ${formatPrice(packageData.price)}`,
      url: window.location.href
    }
    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('¡Link copiado al portapapeles!')
      }
    } catch (error) {
      console.log('Error sharing:', error)
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('¡Link copiado al portapapeles!')
      } catch (clipboardError) { }
    }
  }
  
  const diasNoites = { dias: noitesCalculadas, noites: noitesCalculadas }
  
  // Mobile state for touch
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

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
          <FadeIn>
            <PackageGallery images={packageData.images} />
          </FadeIn>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Details */}
            <FadeIn delay={0.2} className="lg:col-span-2 space-y-8">
               <PackageInfo
                packageData={packageData}
                diasNoites={diasNoites}
                hospedagemData={hospedagemData}
                packageDescription={packageDescription}
                packageConditions={packageConditions}
                transporte={transporte}
                saida={saida}
                voosInfo={null}
                addons={[]}
                selectedAddons={[]}
                onAddonToggle={() => {}}
                context="hotel"
              />
            </FadeIn>

            {/* Right Column - Booking Card */}
            <FadeIn delay={0.4} className="lg:col-span-1">
               <BookingCardHospedagem
                basePrice={precoTotalReal}
                destino={destino}
                dataViagem={new Date(checkin || Date.now())}
                diasNoites={diasNoites}
                checkin={checkin}
                checkout={checkout}
                quartosIndividuais={quartosIndividuais}
                valorDiaria={valorDiaria}
                precoTotalReal={precoTotalReal}
                formatPriceWithCurrency={formatPriceWithCurrency}
                onBook={() => sendHospedagemWhatsapp('detalhes-hospedagem')}
                itemTitle={displayName}
                determinarTipoQuarto={(quarto) => searchParams.get('quarto_tipo') || determinarTipoQuarto(quarto)}
              />
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Overlay */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <div className="text-sm font-light text-gray-600">Precio total</div>
            <div className="text-lg font-bold text-gray-900">USD {formatPrice(precoTotalReal)}</div>
            <div className="text-xs font-light text-gray-600">
              {temMultiplosQuartos 
                ? `${adultos} Adultos, ${totalCriancas} Niños en ${quartos} cuartos`
                : formatarOcupacaoQuarto(quartosIndividuais[0])
              }
            </div>
          </div>
          <div className="flex flex-col items-center">
            <a
              onClick={(e) => {
                e.preventDefault()
                sendHospedagemWhatsapp('detalhes-hospedagem-mobile')
              }}
              href="#"
              className="relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-[0_6px_20px_rgba(238,114,21,0.4)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] transform-gpu overflow-hidden group/btn mb-1"
            >
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
              
              <span className="relative flex items-center justify-center gap-2 text-sm">
                <span className="font-bold tracking-wide">Reservar</span>
              </span>
            </a>
            <p className="text-xs font-light text-gray-600">No se cobrará aún</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}