-- Adds optional targeting columns for admin discount rules
ALTER TABLE IF EXISTS public.discount_rules
  ADD COLUMN IF NOT EXISTS package_slugs TEXT[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS hotel_names TEXT[] DEFAULT NULL;

