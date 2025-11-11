alter table public.discount_rules
  add column if not exists age_groups text[];
