alter table if exists public.promotions
add column if not exists departure_date date;

create index if not exists promotions_departure_date_idx
  on public.promotions (departure_date);
