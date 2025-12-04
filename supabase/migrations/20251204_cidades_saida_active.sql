-- Migration: Adicionar controle de Ativo/Inativo para Locais de Saída
-- Data: 04/12/2025

-- 1. Adicionar coluna 'ativo' se não existir
ALTER TABLE public.cidades_saida 
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- 2. Adicionar coluna 'ordem' para permitir ordenação manual (opcional, mas útil)
ALTER TABLE public.cidades_saida 
ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 100;

-- 3. Habilitar RLS (se já não estiver)
ALTER TABLE public.cidades_saida ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Segurança

-- Permitir leitura pública apenas para ativos (na API de cliente, mas o admin vê tudo)
-- OBS: O Supabase Service (client) geralmente usa a chave anon. 
-- Se quisermos filtrar no banco, atualizamos a policy.
-- Mas cuidado: O admin também usa o client em alguns lugares, ou usa a Service Role Key.
-- Se usarmos Service Role Key no Admin, não tem problema.

-- Remover policies antigas para garantir
DROP POLICY IF EXISTS "Public read cidades_saida" ON public.cidades_saida;
DROP POLICY IF EXISTS "Admin full access cidades_saida" ON public.cidades_saida;

-- Leitura Pública (Anon) - Vê tudo, o filtro de 'ativo' será feito na aplicação ou aqui?
-- Se filtrarmos aqui, o frontend "quebra" se tentar buscar um inativo especificamente? Não, é lista.
-- Vamos filtrar na Query da aplicação para ser mais flexível, mas deixar a leitura aberta.
CREATE POLICY "Public read cidades_saida"
ON public.cidades_saida FOR SELECT
USING (true);

-- Escrita Admin (Baseado na tabela admin_users)
CREATE POLICY "Admin full access cidades_saida"
ON public.cidades_saida FOR ALL
USING (
  auth.uid() IN (SELECT user_id FROM public.admin_users)
);
