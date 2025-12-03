import { createClient } from '@supabase/supabase-js'
import { insertAuditLog } from './supabase-service'
import type { Paseo } from './passeios-service'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

export async function getAdminPasseios() {
  const { data, error } = await supabaseAdmin
    .from('passeios')
    .select('*')
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar passeios:', error)
    throw error
  }

  return data as Paseo[]
}

export async function upsertPasseio(passeio: Partial<Paseo>, userId: string) {
  console.log('📤 Upserting Passeio (Raw):', passeio)
  
  // 1. Sanitizar Payload com WHITELIST (Apenas colunas que existem no banco)
  const validPayload: any = {
    nome: passeio.nome,
    subtitulo: passeio.subtitulo,
    duracion: passeio.duracion,
    imagem_url: passeio.imagem_url,
    ativo: passeio.ativo,
    sob_consulta: passeio.sob_consulta,
    
    // Preços
    preco_adulto: passeio.preco_adulto,
    preco_crianca_0_3: passeio.preco_crianca_0_3,
    preco_crianca_4_5: passeio.preco_crianca_4_5,
    preco_crianca_6_10: passeio.preco_crianca_6_10,
    
    // Info Cards
    info_1_titulo: passeio.info_1_titulo,
    info_1_texto: passeio.info_1_texto,
    info_2_titulo: passeio.info_2_titulo,
    info_2_texto: passeio.info_2_texto,
    info_3_titulo: passeio.info_3_titulo,
    info_3_texto: passeio.info_3_texto,
    info_4_titulo: passeio.info_4_titulo,
    info_4_texto: passeio.info_4_texto,
    
    // Detalhes
    descricao: passeio.descricao, // Legado, mas existe
    descricao_longa: passeio.descricao_longa,
    observacoes: passeio.observacoes,
    local_saida: passeio.local_saida,
    horario_saida: passeio.horario_saida,
    inclui_transporte: passeio.inclui_transporte,
    guia_turistico: passeio.guia_turistico,
    opcionais_texto: passeio.opcionais_texto,
    paradas: passeio.paradas,
    avaliacao_media: passeio.avaliacao_media,
    total_avaliacoes: passeio.total_avaliacoes
  }

  // 2. Tratar ID (Só adiciona se existir e for válido)
  if (passeio.id) {
    validPayload.id = passeio.id
  }

  console.log('📤 Upserting Passeio (Sanitized):', validPayload)

  const { data, error } = await supabaseAdmin
    .from('passeios')
    .upsert(validPayload)
    .select()
    .single()

  if (error) {
    console.error('❌ Erro Supabase:', error)
    throw error
  }

  console.log('✅ Sucesso:', data)

  await insertAuditLog({
    entity: 'passeios',
    entityId: data.id,
    action: passeio.id ? 'UPDATE' : 'CREATE',
    performedBy: userId
  })

  return data
}

export async function deletePasseio(id: string, userId: string) {
  const { error } = await supabaseAdmin
    .from('passeios')
    .delete()
    .eq('id', id)

  if (error) throw error

  await insertAuditLog({
    entity: 'passeios',
    entityId: id,
    action: 'DELETE',
    performedBy: userId
  })
}
