-- Migration: Seed Serviços Adicionais (Addons)
-- Data: 28/11/2025

-- Inserir serviços de BUS
INSERT INTO public.package_addons (title, description, price, currency, transport_type, icon, is_active)
VALUES 
('Butaca Cama', 'Asientos más amplios, en 3 posiciones hasta 140°.', 100.00, 'USD', 'Bus', 'Bed', true),
('Butacas Especiales', 'Frente al bus arriba / espacio cafetera.', 50.00, 'USD', 'Bus', 'Coffee', true),
('Media Pensión', 'Cenas restantes en diferentes restos.', 90.00, 'USD', 'Bus', 'Utensils', true),
('Pack de 2 Actividades', 'Barra da Lagoa y Joaquina + Jurerê.', 70.00, 'USD', 'Bus', 'Waves', true),
('Promo Pack Full', '2 actividades + 6 cenas.', 120.00, 'USD', 'Bus', 'Sparkles', true);

-- Inserir serviços de AÉREO
INSERT INTO public.package_addons (title, description, price, currency, transport_type, icon, is_active)
VALUES 
('Media Pensión', 'Cenas restantes en diferentes restos.', 100.00, 'USD', 'Aéreo', 'Utensils', true),
('Pack de 2 Actividades', 'Barra da Lagoa y Joaquina + Jurerê.', 70.00, 'USD', 'Aéreo', 'Waves', true),
('Promo Pack Full', '2 actividades + 6 cenas.', 135.00, 'USD', 'Aéreo', 'Sparkles', true);
