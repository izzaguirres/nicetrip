import { supabase } from './supabase'

interface PackageConditions {
  cancelacion: string
  equipaje: string
  documentos: string
}

class PackageConditionsService {
  private cache = new Map<string, PackageConditions>()

  async getConditions(transporte: 'Bus' | 'Aéreo'): Promise<PackageConditions> {
    // Verificar cache
    if (this.cache.has(transporte)) {
      console.log('💾 CONDITIONS: Usando cache para', transporte)
      return this.cache.get(transporte)!
    }

    try {
      console.log('🔍 CONDITIONS: Buscando no Supabase para transporte:', transporte)
      console.log('🎯 CONDITIONS: Query SQL será:', `SELECT condicoes_cancelacao, condicoes_equipaje, condicoes_documentos FROM package_content_templates WHERE transporte = '${transporte}' AND ativo = true AND id IN (3,4)`)
      
      const { data, error } = await supabase
        .from('package_content_templates')
        .select('condicoes_cancelacao, condicoes_equipaje, condicoes_documentos')
        .eq('transporte', transporte)
        .eq('ativo', true)
        .in('id', [3, 4]) // IDs 3 e 4 são os dados REAIS do usuário
        .limit(1)
        .single()

      console.log('📊 CONDITIONS: Resultado do Supabase:', { data, error })

      if (error || !data) {
        console.log('⚠️ CONDITIONS: Não encontrado, usando fallback para', transporte, 'Error:', error)
        return this.getFallbackConditions(transporte)
      }

      const conditions: PackageConditions = {
        cancelacion: data.condicoes_cancelacao || this.getFallbackConditions(transporte).cancelacion,
        equipaje: data.condicoes_equipaje || this.getFallbackConditions(transporte).equipaje,
        documentos: data.condicoes_documentos || this.getFallbackConditions(transporte).documentos
      }

      // Cache result
      this.cache.set(transporte, conditions)
      console.log('✅ CONDITIONS: Condições carregadas do Supabase:', conditions)
      
      return conditions

    } catch (error) {
      console.error('❌ CONDITIONS: Erro completo:', error)
      return this.getFallbackConditions(transporte)
    }
  }

  private getFallbackConditions(transporte: 'Bus' | 'Aéreo'): PackageConditions {
    const isAereo = transporte === 'Aéreo'
    
    return {
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

  clearCache(): void {
    this.cache.clear()
    console.log('🧹 CONDITIONS: Cache limpo')
  }
}

export const packageConditionsService = new PackageConditionsService() 