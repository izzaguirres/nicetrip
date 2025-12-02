-- Tabela para armazenar os passeios turísticos
CREATE TABLE passeios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    nome TEXT NOT NULL,
    subtitulo TEXT,
    imagem_url TEXT,

    -- Informações para os 4 badges do card de resultados
    info_1_icone TEXT, -- Nome do ícone do Lucide React (ex: "Calendar")
    info_1_texto TEXT,
    info_2_icone TEXT,
    info_2_texto TEXT,
    info_3_icone TEXT,
    info_3_texto TEXT,
    info_4_icone TEXT,
    info_4_texto TEXT,

    -- Campos para a página de detalhes
    avaliacao_media NUMERIC(2, 1), -- ex: 4.9
    total_avaliacoes INTEGER,
    local_saida TEXT,
    horario_saida TEXT,
    inclui_transporte BOOLEAN DEFAULT false,
    guia_turistico BOOLEAN DEFAULT false,
    opcionais_texto TEXT,
    
    -- Conteúdo das abas
    descricao TEXT,
    observacoes TEXT,

    -- Estrutura JSON para as paradas do passeio
    paradas JSONB, -- Ex: [{"nome": "Parada 1", "descricao": "...", "tipo": "opcional"}]

    -- Controle de ativação
    ativo BOOLEAN DEFAULT true
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE passeios ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública dos passeios ativos
CREATE POLICY "Public read access for active passeios"
ON passeios
FOR SELECT
USING (ativo = true);

-- Comentários para clareza
COMMENT ON COLUMN passeios.paradas IS 'Array de objetos JSON, cada um representando uma parada do passeio. Ex: [{"nome": "Rueda Panorámica", "descricao": "...", "tipo": "opcional"}]';
COMMENT ON COLUMN passeios.info_1_icone IS 'Usar nomes de ícones da biblioteca Lucide React (ex: "Calendar", "Sun", "Bus").'; 