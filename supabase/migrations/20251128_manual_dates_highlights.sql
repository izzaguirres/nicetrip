-- Migration: Data de Volta e Highlights
-- Data: 28/11/2025

-- 1. Adicionar data_volta em disponibilidades para controle manual
ALTER TABLE public.disponibilidades
ADD COLUMN IF NOT EXISTS data_volta DATE;

-- 2. Adicionar highlights em hospedagens para personalizar "O que oferece este pacote"
ALTER TABLE public.hospedagens
ADD COLUMN IF NOT EXISTS highlights TEXT[] DEFAULT '{}';
