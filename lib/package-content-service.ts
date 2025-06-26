import { supabase } from './supabase'

interface PackageContentTemplate {
  id: number
  titulo: string | null
  descricao: string
  descricao_detalhada: string | null
  highlights: string[]
  includes: string[]
  condicoes_cancelacao: string | null
  condicoes_equipaje: string | null
  condicoes_documentos: string | null
  condicoes_extras: string | null
}

interface PackageContentParams {
  transporte: 'Bus' | 'Aéreo'
  destino: string
  hotel: string
  dias: number
  noites: number
}

interface FormattedPackageContent {
  titulo: string
  descricao: string
  descricao_detalhada: string
  highlights: string[]
  includes: string[]
  condiciones: {
    cancelacion: string
    equipaje: string
    documentos: string
    extras?: string
  }
}

class PackageContentService {
  private cache = new Map<string, PackageContentTemplate>()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutos

  /**
   * Gera chave de cache baseada nos parâmetros
   */
  private getCacheKey(transporte: string, destino?: string, hotel?: string): string {
    return `${transporte}|${destino || 'ANY'}|${hotel || 'ANY'}`
  }

  /**
   * Busca template no Supabase usando função SQL otimizada
   */
  private async fetchTemplate(
    transporte: string, 
    destino?: string, 
    hotel?: string
  ): Promise<PackageContentTemplate | null> {
    try {
      console.log('🔍 PACKAGE CONTENT: Buscando template para:', { transporte, destino, hotel })
      
      const { data, error } = await supabase.rpc('get_package_content_template', {
        p_transporte: transporte,
        p_destino: destino || null,
        p_hotel: hotel || null
      })

      if (error) {
        console.error('❌ PACKAGE CONTENT: Erro no Supabase:', error)
        return null
      }

      if (!data || data.length === 0) {
        console.log('⚠️ PACKAGE CONTENT: Nenhum template encontrado')
        return null
      }

      const template = data[0]
      console.log('✅ PACKAGE CONTENT: Template encontrado:', template.id)
      
      return {
        id: template.id,
        titulo: template.titulo,
        descricao: template.descricao,
        descricao_detalhada: template.descricao_detalhada,
        highlights: Array.isArray(template.highlights) ? template.highlights : [],
        includes: Array.isArray(template.includes) ? template.includes : [],
        condicoes_cancelacao: template.condicoes_cancelacao,
        condicoes_equipaje: template.condicoes_equipaje,
        condicoes_documentos: template.condicoes_documentos,
        condicoes_extras: template.condicoes_extras
      }
    } catch (error) {
      console.error('❌ PACKAGE CONTENT: Erro inesperado:', error)
      return null
    }
  }

  /**
   * Aplica variáveis no texto template
   */
  private applyVariables(text: string, params: PackageContentParams): string {
    if (!text) return ''
    
    return text
      .replace(/{destino}/g, params.destino)
      .replace(/{hotel}/g, params.hotel)
      .replace(/{dias}/g, params.dias.toString())
      .replace(/{noites}/g, params.noites.toString())
  }

  /**
   * Aplica variáveis em um array de strings
   */
  private applyVariablesToArray(arr: string[], params: PackageContentParams): string[] {
    return arr.map(item => this.applyVariables(item, params))
  }

  /**
   * Busca template com cache e fallback
   */
  async getTemplate(params: PackageContentParams): Promise<PackageContentTemplate | null> {
    const cacheKey = this.getCacheKey(params.transporte, params.destino, params.hotel)
    
    // Verificar cache
    if (this.cache.has(cacheKey)) {
      console.log('💾 PACKAGE CONTENT: Usando cache')
      return this.cache.get(cacheKey)!
    }

    // Tentar buscar template específico (hotel + destino + transporte)
    let template = await this.fetchTemplate(params.transporte, params.destino, params.hotel)
    
    // Fallback: destino + transporte
    if (!template) {
      template = await this.fetchTemplate(params.transporte, params.destino)
    }
    
    // Fallback: apenas transporte
    if (!template) {
      template = await this.fetchTemplate(params.transporte)
    }

    // Cache result
    if (template) {
      this.cache.set(cacheKey, template)
      // Auto-expire cache
      setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout)
    }

