create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('paquete','hospedaje','paseo')),
  position smallint not null default 0,
  title text not null,
  subtitle text,
  destino text,
  hotel text,
  transporte text,
  slug_disponibilidade text,
  slug_hospedagem text,
  slug_paseo text,
  price_single numeric,
  price_double numeric,
  price_triple numeric,
  price_quad numeric,
  price_quint numeric,
  cta_label text,
  cta_url text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists promotions_type_idx on public.promotions (type, position, is_active);

create or replace function public.set_promotions_updated_at()
returns trigger
language plpgsql as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_promotions_updated_at on public.promotions;
create trigger trg_promotions_updated_at
before update on public.promotions
for each row
execute function public.set_promotions_updated_at();
