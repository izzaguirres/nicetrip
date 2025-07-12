"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UnifiedSearchFilter } from "@/components/unified-search-filter"
import { DisponibilidadeFilter, PrecoPessoas } from "@/lib/supabase"
import { fetchRealData, SearchFilters } from "@/lib/supabase-service"
import { getHospedagemData, formatComodidadesForCards, COMODIDADES_GENERICAS } from "@/lib/hospedagens-service"
import { calculateFinalPrice, calculateInstallments } from "@/lib/utils";
import {
  Search,
  MapPin,
  Clock,
  Users,
  Star,
  Bus,
  Plane,
  Grid3X3,
  List,
  Hotel,
  Calendar,
  Wifi,
  Car,
  Coffee,
  Waves,
  Mountain,
  TreePine,
  Bot,
  CalendarIcon,
  Bed,
  Tv,
  Utensils,
  AirVent,
  Shield,
  ArrowRight,
  Brain,
  Sparkles,
  Refrigerator,
  Bath,
  ChefHat,
  Flame,
  Gamepad2,
  Circle,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { getHotelData } from "@/lib/hotel-data"

interface Room {
  adults: number
  children0to3: number
  children4to5: number
  children6plus: number
}

export default function ResultadosPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [isMobile, setIsMobile] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // ✅ Força o modo grid como padrão para todas as telas
      setViewMode("grid")
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  const [sortBy, setSortBy] = useState("relevance")
  const [sugestoes, setSugestoes] = useState<string[] | null>(null)
  const [pacotesGPT, setPacotesGPT] = useState<any[] | null>(null)
  const [loadingGPT, setLoadingGPT] = useState(false)
  const [useGPTResults, setUseGPTResults] = useState(false)
  const [comodidadesCache, setComodidadesCache] = useState<{[key: string]: Array<{icon: string, label: string}>}>({})
  const [distanciaPraiaCache, setDistanciaPraiaCache] = useState<{[key: string]: number | null}>({})
  
  const parseRoomsFromURL = (): Room[] => {
    const quartos = parseInt(searchParams.get("quartos") || "1")
    
    if (quartos > 1) {
      return getQuartosIndividuais()
    }
    
    const totalAdultos = parseInt(searchParams.get("adultos") || "2")
    const totalCriancas0_3 = parseInt(searchParams.get("criancas_0_3") || "0")
    const totalCriancas4_5 = parseInt(searchParams.get("criancas_4_5") || "0")
    const totalCriancas6 = parseInt(searchParams.get("criancas_6") || "0")

    return [{
      adults: totalAdultos,
      children0to3: totalCriancas0_3,
      children4to5: totalCriancas4_5,
      children6plus: totalCriancas6
    }]
  }

  const getQuartosIndividuais = (): Room[] => {
    const quartos = parseInt(searchParams.get("quartos") || "1")
    
    const roomsConfigParam = searchParams.get('rooms_config')
    if (roomsConfigParam) {
      try {
        const configDecoded = JSON.parse(decodeURIComponent(roomsConfigParam))
        if (Array.isArray(configDecoded) && configDecoded.length > 0) {
          return configDecoded.map((room: any) => ({
            adults: room.adults || 0,
            children0to3: room.children_0_3 || 0,
            children4to5: room.children_4_5 || 0,
            children6plus: room.children_6 || 0
          }))
        }
      } catch (error) {
        console.log('⚠️ Erro ao decodificar rooms_config, usando fallback')
      }
    }
    
    const totalAdultos = parseInt(searchParams.get("adultos") || "2")
    const totalCriancas0_3 = parseInt(searchParams.get("criancas_0_3") || "0")
    const totalCriancas4_5 = parseInt(searchParams.get("criancas_4_5") || "0")
    const totalCriancas6 = parseInt(searchParams.get("criancas_6") || "0")
    
    if (quartos === 1) {
      return [{
        adults: totalAdultos,
        children0to3: totalCriancas0_3,
        children4to5: totalCriancas4_5,
        children6plus: totalCriancas6
      }]
    }
    
    const rooms: Room[] = []
    let adultosRestantes = totalAdultos
    let criancas0_3Restantes = totalCriancas0_3
    let criancas4_5Restantes = totalCriancas4_5
    let criancas6Restantes = totalCriancas6
    
    for (let i = 0; i < quartos; i++) {
      const adultosPorQuarto = Math.floor(adultosRestantes / (quartos - i))
      const criancas0_3PorQuarto = Math.floor(criancas0_3Restantes / (quartos - i))
      const criancas4_5PorQuarto = Math.floor(criancas4_5Restantes / (quartos - i))
      const criancas6PorQuarto = Math.floor(criancas6Restantes / (quartos - i))
      
      const quartoAtual = {
        adults: adultosPorQuarto,
        children0to3: criancas0_3PorQuarto,
        children4to5: criancas4_5PorQuarto,
        children6plus: criancas6PorQuarto
      }
      
      rooms.push(quartoAtual)
      
      adultosRestantes -= adultosPorQuarto
      criancas0_3Restantes -= criancas0_3PorQuarto
      criancas4_5Restantes -= criancas4_5PorQuarto
      criancas6Restantes -= criancas6PorQuarto
    }
    
    if (adultosRestantes > 0) rooms[0].adults += adultosRestantes
    if (criancas0_3Restantes > 0) rooms[0].children0to3 += criancas0_3Restantes
    if (criancas4_5Restantes > 0) rooms[0].children4to5 += criancas4_5Restantes
    if (criancas6Restantes > 0) rooms[0].children6plus += criancas6Restantes
    
    return rooms
  }

  const calcularPrecoQuarto = (disponibilidade: any, quarto: Room): number => {
    const dadosValidados = validarDadosPreco(disponibilidade)
    
    const precoAdultos = dadosValidados.preco_adulto * quarto.adults
    const precoCriancas03 = dadosValidados.preco_crianca_0_3 * quarto.children0to3
    const precoCriancas45 = dadosValidados.preco_crianca_4_5 * quarto.children4to5
    const precoCriancas6mais = dadosValidados.preco_crianca_6_mais * quarto.children6plus
    
    const total = precoAdultos + precoCriancas03 + precoCriancas45 + precoCriancas6mais
    return isNaN(total) ? 0 : total
  }

  const determinarTipoQuarto = (quarto: Room): string => {
    const totalPessoas = quarto.adults + quarto.children0to3 + quarto.children4to5 + quarto.children6plus
    if (totalPessoas === 1) return "Individual"
    if (totalPessoas === 2) return "Doble"
    if (totalPessoas === 3) return "Triple"
    if (totalPessoas === 4) return "Cuádruple"
    if (totalPessoas === 5) return "Quíntuple"
    return "Suite Familiar"
  }

  const formatarOcupacaoQuarto = (quarto: Room): string => {
    const partes = []
    if (quarto.adults > 0) {
      partes.push(`${quarto.adults} Adulto${quarto.adults > 1 ? 's' : ''}`)
    }
    const totalCriancas = quarto.children0to3 + quarto.children4to5 + quarto.children6plus
    if (totalCriancas > 0) {
      partes.push(`${totalCriancas} Niño${totalCriancas > 1 ? 's' : ''}`)
    }
    return partes.join(', ')
  }

  const [pessoas, setPessoas] = useState<PrecoPessoas>({
    adultos: parseInt(searchParams.get("adultos") || "2"),
    criancas_0_3: parseInt(searchParams.get("criancas_0_3") || "0"),
    criancas_4_5: parseInt(searchParams.get("criancas_4_5") || "0"),
    criancas_6_mais: parseInt(searchParams.get("criancas_6") || "0")
  })

  useEffect(() => {
    const novasPessoas = {
      adultos: parseInt(searchParams.get("adultos") || "2"),
      criancas_0_3: parseInt(searchParams.get("criancas_0_3") || "0"),
      criancas_4_5: parseInt(searchParams.get("criancas_4_5") || "0"),
      criancas_6_mais: parseInt(searchParams.get("criancas_6") || "0")
    }
    setPessoas(novasPessoas)
  }, [searchParams])

  const [filters, setFilters] = useState<DisponibilidadeFilter>({
    destino: searchParams.get("destino") || undefined,
    cidade_saida: searchParams.get("salida") || undefined,
    transporte: searchParams.get("transporte") || undefined,
    data_saida: searchParams.get("data") || undefined,
  })

  useEffect(() => {
    const novosFilters = {
      destino: searchParams.get("destino") || undefined,
      cidade_saida: searchParams.get("salida") || undefined,
      transporte: searchParams.get("transporte") || undefined,
      data_saida: searchParams.get("data") || undefined,
    }
    setFilters(novosFilters)
  }, [searchParams])

  const [disponibilidades, setDisponibilidades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        const searchFilters: SearchFilters = {
          destino: filters.destino,
          transporte: filters.transporte,
          data_saida: filters.data_saida
        }
        const data = await fetchRealData(searchFilters)
        setDisponibilidades(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [filters.destino, filters.transporte, filters.data_saida])

  useEffect(() => {
    if (disponibilidades && disponibilidades.length > 0) {
      const carregarDadosHospedagens = async () => {
        const novoCacheComodidades: {[key: string]: Array<{icon: string, label: string}>} = {}
        const novoCacheDistancia: {[key: string]: number | null} = {}
        
        for (const disponibilidade of disponibilidades) {
          const hotelName = disponibilidade.hotel;
          // ✅ Usa a fonte da verdade para obter o nome oficial
          const hotelOficial = getHotelData(hotelName)?.displayName || hotelName;
          
          if (!comodidadesCache[hotelOficial] || distanciaPraiaCache[hotelOficial] === undefined) {
            const hospedagem = await getHospedagemData(hotelOficial)
            if(hospedagem) {
              novoCacheComodidades[hotelOficial] = formatComodidadesForCards(hospedagem.comodidades || []);
              novoCacheDistancia[hotelOficial] = hospedagem.distancia_praia ?? null;
            }
          }
        }
        
        if (Object.keys(novoCacheComodidades).length > 0) {
          setComodidadesCache(prev => ({ ...prev, ...novoCacheComodidades }))
        }
        if (Object.keys(novoCacheDistancia).length > 0) {
          setDistanciaPraiaCache(prev => ({ ...prev, ...novoCacheDistancia }))
        }
      }
      
      carregarDadosHospedagens()
    }
  }, [disponibilidades])

  // 💰 VALORES CORRETOS DO SUPABASE (conforme tabela disponibilidades)
  const valoresReaisSupabase = {
    preco_adulto: 490,
    preco_crianca_0_3: 50,
    preco_crianca_4_5: 350,
    preco_crianca_6_mais: 490
  }

  const validarDadosPreco = (disponibilidade: any) => {
    const precoAdulto = Number(disponibilidade.preco_adulto) || valoresReaisSupabase.preco_adulto
    const precoCrianca03 = Number(disponibilidade.preco_crianca_0_3) || valoresReaisSupabase.preco_crianca_0_3
    const precoCrianca45 = Number(disponibilidade.preco_crianca_4_5) || valoresReaisSupabase.preco_crianca_4_5
    const precoCrianca6mais = Number(disponibilidade.preco_crianca_6_mais) || valoresReaisSupabase.preco_crianca_6_mais
    
    return {
      ...disponibilidade,
      preco_adulto: precoAdulto,
      preco_crianca_0_3: precoCrianca03,
      preco_crianca_4_5: precoCrianca45,
      preco_crianca_6_mais: precoCrianca6mais
    }
  }

  const calcularPrecoTotalSeguro = (disponibilidade: any, pessoas: PrecoPessoas): number => {
    const dadosValidados = validarDadosPreco(disponibilidade)
    const precoAdultos = dadosValidados.preco_adulto * pessoas.adultos
    const precoCriancas03 = dadosValidados.preco_crianca_0_3 * pessoas.criancas_0_3
    const precoCriancas45 = dadosValidados.preco_crianca_4_5 * pessoas.criancas_4_5
    const precoCriancas6mais = dadosValidados.preco_crianca_6_mais * pessoas.criancas_6_mais
    const total = precoAdultos + precoCriancas03 + precoCriancas45 + precoCriancas6mais
    return isNaN(total) ? 0 : total
  }
  
  const verificarCapacidadeQuartos = (disponibilidade: any, quartos: Room[]): boolean => {
    const totalPessoas = quartos.reduce((total, room) => 
      total + room.adults + room.children0to3 + room.children4to5 + room.children6plus, 0
    )
    const numQuartos = quartos.length
    if (numQuartos > 1) {
      const pessoasPorQuarto = Math.ceil(totalPessoas / numQuartos)
      return disponibilidade.capacidade >= pessoasPorQuarto
    } else {
      return disponibilidade.capacidade >= totalPessoas
    }
  }

  const filtrarPacotesValidos = (pacotes: any[], dataSelecionada?: string, quartos?: Room[]) => {
    if (!pacotes || !Array.isArray(pacotes) || pacotes.length === 0) return []
    if (!dataSelecionada && (!quartos || quartos.length === 0)) return pacotes
    
    let pacotesFiltrados = [...pacotes]
    if (quartos && quartos.length > 0) {
      pacotesFiltrados = pacotes.filter(pacote => verificarCapacidadeQuartos(pacote, quartos))
    }
    
    const pacotesPorHotel = new Map<string, any[]>()
    pacotesFiltrados.forEach(pacote => {
      const hotel = pacote.hotel
      if (!pacotesPorHotel.has(hotel)) pacotesPorHotel.set(hotel, [])
      pacotesPorHotel.get(hotel)!.push(pacote)
    })
    
    const melhoresPorHotel: any[] = []
    pacotesPorHotel.forEach((pacotesDoHotel) => {
      melhoresPorHotel.push(pacotesDoHotel[0])
    })
    
    return melhoresPorHotel
  }
  
  const resultados = filtrarPacotesValidos(
    disponibilidades, 
    filters.data_saida, 
    parseRoomsFromURL()
  ) || []

  const formatPrice = (price: number) => {
    const validPrice = Number(price) || 0;
    if (isNaN(validPrice)) return 'USD 0';
    return `USD ${Math.round(validPrice).toLocaleString('es-AR')}`;
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Data não disponível"
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    })
  }
  
  const handleFilterSearch = (searchFilters: any) => {
    const dataString = searchFilters.data ? format(searchFilters.data, 'yyyy-MM-dd') : undefined
    const params = new URLSearchParams()
    if (searchFilters.salida) params.set('salida', searchFilters.salida)
    if (searchFilters.destino) params.set('destino', searchFilters.destino)
    if (dataString) params.set('data', dataString)
    if (searchFilters.transporte) params.set('transporte', searchFilters.transporte)

    let roomsToUse: { adults: number; children_0_3: number; children_4_5: number; children_6: number; }[] = []
    if (searchFilters.rooms && searchFilters.rooms.length > 0) {
      roomsToUse = searchFilters.rooms.map((room: any) => ({
        adults: room.adults,
        children_0_3: room.children_0_3,
        children_4_5: room.children_4_5,
        children_6: room.children_6
      }))
    } else {
      roomsToUse = getQuartosIndividuais().map((quarto: any) => ({
        adults: quarto.adults,
        children_0_3: quarto.children0to3,
        children_4_5: quarto.children4to5,
        children_6: quarto.children6plus
      }))
    }
    
    params.set('quartos', roomsToUse.length.toString())
    const totalAdultos = roomsToUse.reduce((sum, room) => sum + room.adults, 0)
    const totalCriancas03 = roomsToUse.reduce((sum, room) => sum + room.children_0_3, 0)
    const totalCriancas45 = roomsToUse.reduce((sum, room) => sum + room.children_4_5, 0)
    const totalCriancas6 = roomsToUse.reduce((sum, room) => sum + room.children_6, 0)
    
    params.set('adultos', totalAdultos.toString())
    params.set('criancas_0_3', totalCriancas03.toString())
    params.set('criancas_4_5', totalCriancas45.toString())
    params.set('criancas_6', totalCriancas6.toString())
    params.set('rooms_config', JSON.stringify(roomsToUse))
    
    router.push(`/resultados?${params.toString()}`)
  }

  const getHotelImage = (hotelName: string) => {
    // Primeiro: tentar pegar a imagem via mapeamento mestre utilitário (mais completo)
    const hotelData = getHotelData(hotelName)
    if (hotelData && hotelData.imageFiles && hotelData.imageFiles.length > 0) {
      return hotelData.imageFiles[0]
    }

    // Fallback legacy para manter compatibilidade com nomes antigos/não normalizados
    const hotelImageMap: { [key: string]: string } = {
      "RESIDENCIAL TERRAZAS": "/images/hoteles/Residencial Terrazas/1.png",
      "RESIDENCIAL LEÔNIDAS": "/images/hoteles/Residencial Leônidas/1.jpg", 
      "HOTEL FÊNIX": "/images/hoteles/Hotel Fênix/1.jpg",
      "HOTEL FENIX": "/images/hoteles/Hotel Fênix/1.jpg",
      "PALACE I": "/images/hoteles/Palace I/1.jpg",
      "BOMBINHAS PALACE HOTEL": "/images/hoteles/Bombinhas Palace Hotel/1.jpg",
      "CANAS GOLD HOTEL": "/images/hoteles/Canas Gold Hotel/1.png",
      "VERDES PÁSSAROS APART HOTEL": "/images/hoteles/Verdes Pássaros Apart Hotel/1.png",
      // NOVOS NOMES ADICIONADOS
      "ILHA NORTE APART HOTEL": "/images/hoteles/Ilha Norte Apart Hotel/1.jpg",
      "ILHA NORTE": "/images/hoteles/Ilha Norte/1.jpg",
      "TROPICANAS FLAT": "/images/hoteles/Tropicanas Flat/1.jpg"
    }
    const normalizedName = hotelName.toUpperCase().trim()
    return hotelImageMap[normalizedName] || null
  }

  const getComodidadesReais = async (hotelName: string) => {
    try {
      const hospedagem = await getHospedagemData(hotelName)
      if (hospedagem && hospedagem.comodidades && hospedagem.comodidades.length > 0) {
        return formatComodidadesForCards(hospedagem.comodidades)
      } else {
        return COMODIDADES_GENERICAS
      }
    } catch (error) {
      return COMODIDADES_GENERICAS
    }
  }

  const iconComponents: { [key: string]: any } = {
    Wifi, AirVent, Tv, Refrigerator, Waves, Utensils, Shield, Sparkles, Clock, Car, ChefHat, Bath, Flame, Gamepad2, Circle, Coffee
  }

  const formatPessoas = (pessoas: PrecoPessoas) => {
    const totalAdultos = pessoas.adultos
    const totalCriancas = pessoas.criancas_0_3 + pessoas.criancas_4_5 + pessoas.criancas_6_mais
    if (totalCriancas === 0) return `${totalAdultos} ${totalAdultos === 1 ? 'Adulto' : 'Adultos'}`
    return `${totalAdultos} ${totalAdultos === 1 ? 'Adulto' : 'Adultos'} | ${totalCriancas} ${totalCriancas === 1 ? 'Niño' : 'Niños'}`
  }

  const calcularPrecoPorPessoa = (precoTotal: number, totalPessoas: number) => {
    return totalPessoas > 0 ? precoTotal / totalPessoas : precoTotal
  }

  const formatTotalPessoas = (pessoas: PrecoPessoas) => {
    const adultos = pessoas.adultos
    const criancas = pessoas.criancas_0_3 + pessoas.criancas_4_5 + pessoas.criancas_6_mais
    let texto = `${adultos} ${adultos === 1 ? 'Adulto' : 'Adultos'}`
    if (criancas > 0) texto += `, ${criancas} ${criancas === 1 ? 'Niño' : 'Niños'}`
    return texto
  }

  const gerarTextoTiposQuartos = (disponibilidade?: any): string => {
    const quartosIndividuaisCard = parseRoomsFromURL();
    const temMultiplosQuartosCard = quartosIndividuaisCard.length > 1;
    const numQuartos = quartosIndividuaisCard.length;

    if (!temMultiplosQuartosCard) {
      const tipoCalculado = determinarTipoQuarto(quartosIndividuaisCard[0])
      return `Habitación ${tipoCalculado}`
    }
    
    const tiposQuartos = quartosIndividuaisCard.map(quarto => determinarTipoQuarto(quarto))
    const tiposUnicos = [...new Set(tiposQuartos)]
    
    if (tiposUnicos.length === 1) {
      return `${numQuartos}x ${tiposUnicos[0]}`
    }
    
    return tiposUnicos.join(' + ')
  }

  const quartosIndividuais = getQuartosIndividuais() || []
  const temMultiplosQuartos = (parseInt(searchParams.get("quartos") || "1")) > 1
  
  const gerarUrlDetalhes = (disponibilidade: any, precoCalculado?: number, hotelName?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('hotel', hotelName || disponibilidade.hotel)
    
    const basePrice = precoCalculado || calcularPrecoTotalSeguro(disponibilidade, pessoas)
    params.set('preco', basePrice.toString())
    
    // ✅ Passar preços individuais para a página de detalhes
    params.set('preco_adulto', disponibilidade.preco_adulto.toString());
    params.set('preco_crianca_0_3', disponibilidade.preco_crianca_0_3.toString());
    params.set('preco_crianca_4_5', disponibilidade.preco_crianca_4_5.toString());
    params.set('preco_crianca_6_mais', disponibilidade.preco_crianca_6_mais.toString());

    if (disponibilidade.noites_hotel) params.set('noites_hotel', disponibilidade.noites_hotel.toString())
    if (disponibilidade.dias_totais) params.set('dias_totais', disponibilidade.dias_totais.toString())
    if (disponibilidade.dias_viagem) params.set('dias_viagem', disponibilidade.dias_viagem.toString())
    if (disponibilidade.quarto_tipo) params.set('quarto_tipo', disponibilidade.quarto_tipo)
    
    const roomsConfig = quartosIndividuais.map(quarto => ({
      adults: quarto.adults,
      children_0_3: quarto.children0to3,
      children_4_5: quarto.children4to5,
      children_6: quarto.children6plus
    }))
    params.set('rooms_config', encodeURIComponent(JSON.stringify(roomsConfig)))
    
    return `/detalhes?${params.toString()}`
  }

  if (loading || loadingGPT) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="container mx-auto px-4 lg:px-[70px] py-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cargando disponibilidades...</h2>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar disponibilidades</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Intentar nuevamente</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20">
        <div className="bg-gray-50 border-b">
          <div className="container mx-auto px-4 lg:px-[70px] py-6">
            <UnifiedSearchFilter 
              variant="results"
              initialFilters={{
                salida: searchParams.get("salida") || "",
                destino: searchParams.get("destino") || "",
                data: (() => {
                  const dataParam = searchParams.get("data")
                  if (dataParam) {
                    const [year, month, day] = dataParam.split('-').map(Number)
                    return new Date(year, month - 1, day)
                  }
                  return undefined
                })(),
                transporte: searchParams.get("transporte") || "",
                rooms: parseRoomsFromURL().map((room, index) => ({
                  id: (index + 1).toString(),
                  adults: room.adults,
                  children_0_3: room.children0to3,
                  children_4_5: room.children4to5,
                  children_6: room.children6plus
                }))
              }}
              onSearch={handleFilterSearch}
            />
          </div>
        </div>

        <div className="bg-white border-b">
          <div className="container mx-auto px-4 lg:px-[70px] py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  🏖️ Paquetes para ti
                </h1>
                <p className="text-gray-600 mt-1">
                  {resultados.length} {resultados.length === 1 ? 'paquete disponible' : 'paquetes disponibles'}
                  {filters.destino && ` para ${filters.destino}`}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevancia</SelectItem>
                    <SelectItem value="price_low">Menor precio</SelectItem>
                    <SelectItem value="price_high">Mayor precio</SelectItem>
                    <SelectItem value="date">Fecha de salida</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-r-none relative"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-l-none relative"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-[70px] py-8">
          {resultados.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ninguna disponibilidad encontrada
              </h3>
              <p className="text-gray-600 mb-2">
                Nenhum pacote encontrado com essas opções
              </p>
            </div>
          ) : (
            <div className={`grid gap-4 md:gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                : "grid-cols-1"
            }`}>
              {(resultados || []).map((disponibilidade, index) => {
                const basePrice = calcularPrecoTotalSeguro(disponibilidade, pessoas);
                const finalPrice = calculateFinalPrice(basePrice, disponibilidade.transporte);
                const totalPessoas = pessoas.adultos + pessoas.criancas_0_3 + pessoas.criancas_4_5 + pessoas.criancas_6_mais;
                const precoPorPessoa = calcularPrecoPorPessoa(finalPrice, totalPessoas);
                const { installments, installmentValue } = calculateInstallments(finalPrice, disponibilidade.data_saida);
                
                // ✅ PONTO ÚNICO DE VERDADE PARA DADOS DO HOTEL
                const hotelData = getHotelData(disponibilidade.hotel);
                const hotelNameForDisplay = hotelData?.displayName || disponibilidade.hotel;
                const hotelImage = hotelData?.imageFiles?.[0] || "/placeholder.svg";

                const amenidadesRaw = comodidadesCache[hotelNameForDisplay] || [];
                const maxComodidades = 4;
                const amenidades = amenidadesRaw.slice(0, maxComodidades);
                const hasMoreAmenidades = amenidadesRaw.length > maxComodidades;
                const distanciaPraia = distanciaPraiaCache[hotelNameForDisplay];
                
                const quartosIndividuaisCard = parseRoomsFromURL();
                const temMultiplosQuartosCard = quartosIndividuaisCard.length > 1;

                return (
                  <div key={disponibilidade.id} className={`bg-white border border-gray-100 rounded-3xl shadow-lg p-3 flex flex-col gap-4 hover:shadow-2xl transition-shadow duration-300 ${viewMode === 'list' ? 'md:flex-row md:gap-6' : ''}`}>
                    {/* Image */}
                    <div className={`relative w-full rounded-2xl overflow-hidden ${viewMode === 'list' ? 'md:w-1/3 h-auto' : 'h-64'}`}>
                      <Image src={hotelImage} alt={`Foto de ${hotelNameForDisplay}`} layout="fill" objectFit="cover" />
                    </div>

                    {/* Content */}
                    <div className={`flex flex-col gap-4 px-2 ${viewMode === 'list' ? 'md:w-2/3 md:px-0' : 'px-4 pb-2'}`}>
                      {/* Title */}
                      <div className="text-left">
                        <h3 className="font-bold text-2xl text-gray-900 font-manrope">{hotelNameForDisplay}</h3>
                        <p className="text-sm text-gray-600">{gerarTextoTiposQuartos(disponibilidade)}</p>
                        <div className="flex items-center text-sm text-gray-500 gap-2 mt-1">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          <span>{disponibilidade.destino}</span>
                          {distanciaPraia != null && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span>{distanciaPraia}m de la Playa</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-2">
                        {amenidades.map((amenidade: any, idx: number) => {
                          const IconComponent = iconComponents[amenidade.icon] || Circle;
                          return(
                            <div key={idx} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium">
                              <IconComponent className="w-4 h-4" />
                              <span>{amenidade.label}</span>
                            </div>
                          )
                        })}
                        {hasMoreAmenidades && <div className="flex items-center justify-center bg-gray-100 text-gray-700 w-8 h-8 rounded-full text-xs font-bold">+</div>}
                      </div>
                      
                      {/* Travel Details */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="border rounded-xl p-2 flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-orange-500"/><span>{formatDate(disponibilidade.data_saida)}</span></div>
                        <div className="border rounded-xl p-2 flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500"/><span>{disponibilidade.noites_hotel || 7} noches</span></div>
                        <div className="border rounded-xl p-2 flex items-center gap-2">{disponibilidade.transporte === 'Aéreo' ? <Plane className="w-4 h-4 text-orange-500"/> : <Bus className="w-4 h-4 text-orange-500"/>}<span>{disponibilidade.transporte} + Hotel</span></div>
                        <div className="border rounded-xl p-2 flex items-center gap-2"><Users className="w-4 h-4 text-orange-500"/><span>{formatPessoas(pessoas)}</span></div>
                      </div>

                       {/* Breakdown for multiple rooms */}
                       {temMultiplosQuartosCard && (
                        <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                          {quartosIndividuaisCard.map((quarto, idx) => {
                            const precoQuarto = calcularPrecoQuarto(disponibilidade, quarto)
                            return (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <div>
                                  <span className="font-bold text-orange-600">Cuarto {idx + 1}:</span>
                                  <span className="text-gray-800 ml-1">{determinarTipoQuarto(quarto)}</span>
                                  <p className="text-xs text-gray-500">{formatarOcupacaoQuarto(quarto)}</p>
                                </div>
                                <span className="font-semibold text-gray-700">{formatPrice(precoQuarto)}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}


                      <div className="border-t pt-4 mt-2 flex justify-between items-center">
                        {/* Price */}
                        <div>
                          <p className="text-2xl font-bold text-gray-900 font-manrope">{formatPrice(finalPrice)}</p>
                          {installments > 1 && (
                            <p className="text-sm text-green-600 font-semibold">
                              hasta {installments}x de {formatPrice(installmentValue)}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">Tasa Inclusas</p>
                        </div>
                        {/* Button */}
                        <Link href={gerarUrlDetalhes(disponibilidade, basePrice, hotelNameForDisplay)} passHref>
                          <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6 py-5 font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all">
                            Ver detalles <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}