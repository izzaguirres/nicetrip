import { getHotelBySlug, getHotelByName } from "@/lib/admin-hoteis"
import { getHotelData } from "@/lib/hotel-data"
import { HotelForm } from "@/components/admin/hotel-form"
import { notFound } from "next/navigation"
import { listAdminDisponibilidades } from "@/lib/admin-disponibilidades"
import { packageDescriptionService } from "@/lib/package-description-service"

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ name?: string }>
}

export default async function HotelManagerPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { name: nameParam } = await searchParams
  const isNew = slug === 'novo'

  // 1. Inicializar objeto padrão (Safe Fallback)
  let hotelData = {
    slug: slug,
    nome: '',
    destino: '',
    descricao_completa: '',
    images: [] as string[],
          amenities: [
            { nome: "Wi-Fi", icone: "wifi" },
            { nome: "Ar Condicionado", icone: "aire" },
            { nome: "TV", icone: "tv" },
            { nome: "Banheira/Hidro", icone: "hot_tub" }
          ] as any[]
  }

  if (!isNew) {
    try {
      // 2. Tentar buscar do Supabase
      let fromDb = await getHotelBySlug(slug)
      
      if (!fromDb && nameParam) {
        fromDb = await getHotelByName(nameParam)
      }
      
      if (fromDb) {
        hotelData = {
          ...hotelData,
          ...fromDb,
          // Garantir arrays
          images: fromDb.images || [],
          amenities: fromDb.comodidades || fromDb.amenities || []
        }

        // Se não tem imagens no banco, tentar puxar do hardcoded como "seed"
        if (hotelData.images.length === 0) {
           const fromHardcoded = getHotelData(slug)
           if (fromHardcoded && fromHardcoded.displayName !== "Hotel não encontrado") {
              hotelData.images = fromHardcoded.imageFiles.map((img: any) => 
                typeof img === 'string' ? img : (img.src || "")
              ).filter(Boolean)
           }
        }
      } else {
        // 3. Se não achou no banco, tentar Hardcoded (Migração)
        const fromHardcoded = getHotelData(slug)
        
        // Verificar se achou algo útil (o getHotelData retorna um fallback se não achar)
        if (fromHardcoded && fromHardcoded.displayName !== "Hotel não encontrado") {
          hotelData = {
            ...hotelData,
            nome: fromHardcoded.displayName,
            images: fromHardcoded.imageFiles.map((img: any) => 
              typeof img === 'string' ? img : (img.src || "")
            ).filter(Boolean),
          }
        } else {
          // 4. Último recurso: Usar o nome da URL ou humanizar o slug
          const humanizedName = nameParam || slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
            
          hotelData.nome = humanizedName
        }
      }
    } catch (error) {
      console.error('Erro ao carregar hotel:', error)
      // Manter o fallback seguro
      hotelData.nome = nameParam || slug
    }
  } else {
    // Novo Hotel
    hotelData.nome = "Novo Hotel"
    hotelData.slug = ""
  }

  // Buscar disponibilidades vinculadas (datas e preços)
  let disponibilidades: any[] = []
  try {
    const result = await listAdminDisponibilidades({ 
      hotel: hotelData.nome || nameParam || slug, 
      limit: 200 
    })
    disponibilidades = result.records
  } catch (error) {
    console.error('Erro ao buscar disponibilidades:', error)
  }

  // Constantes de Fallback (Iguais ao Frontend)
  const DEFAULT_HIGHLIGHTS_AEREO = [
    "Viaje cómodo en avión premium",
    "Transfer In/Out",
    "Alojamiento",
    "Coordinación en viaje y en destino",
    "Guias locales bilingües",
    "Kit de viaje",
    "Asistencia al viajero (ver mayores de 70 años)",
  ]

  const DEFAULT_HIGHLIGHTS_BUS = [
    "Viaje cómodo en bus premium",
    "Snack a bordo",
    "Alojamiento",
    "Coordinación en viaje y en destino",
    "Guias locales bilingües",
    "Kit de viaje",
    "Asistencia al viajero (ver mayores de 70 años)",
    "Cena de Bienvenida",
  ]

  // 5. Enriquecimento Inteligente (Se faltar dados, usar as disponibilidades para inferir)
  if (disponibilidades.length > 0) {
    const ref = disponibilidades[0]
    
    // Se destino estiver vazio, usar da disponibilidade
    if (!hotelData.destino) {
      hotelData.destino = ref.destino
    }

    // Se highlights estiver vazio, preencher com o padrão baseado no transporte
    if (!hotelData.highlights || hotelData.highlights.length === 0) {
      const isAereo = ref.transporte?.toLowerCase().includes('aer') || ref.transporte?.toLowerCase().includes('avi')
      hotelData.highlights = isAereo ? DEFAULT_HIGHLIGHTS_AEREO : DEFAULT_HIGHLIGHTS_BUS
    }

    // Se descrição estiver vazia, tentar buscar do serviço de descrições (que tem fallbacks inteligentes)
    if (!hotelData.descricao_completa) {
      try {
        const desc = await packageDescriptionService.getDescription(
          (ref.transporte as 'Bus' | 'Aéreo') || 'Bus',
          ref.destino,
          hotelData.nome
        )
        if (desc && desc.descripcion) {
          hotelData.descricao_completa = desc.descripcion
        }
      } catch (err) {
        console.warn('Falha ao inferir descrição:', err)
      }
    }
  } else if (!hotelData.destino) {
    // Fallback final para destino se não houver disponibilidades
    hotelData.destino = "Canasvieiras"
  }

  return (
    <div className="container py-6">
      <HotelForm initialData={hotelData} isNew={isNew} disponibilidades={disponibilidades} />
    </div>
  )
}