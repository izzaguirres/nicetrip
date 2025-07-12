import { supabase } from './supabase'

interface PackageDescription {
  titulo: string
  descripcion: string
}

class PackageDescriptionService {
  private cache = new Map<string, PackageDescription>()

  async getDescription(
    transporte: 'Bus' | 'Aéreo', 
    destino: string, 
    hotel: string
  ): Promise<PackageDescription> {
    // Criar chave única para cache
    const cacheKey = `${transporte}-${destino}-${hotel}`.toLowerCase()
    
    // Verificar cache
    if (this.cache.has(cacheKey)) {
      console.log('💾 DESCRIPTIONS: Usando cache para', cacheKey)
      return this.cache.get(cacheKey)!
    }

    try {
      console.log('🔍 DESCRIPTIONS: Buscando no Supabase para:', { transporte, destino, hotel })
      console.log('📋 DESCRIPTIONS: Query → SELECT titulo, descripcion_detallada FROM package_descriptions')
      
      // Buscar descrição mais específica primeiro (hotel específico)
      let { data, error } = await supabase
        .from('package_descriptions')
        .select('titulo, descripcion_detallada')
        .eq('transporte', transporte)
        .eq('destino', destino)
        .ilike('hotel', hotel) // Use ilike for case-insensitive matching
        .limit(1)
        .single()

      console.log('📊 DESCRIPTIONS: Resultado específico:', { data, error })

      // Se não encontrou descrição específica do hotel, buscar genérica do destino+transporte
      if (error || !data) {
        console.log('🔄 DESCRIPTIONS: Buscando descrição genérica para destino+transporte')
        
        const { data: genericData, error: genericError } = await supabase
          .from('package_descriptions')
          .select('titulo, descripcion_detallada')
          .eq('transporte', transporte)
          .eq('destino', destino)
          .is('hotel', null) // hotel NULL = genérico
          .limit(1)
          .single()

        console.log('📊 DESCRIPTIONS: Resultado genérico:', { data: genericData, error: genericError })

        if (genericError || !genericData) {
          console.log('⚠️ DESCRIPTIONS: Não encontrado, usando fallback')
          return this.getFallbackDescription(transporte, destino, hotel)
        }

        data = genericData
      }

      const description: PackageDescription = {
        titulo: data.titulo || this.getFallbackDescription(transporte, destino, hotel).titulo,
        descripcion: data.descripcion_detallada || this.getFallbackDescription(transporte, destino, hotel).descripcion
      }

      // Cache result
      this.cache.set(cacheKey, description)
      console.log('✅ DESCRIPTIONS: Descrição carregada do Supabase:', description)
      
      return description

    } catch (error) {
      console.error('❌ DESCRIPTIONS: Erro completo:', error)
      return this.getFallbackDescription(transporte, destino, hotel)
    }
  }

  private getFallbackDescription(transporte: 'Bus' | 'Aéreo', destino: string, hotel: string): PackageDescription {
    const isAereo = transporte === 'Aéreo'
    
    return {
      titulo: `Experiencia ${isAereo ? 'Premium' : 'Completa'} en ${destino}`,
      descripcion: isAereo 
        ? `Experimente ${destino} con máximo confort! Nuestro paquete aéreo premium incluye vuelos directos, hospedaje en ${hotel} y noches de relajación. Desayunos completos, tours exclusivos y todas las comodidades para que vivas unas vacaciones perfectas.`
        : `¡Vive la experiencia completa en ${destino}! Nuestro paquete en bus te ofrece días de aventura, incluyendo hospedaje en ${hotel}. Transporte cómodo con aire acondicionado, desayunos incluidos y tiempo suficiente para explorar cada rincón de esta paradisíaca playa.`
    }
  }

  clearCache(): void {
    this.cache.clear()
    console.log('🧹 DESCRIPTIONS: Cache limpo')
  }
}

export const packageDescriptionService = new PackageDescriptionService() 