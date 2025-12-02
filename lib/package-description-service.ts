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
      
      // ✅ ATUALIZADO: Buscar da tabela `hospedagens` usando o nome do hotel
      // Tentar buscar pelo slug primeiro, que deve ser o identificador único
      let { data, error } = await supabase
        .from('hospedagens')
        .select('nome, slug, descricao_completa') // Corrigido para 'slug'
        .eq('slug', hotel) // Corrigido para 'slug'
        .limit(1)
        .single()

      // Se não encontrou pelo slug, tentar pelo nome (ilike) como fallback
      if (error || !data) {
        console.log(`⚠️ DESCRIPTIONS: Não encontrado pelo slug "${hotel}". Tentando pelo nome...`)
        const { data: dataByName, error: errorByName } = await supabase
          .from('hospedagens')
          .select('nome, slug, descricao_completa') // Corrigido para 'slug'
          .ilike('nome', `%${hotel.replace(/-/g, ' ')}%`) // Substitui hífens por espaço para abranger mais casos
          .limit(1)
          .single()
        
        // Se encontrou pelo nome, usa esses dados
        if (dataByName) {
          data = dataByName
          error = null // Limpa o erro anterior
        } else {
          error = errorByName // Mantém o erro da segunda busca
        }
      }

      console.log('📊 DESCRIPTIONS: Resultado final da busca em hospedagens:', { data, error })

      // Se der erro ou não encontrar, usar fallback
      if (error || !data || !data.descricao_completa) {
        console.log('⚠️ DESCRIPTIONS: Descrição não encontrada em `hospedagens` após múltiplas tentativas, usando fallback.')
        return this.getFallbackDescription(transporte, destino, hotel)
      }

      const description: PackageDescription = {
        // Manter o título dinâmico do fallback, pois a tabela de hospedagens não tem título de pacote
        titulo: this.getFallbackDescription(transporte, destino, hotel).titulo,
        // Usar a descrição completa da tabela hospedagens
        descripcion: data.descricao_completa 
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