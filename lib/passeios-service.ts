import { supabase } from './supabase';

export interface Paseo {
  id: string;
  created_at: string;
  nome: string;
  subtitulo: string | null; // Usado como Local (Cidade/Praia)
  imagem_url: string | null;
  imagens_galeria: string[] | null;
  tempo_de_passeio: string | null;

  // Duração em horas (ex.: "8 horas")
  duracion: string | null;
  
  // Detalhes para a UI
  local_saida: string | null;
  horario_saida: string | null;
  inclui_transporte: boolean | null;
  guia_turistico: boolean | null;
  opcionais_texto: string | null;
  observacoes: string | null;

  // Seção de informações para a página de detalhes
  info_1_titulo: string | null;
  info_1_texto: string | null;
  info_2_titulo: string | null;
  info_2_texto: string | null;
  info_3_titulo: string | null;
  info_3_texto: string | null;
  info_4_titulo: string | null;
  info_4_texto: string | null;

  // Preços
  preco_adulto: number | null;
  preco_crianca_0_3: number | null;
  preco_crianca_4_5: number | null;
  preco_crianca_6_10: number | null;

  // Detalhes do passeio
  descricao_longa: string | null;
  inclui: string | null;
  nao_inclui: string | null;
  recomendacoes: string | null;

  // Nova coluna principal de descrição
  descricao: string | null;

  // Campos de controle
  ativo: boolean;
  sob_consulta?: boolean;
  
  // Campos que podem ser removidos se não forem mais usados
  avaliacao_media: number | null;
  total_avaliacoes: number | null;
}

export interface PaseosSearchFilters {
  mes?: string; // Formato YYYY-MM
  adultos?: number;
  criancas_0_3?: number;
  criancas_4_5?: number;
  criancas_6_plus?: number;
}


export async function fetchPaseosData(filters: PaseosSearchFilters): Promise<Paseo[]> {
  console.log("Buscando passeios com os filtros:", filters);
  
  const { data, error } = await supabase
    .from('passeios')
    .select('*')
    .eq('ativo', true);

  if (error) {
    console.error('Erro ao buscar passeios do Supabase:', error);
    throw new Error('Não foi possível carregar os passeios.');
  }

  return data as Paseo[];
}

export async function fetchPaseoById(id: string): Promise<Paseo | null> {
  if (!id) return null;

  const { data, error } = await supabase
    .from('passeios')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Erro ao buscar o passeio com ID ${id}:`, error);
    throw new Error('Não foi possível encontrar o passeio especificado.');
  }

  return data as Paseo | null;
} 