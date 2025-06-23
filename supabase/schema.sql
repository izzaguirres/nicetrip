-- Criar tabela de pacotes
CREATE TABLE IF NOT EXISTS packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  duration VARCHAR(100) NOT NULL,
  image_url TEXT NOT NULL,
  gallery_images TEXT[],
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  departure_city VARCHAR(255) NOT NULL,
  transport_type VARCHAR(20) CHECK (transport_type IN ('bus', 'aereo')) NOT NULL,
  includes TEXT[],
  highlights TEXT[],
  available_dates DATE[],
  max_capacity INTEGER DEFAULT 50,
  category VARCHAR(20) CHECK (category IN ('paquete', 'hospedagem', 'passeio')) NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  is_promotion BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_packages_destination ON packages(destination);
CREATE INDEX IF NOT EXISTS idx_packages_departure_city ON packages(departure_city);
CREATE INDEX IF NOT EXISTS idx_packages_category ON packages(category);
CREATE INDEX IF NOT EXISTS idx_packages_price ON packages(price);
CREATE INDEX IF NOT EXISTS idx_packages_is_featured ON packages(is_featured);
CREATE INDEX IF NOT EXISTS idx_packages_is_promotion ON packages(is_promotion);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_packages_updated_at 
    BEFORE UPDATE ON packages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados de exemplo
INSERT INTO packages (
  title,
  destination,
  description,
  price,
  original_price,
  duration,
  image_url,
  rating,
  reviews_count,
  departure_city,
  transport_type,
  includes,
  highlights,
  category,
  is_featured,
  is_promotion
) VALUES 
(
  'Pacote Canasvieiras - 7 dias',
  'Canasvieiras',
  'Desfrute de 7 dias incríveis em Canasvieiras com hospedagem, passeios e muito mais. Praia, diversão e relaxamento garantidos para toda a família.',
  1299.90,
  1599.90,
  '7 dias / 6 noites',
  '/placeholder.jpg',
  4.8,
  127,
  'Buenos Aires',
  'bus',
  ARRAY['Hospedagem 6 noites', 'Café da manhã', 'City Tour', 'Traslados', 'Guia local'],
  ARRAY['Praia de Canasvieiras', 'Fortaleza de São José', 'Centro histórico'],
  'paquete',
  true,
  true
),
(
  'Florianópolis Completo - 5 dias',
  'Florianópolis',
  'Conheça o melhor de Floripa em 5 dias inesquecíveis. Praias paradisíacas, cultura local e gastronomia única.',
  899.90,
  1199.90,
  '5 dias / 4 noites',
  '/placeholder.jpg',
  4.7,
  89,
  'Buenos Aires',
  'aereo',
  ARRAY['Hospedagem 4 noites', 'Café da manhã', 'Passeio Ilha do Campeche', 'Traslados'],
  ARRAY['Lagoa da Conceição', 'Ilha do Campeche', 'Mercado Público'],
  'paquete',
  true,
  false
),
(
  'Bombinhas Adventure - 4 dias',
  'Bombinhas',
  'Aventura e natureza em Bombinhas. Mergulho, trilhas e praias cristalinas te esperam neste paraíso.',
  699.90,
  NULL,
  '4 dias / 3 noites',
  '/placeholder.jpg',
  4.9,
  156,
  'Buenos Aires',
  'bus',
  ARRAY['Hospedagem 3 noites', 'Mergulho com cilindro', 'Trilha ecológica', 'Traslados'],
  ARRAY['Praia da Sepultura', 'Mergulho', 'Trilha da Tainha'],
  'paquete',
  false,
  true
),
(
  'Hotel Canasvieiras Premium',
  'Canasvieiras',
  'Hospedagem premium a 100m da praia de Canasvieiras. Conforto e localização privilegiada.',
  189.90,
  NULL,
  'Por noite',
  '/placeholder.jpg',
  4.6,
  234,
  'Florianópolis',
  'bus',
  ARRAY['Café da manhã', 'Wi-Fi gratuito', 'Estacionamento', 'Piscina'],
  ARRAY['100m da praia', 'Centro de Canasvieiras', 'Restaurantes próximos'],
  'hospedagem',
  false,
  false
),
(
  'City Tour Florianópolis',
  'Florianópolis',
  'Conheça os principais pontos turísticos de Floripa em um dia completo com guia especializado.',
  89.90,
  NULL,
  '8 horas',
  '/placeholder.jpg',
  4.5,
  67,
  'Florianópolis',
  'bus',
  ARRAY['Transporte', 'Guia local', 'Entrada nos pontos turísticos'],
  ARRAY['Centro histórico', 'Mercado Público', 'Ponte Hercílio Luz'],
  'passeio',
  false,
  false
),
(
  'Passeio Ilha do Campeche',
  'Ilha do Campeche',
  'Dia completo na paradisíaca Ilha do Campeche. Águas cristalinas e natureza preservada.',
  129.90,
  NULL,
  '6 horas',
  '/placeholder.jpg',
  4.8,
  198,
  'Florianópolis',
  'bus',
  ARRAY['Transporte', 'Travessia de barco', 'Guia local', 'Equipamentos de mergulho'],
  ARRAY['Águas cristalinas', 'Sítio arqueológico', 'Mergulho livre'],
  'passeio',
  true,
  false
); 