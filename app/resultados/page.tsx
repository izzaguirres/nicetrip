"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UnifiedSearchFilter } from "@/components/unified-search-filter"
import { HabitacionesSearchFilter } from "@/components/habitaciones-search-filter"
import { PaseosSearchFilter } from "@/components/paseos-search-filter"
import { DisponibilidadeFilter, PrecoPessoas } from "@/lib/supabase"
import { fetchRealData, fetchHabitacionesData, SearchFilters, HabitacionSearchFilters } from "@/lib/supabase-service"
import { getHospedagemData, formatComodidadesForCards, COMODIDADES_GENERICAS } from "@/lib/hospedagens-service"
import { calculateFinalPrice, calculateInstallments } from "@/lib/utils";
import { 
  calcularPagantesHospedagem, 
  validarConfiguracaoHospedagem,
  quartoAtendeRequisitos,
  calcularPrecoHospedagem,
  formatarExplicacaoPagantes,
  type HospedagemCalculation 
} from "@/lib/hospedagem-utils";
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
  Luggage,
  Sun, // Adicionado
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker"
import { getHotelData } from "@/lib/hotel-data"
import { PaseoCard } from "@/components/ui/paseo-card"
import type { Paseo } from "@/lib/passeios-service"

// Mock data for Paseos - SERÁ REMOVIDO
// const mockPaseos: Paseo[] = [
//   {
//     id: "1",
//     nome: "Paseo en Barco Pirata",
//     imagem: "/images/placeholder.jpg",
//     local: "Canasvieiras",
//     duracao: "4 horas",
//     avaliacao: 4.8,
//     preco_adulto: 50,
//     moeda: "USD",
//   },
//   {
//     id: "2",
//     nome: "Excursión a Bombinhas",
//     imagem: "/images/placeholder.jpg",
//     local: "Salida desde Canasvieiras",
//     duracao: "Día completo",
//     avaliacao: 4.9,
//     preco_adulto: 75,
//     moeda: "USD",
//   },
// ]

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

  const [activeTab, setActiveTab] = useState(
    searchParams.get("categoria") === "hospedagem" ? "habitaciones"
    : searchParams.get("categoria") === "passeio" ? "paseos"
    : "paquetes"
  );
  
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setViewMode("grid")
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    
    let categoria = 'paquete';
    if (tab === "habitaciones") categoria = 'hospedagem';
    if (tab === "paseos") categoria = 'passeio';
    params.set("categoria", categoria);

    // Simplificando a lógica: apenas muda a categoria e mantém os outros filtros
    // A página de resultados irá renderizar o filtro certo, que por sua vez
    // usará os parâmetros relevantes.
    
    router.push(`/resultados?${params.toString()}`);
  };

  const [sortBy, setSortBy] = useState("relevance")
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

  const filters = useMemo(() => {
    const currentSearchType = searchParams.get("categoria") === "hospedagem" ? "habitacion" : "paquetes";
    if (currentSearchType === 'habitacion') {
      const checkin = searchParams.get("checkin");
      const checkout = searchParams.get("checkout");
      const dateRange: DateRange | undefined =
        checkin && checkout
          ? {
              from: new Date(checkin + "T00:00:00"),
              to: new Date(checkout + "T00:00:00"),
            }
          : undefined;
      
      return {
        destino: searchParams.get("destino") || undefined,
        dateRange: dateRange,
      };
    } else {
      return {
        destino: searchParams.get("destino") || undefined,
        cidade_saida: searchParams.get("salida") || undefined,
        transporte: searchParams.get("transporte") || undefined,
        data_saida: searchParams.get("data") || undefined,
      };
    }
  }, [searchParams, activeTab]);

  const [pessoas, setPessoas] = useState<PrecoPessoas>({
    adultos: parseInt(searchParams.get("adultos") || "2"),
    criancas_0_3: parseInt(searchParams.get("criancas_0_3") || "0"),
    criancas_4_5: parseInt(searchParams.get("criancas_4_5") || "0"),
    criancas_6_mais: parseInt(searchParams.get("criancas_6") || "0")
  })

  const [disponibilidades, setDisponibilidades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let data = [];
      if (activeTab === 'habitaciones') {
        const checkin = filters.dateRange?.from
          ? filters.dateRange.from.toISOString().split('T')[0]
          : undefined;
        const checkout = filters.dateRange?.to
          ? filters.dateRange.to.toISOString().split('T')[0]
          : undefined;

        const searchFilters: HabitacionSearchFilters = { checkin, checkout };
        data = await fetchHabitacionesData(searchFilters);
      } else if (activeTab === 'paquetes') {
        const searchFilters: SearchFilters = { ...filters };
        data = await fetchRealData(searchFilters);
      } else if (activeTab === 'paseos') {
        const params = new URLSearchParams()
        if (searchParams.get('mes')) params.set('mes', searchParams.get('mes')!)
        if (searchParams.get('adultos')) params.set('adultos', searchParams.get('adultos')!)
        if (searchParams.get('criancas')) params.set('criancas', searchParams.get('criancas')!)
        
        const response = await fetch(`/api/sugerir-passeios?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Falha ao buscar passeios');
        }
        data = await response.json();
      }
      
      console.log('📊 Dados recebidos:', {
        tipo: activeTab,
        totalItems: data.length,
        tiposQuartoDisponiveis: [...new Set(data.map((item: any) => item.tipo_quarto))],
        capacidadesDisponiveis: [...new Set(data.map((item: any) => item.capacidade))],
        sampleItems: data.slice(0, 5).map((item: any) => ({
          id: item.id,
          slug_hospedagem: item.slug_hospedagem,
          tipo_quarto: item.tipo_quarto,
          capacidade: item.capacidade,
          valor_diaria: item.valor_diaria
        }))
      });
      setDisponibilidades(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (disponibilidades && disponibilidades.length > 0) {
      const carregarDadosHospedagens = async () => {
        const novoCacheComodidades: {[key: string]: Array<{icon: string, label: string}>} = {}
        const novoCacheDistancia: {[key: string]: number | null} = {}
        
        for (const disponibilidade of disponibilidades) {
          const hotelName = disponibilidade.slug_hospedagem || disponibilidade.hotel;
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
    
    // Contar crianças de 6+ como adultos pagantes
    const totalAdultosPagantes = pessoas.adultos + pessoas.criancas_6_mais;
    
    // Lógica para crianças de 0-5
    let criancas0a5Pagam = 0;
    if (pessoas.criancas_0_3 > 0) {
      // A primeira é grátis, as demais pagam
      criancas0a5Pagam = Math.max(0, pessoas.criancas_0_3 - 1);
    }

    const precoAdultos = dadosValidados.preco_adulto * totalAdultosPagantes
    const precoCriancas03 = dadosValidados.preco_crianca_0_3 * criancas0a5Pagam
    const precoCriancas45 = dadosValidados.preco_crianca_4_5 * pessoas.criancas_4_5
    
    const total = precoAdultos + precoCriancas03 + precoCriancas45
    return isNaN(total) ? 0 : total
  }
  
  const verificarCapacidadeQuartos = (disponibilidade: any, quartos: Room[]): boolean => {
    const totalPessoas = quartos.reduce((total, room) => 
      total + room.adults + room.children0to3 + room.children4to5 + room.children6plus, 0
    )
    return disponibilidade.capacidade >= totalPessoas
  }

  const filtrarResultados = (items: any[], quartos: Room[]) => {
    if (!items || !Array.isArray(items) || items.length === 0) return []
    
    // Filtrar por capacidade e lógica de pagantes
    const itemsFiltrados = items.filter(item => {
      if (activeTab === 'habitaciones') {
        // ✅ USAR NOVA LÓGICA DE PAGANTES
        const adultos = quartos.reduce((sum, q) => sum + q.adults, 0);
        const criancas_0_3 = quartos.reduce((sum, q) => sum + q.children0to3, 0);
        const criancas_4_5 = quartos.reduce((sum, q) => sum + q.children4to5, 0);
        const criancas_6_mais = quartos.reduce((sum, q) => sum + q.children6plus, 0);
        
        // Calcular pagantes usando nossa função utilitária
        const calculoPagantes = calcularPagantesHospedagem(
          adultos, 
          criancas_0_3, 
          criancas_4_5, 
          criancas_6_mais
        );
        
        // Validar configuração
        const validacao = validarConfiguracaoHospedagem(calculoPagantes);
        if (!validacao.valid) {
          return false;
        }
        
        // Verificar se o quarto atende aos requisitos
        const quartoAtende = quartoAtendeRequisitos(
          { tipo_quarto: item.tipo_quarto, capacidade: item.capacidade },
          calculoPagantes
        );
        
        return quartoAtende;
      } else {
        // Lógica original para pacotes
        const totalPessoas = quartos.reduce((total, room) => 
          total + room.adults + room.children0to3 + room.children4to5 + room.children6plus, 0
        )
        return item.capacidade >= totalPessoas;
      }
    });

    // Se for busca de pacotes, agrupa por hotel para mostrar só o melhor pacote
    if (activeTab === 'paquetes') {
      // ✅ CORREÇÃO: Primeiro filtrar por data exata se especificada
      let pacotesFiltradosPorData = itemsFiltrados
      
      // Extrair a data da busca dos searchParams
      const dataBusca = searchParams.get("data")
      if (dataBusca) {
        console.log(`🗓️ Filtrando pacotes por data específica: ${dataBusca}`)
        pacotesFiltradosPorData = itemsFiltrados.filter(pacote => 
          pacote.data_saida === dataBusca
        )
        console.log(`📊 Pacotes após filtro por data: ${pacotesFiltradosPorData.length}`)
      }
      
      // ✅ DEPOIS agrupar por hotel 
      const pacotesPorHotel = new Map<string, any[]>()
      pacotesFiltradosPorData.forEach(pacote => {
        const hotel = pacote.hotel
        if (!pacotesPorHotel.has(hotel)) pacotesPorHotel.set(hotel, [])
        pacotesPorHotel.get(hotel)!.push(pacote)
      })
      
      const melhoresPorHotel: any[] = []
      pacotesPorHotel.forEach((pacotesDoHotel) => {
        // ✅ ORDENAR por preço para pegar o melhor (menor preço)
        const melhorPacote = pacotesDoHotel.sort((a, b) => 
          (a.preco_adulto || 0) - (b.preco_adulto || 0)
        )[0]
        melhoresPorHotel.push(melhorPacote)
      })
      
      console.log(`🏨 Hotéis únicos encontrados para data ${dataBusca}: ${melhoresPorHotel.length}`)
      console.log(`🏨 Hotéis: ${melhoresPorHotel.map(p => p.hotel).join(', ')}`)
      
      return melhoresPorHotel
    }

    // Para habitaciones, agrupa as diárias por quarto, soma os preços e verifica a capacidade
    const quartosAgrupados = new Map<string, any>();
    itemsFiltrados.forEach(diaria => {
      const chave = `${diaria.slug_hospedagem}-${diaria.tipo_quarto}`;
      if (!quartosAgrupados.has(chave)) {
        quartosAgrupados.set(chave, {
          ...diaria,
          valor_total: 0,
          noites: 0,
        });
      }
      const quarto = quartosAgrupados.get(chave);
      quarto.valor_total += diaria.valor_diaria;
      quarto.noites += 1;
    });

    const resultadosFinais = Array.from(quartosAgrupados.values());
    
    // Os quartos já foram filtrados pela nova lógica de pagantes acima
    return resultadosFinais;
}
  
  const resultados = filtrarResultados(
    disponibilidades, 
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
    const params = new URLSearchParams()
    
    if (activeTab === 'habitaciones') {
      params.set("categoria", "hospedagem")
      if (searchFilters.destino) params.set("destino", searchFilters.destino)
      if (searchFilters.dateRange?.from)
        params.set("checkin", format(searchFilters.dateRange.from, "yyyy-MM-dd"))
      if (searchFilters.dateRange?.to)
        params.set("checkout", format(searchFilters.dateRange.to, "yyyy-MM-dd"))
    } else if (activeTab === 'paquetes') {
      params.set('categoria', 'paquete')
      if (searchFilters.salida) params.set('salida', searchFilters.salida)
      if (searchFilters.destino) params.set('destino', searchFilters.destino)
      const dataString = searchFilters.data ? format(searchFilters.data, 'yyyy-MM-dd') : undefined
      if (dataString) params.set('data', dataString)
      if (searchFilters.transporte) params.set('transporte', searchFilters.transporte)
    }

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
    const hotelData = getHotelData(hotelName)
    if (hotelData && hotelData.imageFiles && hotelData.imageFiles.length > 0) {
      return hotelData.imageFiles[0]
    }

    const hotelImageMap: { [key: string]: string } = {
      "RESIDENCIAL TERRAZAS": "/images/hoteles/Residencial Terrazas/1.png",
      "RESIDENCIAL LEÔNIDAS": "/images/hoteles/Residencial Leônidas/1.jpg", 
      "HOTEL FÊNIX": "/images/hoteles/Hotel Fênix/1.jpg",
      "HOTEL FENIX": "/images/hoteles/Hotel Fênix/1.jpg",
      "PALACE I": "/images/hoteles/Palace I/1.jpg",
      "BOMBINHAS PALACE HOTEL": "/images/hoteles/Bombinhas Palace Hotel/1.jpg",
      "CANAS GOLD HOTEL": "/images/hoteles/Canas Gold Hotel/1.png",
      "VERDES PÁSSAROS APART HOTEL": "/images/hoteles/Verdes Pássaros Apart Hotel/1.png",
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
    params.set('hotel', hotelName || disponibilidade.slug_hospedagem || disponibilidade.hotel)
    
    const basePrice = precoCalculado || 0
    params.set('preco', basePrice.toString())
    
    if (activeTab === 'paquetes') {
      const dadosValidados = validarDadosPreco(disponibilidade);
      params.set('preco_adulto', dadosValidados.preco_adulto.toString());
      params.set('preco_crianca_0_3', dadosValidados.preco_crianca_0_3.toString());
      params.set('preco_crianca_4_5', dadosValidados.preco_crianca_4_5.toString());
      params.set('preco_crianca_6_mais', dadosValidados.preco_crianca_6_mais.toString());
      if (disponibilidade.noites_hotel) params.set('noites_hotel', disponibilidade.noites_hotel.toString())
      if (disponibilidade.dias_totais) params.set('dias_totais', disponibilidade.dias_totais.toString())
      if (disponibilidade.dias_viagem) params.set('dias_viagem', disponibilidade.dias_viagem.toString())
    } else if (disponibilidade.valor_diaria) {
      params.set('valor_diaria', disponibilidade.valor_diaria.toString());
    }

    if (disponibilidade.quarto_tipo || disponibilidade.tipo_quarto) {
      params.set('quarto_tipo', disponibilidade.tipo_quarto || disponibilidade.quarto_tipo)
    }
    
    const roomsConfig = quartosIndividuais.map(quarto => ({
      adults: quarto.adults,
      children_0_3: quarto.children0to3,
      children_4_5: quarto.children4to5,
      children_6: quarto.children6plus
    }))
    params.set('rooms_config', encodeURIComponent(JSON.stringify(roomsConfig)))
    
    const url = activeTab === 'habitaciones' ? '/detalhes-hospedagem' : '/detalhes';
    return `${url}?${params.toString()}`
  }

  if (loading) {
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
        <div className="bg-gray-100 border-b">
          <div className="container mx-auto px-4 lg:px-[70px] py-6">
            {/* ABAS DE SELEÇÃO */}
            <div className="mb-6 flex justify-center">
              <div className="flex bg-white shadow-md rounded-2xl p-1.5 w-full max-w-md lg:max-w-md mx-auto">
                <button
                  onClick={() => handleTabChange("paquetes")}
                  className={`relative flex-1 py-2.5 px-2 lg:px-4 rounded-xl font-semibold text-xs lg:text-sm transition-all duration-300 flex items-center justify-center group ${
                    activeTab === "paquetes" 
                      ? "bg-orange-500 text-white shadow-lg" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Luggage className="w-4 h-4 mr-1 lg:mr-2" />
                  Paquetes
                </button>
                <button
                  onClick={() => handleTabChange("habitaciones")}
                  className={`relative flex-1 py-2.5 px-2 lg:px-4 rounded-xl font-semibold text-xs lg:text-sm transition-all duration-300 flex items-center justify-center group ${
                    activeTab === "habitaciones"
                      ? "bg-orange-500 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Bed className="w-4 h-4 mr-1 lg:mr-2" />
                  Habitaciones
                </button>
                <button
                  onClick={() => handleTabChange("paseos")}
                  className={`relative flex-1 py-2.5 px-2 lg:px-4 rounded-xl font-semibold text-xs lg:text-sm transition-all duration-300 flex items-center justify-center group ${
                    activeTab === "paseos"
                      ? "bg-orange-500 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Sun className="w-4 h-4 mr-2" />
                  Paseos
                </button>
              </div>
            </div>
          
            {activeTab === 'habitaciones' ? (
              <HabitacionesSearchFilter
                variant="results"
                initialFilters={{
                  destino: searchParams.get("destino") || "Canasvieiras",
                  dateRange: (() => {
                    const checkin = searchParams.get("checkin");
                    const checkout = searchParams.get("checkout");
                    if (checkin && checkout) {
                      return { from: new Date(checkin + 'T00:00:00'), to: new Date(checkout + 'T00:00:00') };
                    }
                    return undefined;
                  })(),
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
            ) : activeTab === 'paquetes' ? (
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
            ) : activeTab === 'paseos' ? (
              <PaseosSearchFilter
                variant="results"
                initialFilters={{
                  month: searchParams.get("mes") || undefined,
                  people: {
                    adults: parseInt(searchParams.get("adultos") || "2"),
                    children_0_3: parseInt(searchParams.get("criancas_0_3") || "0"),
                    children_4_5: parseInt(searchParams.get("criancas_4_5") || "0"),
                    children_6_plus: parseInt(searchParams.get("criancas_6_plus") || "0")
                  }
                }}
                onSearch={handleFilterSearch}
              />
            ) : (
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
            )}
          </div>
        </div>



        <div className="container mx-auto px-4 lg:px-[70px] py-8">
          {(() => {
            if (activeTab === 'paseos') {
              if (loading) {
                return <p>Carregando passeios...</p>
              }
              if (error) {
                return <p>Erro ao carregar passeios: {error}</p>
              }
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {(disponibilidades as Paseo[]).map((paseo) => (
                    <PaseoCard
                      key={paseo.id}
                      passeio={paseo}
                    />
                  ))}
                </div>
              );
            }

            if (resultados.length === 0) {
              return (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {activeTab === 'habitaciones' ? 'Ninguna habitación encontrada' : 'Ninguna disponibilidad encontrada'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {activeTab === 'habitaciones' 
                      ? 'No hay habitaciones disponibles que coincidan con tu búsqueda'
                      : 'Nenhum pacote encontrado com essas opções'
                    }
                  </p>
                  {activeTab === 'habitaciones' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                      <h4 className="font-semibold text-blue-900 mb-2">💡 Dica sobre tipos de habitación:</h4>
                      <ul className="text-sm text-blue-800 text-left space-y-1">
                        <li>• 1 criança de 0-5 anos é gratuita a cada 2 adultos</li>
                        <li>• Crianças 6+ contam como adultos</li>
                        <li>• O tipo de quarto é baseado no número de pagantes</li>
                      </ul>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div className={`grid gap-4 md:gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                {(resultados || []).map((disponibilidade, index) => {
                  const quartosIndividuaisCard = parseRoomsFromURL();
                  const temMultiplosQuartosCard = quartosIndividuaisCard.length > 1;

                  // Lógica de Preço
                  let finalPrice = 0;
                  let installments = 1;
                  let installmentValue = 0;
                  
                  if (activeTab === 'habitaciones') {
                    const adultos = quartosIndividuais.reduce((sum, q) => sum + q.adults, 0);
                    const criancas_0_3 = quartosIndividuais.reduce((sum, q) => sum + q.children0to3, 0);
                    const criancas_4_5 = quartosIndividuais.reduce((sum, q) => sum + q.children4to5, 0);
                    const criancas_6_mais = quartosIndividuais.reduce((sum, q) => sum + q.children6plus, 0);
                    
                    const calculoPagantes = calcularPagantesHospedagem(
                      adultos, 
                      criancas_0_3, 
                      criancas_4_5, 
                      criancas_6_mais
                    );
                    
                    const precoHospedagem = calcularPrecoHospedagem(
                      disponibilidade.valor_diaria || (disponibilidade.valor_total / disponibilidade.noites) || 0,
                      disponibilidade.noites || 1,
                      calculoPagantes
                    );
                    
                    finalPrice = precoHospedagem.precoTotal;
                  } else {
                    const basePrice = calcularPrecoTotalSeguro(disponibilidade, pessoas);
                    finalPrice = calculateFinalPrice(basePrice, disponibilidade.transporte);
                    const { installments: inst, installmentValue: val } = calculateInstallments(finalPrice, disponibilidade.data_saida);
                    installments = inst;
                    installmentValue = val;
                  }
                  
                  // Dados do Hotel
                  const hotelIdentifier = disponibilidade.slug_hospedagem || disponibilidade.hotel;
                  const hotelData = getHotelData(hotelIdentifier);
                  const hotelNameForDisplay = hotelData?.displayName || hotelIdentifier?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || "Hotel no encontrado";
                  const hotelImage = hotelData?.imageFiles?.[0] || "/placeholder.svg";

                  // Comodidades
                  const amenidadesRaw = (hotelNameForDisplay && comodidadesCache[hotelNameForDisplay]) || [];
                  const maxComodidades = 4;
                  const amenidades = amenidadesRaw.slice(0, maxComodidades);
                  const hasMoreAmenidades = amenidadesRaw.length > maxComodidades;
                  const distanciaPraia = hotelNameForDisplay ? distanciaPraiaCache[hotelNameForDisplay] : undefined;

                  return (
                    <div key={disponibilidade.id} className={`bg-white border border-gray-100 rounded-3xl shadow-lg p-3 flex flex-col gap-4 hover:shadow-2xl transition-shadow duration-300 ${viewMode === 'list' ? 'md:flex-row md:gap-6' : ''}`}>
                      <div className={`relative w-full rounded-2xl overflow-hidden ${viewMode === 'list' ? 'md:w-1/3 h-auto' : 'h-64'}`}>
                        <Image src={hotelImage} alt={`Foto de ${hotelNameForDisplay}`} layout="fill" objectFit="cover" />
                      </div>

                      <div className={`flex flex-col gap-4 px-2 ${viewMode === 'list' ? 'md:w-2/3 md:px-0' : 'px-4 pb-2'}`}>
                        <div className="text-left">
                          <h3 className="font-bold text-2xl text-gray-900 font-manrope">{hotelNameForDisplay}</h3>
                          <p className="text-sm text-gray-600">{disponibilidade.tipo_quarto || gerarTextoTiposQuartos(disponibilidade)}</p>
                          <div className="flex items-center text-sm text-gray-500 gap-2 mt-1">
                            <MapPin className="w-4 h-4 text-orange-500" />
                            <span>{filters.destino || 'Canasvieiras'}</span>
                            {distanciaPraia != null && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span>{distanciaPraia}m de la Playa</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-4">
                          {amenidades.map((amenidade: any, idx: number) => {
                            const IconComponent = iconComponents[amenidade.icon] || Circle;
                            return(
                              <div key={idx} className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                                <IconComponent className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">{amenidade.label}</span>
                              </div>
                            )
                          })}
                          {hasMoreAmenidades && (
                            <div className="flex items-center justify-center bg-gray-100 text-gray-700 w-7 h-7 rounded-full text-xs font-bold">
                              +
                            </div>
                          )}
                        </div>
                        
                        <div className="text-sm mt-4">
                          {activeTab === 'paquetes' ? (
                            <div className="grid grid-cols-2 gap-2">
                              <div className="border rounded-xl p-2 flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-orange-500"/><span>{formatDate(disponibilidade.data_saida)}</span></div>
                              <div className="border rounded-xl p-2 flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500"/><span>{disponibilidade.noites_hotel || 7} noches</span></div>
                              <div className="border rounded-xl p-2 flex items-center gap-2">{disponibilidade.transporte === 'Aéreo' ? <Plane className="w-4 h-4 text-orange-500"/> : <Bus className="w-4 h-4 text-orange-500"/>}<span>{disponibilidade.transporte} + Hotel</span></div>
                              <div className="border rounded-xl p-2 flex items-center gap-2"><Users className="w-4 h-4 text-orange-500"/><span>{formatPessoas(pessoas)}</span></div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {/* ✅ NOVO: Títulos fora dos retângulos */}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-xs font-medium text-gray-600 mb-1">Check-in</p>
                                  <div className="border rounded-xl p-2 flex items-center justify-center gap-2">
                                    <CalendarIcon className="w-4 h-4 text-green-500"/>
                                    <span className="font-bold">{filters.dateRange?.from ? formatDate(filters.dateRange.from.toISOString().split('T')[0]) : '-'}</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-600 mb-1">Check-out</p>
                                  <div className="border rounded-xl p-2 flex items-center justify-center gap-2">
                                    <CalendarIcon className="w-4 h-4 text-red-500"/>
                                    <span className="font-bold">{filters.dateRange?.to ? formatDate(filters.dateRange.to.toISOString().split('T')[0]) : '-'}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="border rounded-xl p-2 flex items-center gap-2"><Users className="w-4 h-4 text-orange-500"/><span>{formatPessoas(pessoas)}</span></div>
                            </div>
                          )}
                        </div>

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

                        {/* ✅ NOVO: Explicação de pagantes ACIMA da linha do valor */}
                        {activeTab === 'habitaciones' && (() => {
                          const adultos = quartosIndividuais.reduce((sum, q) => sum + q.adults, 0);
                          const criancas_0_3 = quartosIndividuais.reduce((sum, q) => sum + q.children0to3, 0);
                          const criancas_4_5 = quartosIndividuais.reduce((sum, q) => sum + q.children4to5, 0);
                          const criancas_6_mais = quartosIndividuais.reduce((sum, q) => sum + q.children6plus, 0);
                          
                          const calculoPagantes = calcularPagantesHospedagem(
                            adultos, criancas_0_3, criancas_4_5, criancas_6_mais
                          );
                          
                          const explicacao = formatarExplicacaoPagantes(calculoPagantes);
                          
                          return (
                            <p className="text-xs text-gray-600 font-medium mb-2">
                              * {explicacao}
                            </p>
                          );
                        })()}

                        <div className="border-t pt-4 mt-2 flex justify-between items-center">
                          <div>
                            <p className="text-2xl font-bold text-gray-900 font-manrope">{formatPrice(finalPrice)}</p>
                            {installments > 1 && activeTab === 'paquetes' && (
                              <p className="text-sm text-green-600 font-semibold">
                                hasta {installments}x de {formatPrice(installmentValue)}
                              </p>
                            )}
                          </div>
                          <Link href={gerarUrlDetalhes(disponibilidade, finalPrice, hotelNameForDisplay)} passHref>
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
            )
          })()}
        </div>
      </div>
      <Footer />
    </div>
  )
}