    return template
  }

  /**
   * Gera conteúdo formatado com variáveis aplicadas
   */
  async getFormattedContent(params: PackageContentParams): Promise<FormattedPackageContent | null> {
    const template = await this.getTemplate(params)
    
    if (!template) {
      console.log('⚠️ PACKAGE CONTENT: Nenhum template disponível, usando fallback')
      return this.getFallbackContent(params)
    }

    return {
      titulo: this.applyVariables(template.titulo || `Paquete ${params.transporte} a ${params.destino}`, params),
      descricao: this.applyVariables(template.descricao, params),
      descricao_detalhada: this.applyVariables(template.descricao_detalhada || '', params),
      highlights: this.applyVariablesToArray(template.highlights, params),
      includes: this.applyVariablesToArray(template.includes, params),
      condiciones: {
        cancelacion: this.applyVariables(template.condicoes_cancelacao || 'Cancelación según políticas estándar', params),
        equipaje: this.applyVariables(template.condicoes_equipaje || 'Equipaje según modalidad de transporte', params),
        documentos: this.applyVariables(template.condicoes_documentos || 'Documento de identidad válido', params),
        extras: template.condicoes_extras ? this.applyVariables(template.condicoes_extras, params) : undefined
      }
    }
  }

  /**
   * Conteúdo de fallback quando não há templates na DB
   */
  private getFallbackContent(params: PackageContentParams): FormattedPackageContent {
    const isAereo = params.transporte === 'Aéreo'
    
    return {
      titulo: `Experiencia ${isAereo ? 'Premium' : 'Completa'} en ${params.destino}`,
      descricao: isAereo 
        ? `Experimente ${params.destino} com máximo confort! Nosso paquete aéreo premium incluye vuelos directos, hospedaje en ${params.hotel} y ${params.noites} noches de relajación. Desayunos completos, tours exclusivos y todas las comodidades para que vivas unas vacaciones perfectas en solo ${params.dias} días.`
        : `¡Vive la experiencia completa en ${params.destino}! Nuestro paquete en bus te ofrece ${params.dias} días de aventura, incluyendo ${params.noites} noches de hospedaje en ${params.hotel}. Transporte cómodo con aire acondicionado, desayunos incluidos y tiempo suficiente para explorar cada rincón de esta paradisíaca playa.`,
      descricao_detalhada: `Ubicado a solo 50 metros de la playa de ${params.destino}, nuestro hotel socio ofrece comodidad y practicidad para su estadía. Con piscina, restaurante y habitaciones espaciosas, tendrá todo lo que necesita para relajarse después de un día de playa o excursiones.`,
      highlights: isAereo 
        ? [
            "Vuelos directos incluidos",
            `${params.dias} días, ${params.noites} noches de relajación`,
            `Hospedaje premium en ${params.hotel}`,
            "Transfers ejecutivos aeropuerto-hotel",
            "Tours y excursiones incluidas"
          ]
        : [
            "Viaje cómodo en bus premium",
            `${params.dias} días completos de aventura`,
            `${params.noites} noches en ${params.hotel}`,
            "Más tiempo para explorar",
            "Transporte con aire acondicionado"
          ],
      includes: isAereo 
        ? [
            "Vuelos ida y vuelta",
            `Hospedaje por ${params.noites} noches`,
            "Transfers aeropuerto-hotel",
            "Desayuno completo todos los días",
            "Seguro de viaje incluido"
          ]
        : [
            "Transporte en bus premium",
            `Hospedaje por ${params.noites} noches`,
            "Viaje con aire acondicionado",
            "Desayuno completo todos los días",
            "Seguro de viaje incluido"
          ],
      condiciones: {
        cancelacion: isAereo 
          ? "Cancelación gratuita hasta 72 horas antes del vuelo."
          : "Cancelación gratuita hasta 24 horas antes del viaje.",
        equipaje: isAereo 
          ? "Incluye 1 maleta de hasta 23kg por persona en vuelo."
          : "Equipaje sin restricciones de peso en bus.",
        documentos: isAereo 
          ? "Documento de identidad válido y confirmación de vuelo."
          : "Solo documento de identidad válido requerido."
      }
    }
  }

  /**
   * Limpa cache manualmente
   */
  clearCache(): void {
    this.cache.clear()
    console.log('🧹 PACKAGE CONTENT: Cache limpo')
  }
}

// Instância singleton
export const packageContentService = new PackageContentService()

// Função helper para usar no componente
export async function getPackageContent(
  transporte: 'Bus' | 'Aéreo',
  destino: string,
  hotel: string,
  dias: number,
  noites: number
): Promise<FormattedPackageContent | null> {
  return packageContentService.getFormattedContent({
    transporte,
    destino,
    hotel,
    dias,
    noites
  })
} 