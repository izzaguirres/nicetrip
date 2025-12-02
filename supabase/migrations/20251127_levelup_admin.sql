-- Migration para Level Up Admin (Descontos por Data e Validade de Promoções)

-- 1. Melhoria em Discount Rules: Alvo por Datas Específicas
ALTER TABLE public.discount_rules
ADD COLUMN IF NOT EXISTS target_dates DATE[] DEFAULT NULL;

COMMENT ON COLUMN public.discount_rules.target_dates IS 'Lista de datas de saída específicas onde o desconto se aplica. Se NULL, aplica em todas as datas (respeitando valid_from/to).';

-- 2. Melhoria em Promoções: Validade e Auto-hide
ALTER TABLE public.promotions
ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS auto_hide BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.promotions.valid_until IS 'Data/Hora limite para a promoção ser exibida ou considerada válida.';
COMMENT ON COLUMN public.promotions.auto_hide IS 'Se true, a promoção deixa de ser exibida automaticamente após valid_until.';
