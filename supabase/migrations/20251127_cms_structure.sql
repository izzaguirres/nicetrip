-- Migration: CMS e Serviços Adicionais
-- Data: 27/11/2025

-- 1. Criar tabela de Serviços Adicionais (Addons)
CREATE TABLE IF NOT EXISTS public.package_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL, -- Ex: "Butaca Cama", "Media Pensión"
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  transport_type VARCHAR(50), -- 'Bus', 'Aéreo' ou NULL (ambos)
  icon VARCHAR(50), -- Nome do ícone (ex: 'Utensils', 'Bed')
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Melhorar tabela de Hospedagens para suportar CMS (Conteúdo)
-- Verifica se a tabela existe, se não, cria (baseado no que vimos no código)
CREATE TABLE IF NOT EXISTS public.hospedagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    destino VARCHAR(255),
    descricao_completa TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar colunas de mídia e comodidades
ALTER TABLE public.hospedagens
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]', -- Ex: [{"label": "WiFi", "icon": "Wifi"}]
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 3. Criar Bucket de Storage para Imagens (via SQL é limitado, ideal configurar no Dashboard do Supabase)
-- O bucket 'hotel-images' deve ser público.
-- Policy será inserida via Dashboard ou Client se necessário, mas aqui definimos a estrutura.

-- 4. Policy para Addons (leitura pública, escrita admin)
ALTER TABLE public.package_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read addons"
ON public.package_addons FOR SELECT
USING (true);

CREATE POLICY "Admin full access addons"
ON public.package_addons FOR ALL
USING (
  auth.uid() IN (SELECT user_id FROM public.admin_users)
);
