import { getHotelBySlug, getHotelByName } from "@/lib/admin-hoteis"
import { getHotelData } from "@/lib/hotel-data"
import { HotelManagerTabs } from "@/components/admin/hotel-manager-tabs"
import { packageDescriptionService } from "@/lib/package-description-service"
import { listAdminDisponibilidades } from "@/lib/admin-disponibilidades"

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ name?: string }>
}

export default async function HotelManagerPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { name: nameParam } = await searchParams
  const isNew = slug === 'novo'

  // 1. Inicializar objeto padrão
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
          images: fromDb.images || [],
          amenities: fromDb.comodidades || fromDb.amenities || []
        }

        // Fallback de imagens hardcoded se vazio
        if (hotelData.images.length === 0) {
           const fromHardcoded = getHotelData(slug)
           if (fromHardcoded && fromHardcoded.displayName !== "Hotel não encontrado") {
              hotelData.images = fromHardcoded.imageFiles.map((img: any) => 
                typeof img === 'string' ? img : (img.src || "")
              ).filter(Boolean)
           }
        }
      } else {
        // 3. Migração Hardcoded
        const fromHardcoded = getHotelData(slug)
        if (fromHardcoded && fromHardcoded.displayName !== "Hotel não encontrado") {
          hotelData = {
            ...hotelData,
            nome: fromHardcoded.displayName,
            images: fromHardcoded.imageFiles.map((img: any) => 
              typeof img === 'string' ? img : (img.src || "")
            ).filter(Boolean),
          }
        } else {
          // 4. Humanizar Slug
          hotelData.nome = nameParam || slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        }
      }
    } catch (error) {
      console.error('Erro ao carregar hotel:', error)
      hotelData.nome = nameParam || slug
    }
  } else {
    hotelData.nome = "Novo Hotel"
    hotelData.slug = ""
  }
  
  // Tentar inferir destino se estiver vazio, consultando disponibilidades
  if (!hotelData.destino) {
    try {
       const res = await listAdminDisponibilidades({ hotel: hotelData.nome, limit: 1 })
       if (res.records?.[0]?.destino) {
          hotelData.destino = res.records[0].destino
       } else {
          hotelData.destino = "Canasvieiras" // Fallback padrão
       }
    } catch(e) { 
      // Ignora erro na inferência 
    }
  }

  return (
    <div className="container py-6">
      <HotelManagerTabs 
        hotelSlug={slug} 
        hotelData={hotelData} 
        isNew={isNew} 
      />
    </div>
  )
}