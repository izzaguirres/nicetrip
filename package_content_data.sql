-- ====================================
-- DADOS INICIAIS PARA PACKAGE CONTENT TEMPLATES
-- ====================================

-- Templates Genéricos por Transporte
INSERT INTO package_content_templates (
  transporte,
  titulo,
  descricao,
  descricao_detalhada,
  highlights,
  includes,
  condicoes_cancelacao,
  condicoes_equipaje,
  condicoes_documentos,
  prioridade
) VALUES 

-- ==========================================
-- TEMPLATES PARA BUS
-- ==========================================
(
  'Bus',
  'Experiencia Completa en {destino}',
  '¡Vive la experiencia completa en {destino}! Nuestro paquete en bus te ofrece {dias} días de aventura, incluyendo {noites} noches de hospedaje en {hotel}. Transporte cómodo con aire acondicionado, desayunos incluidos y tiempo suficiente para explorar cada rincón de esta paradisíaca playa.',
  'Ubicado a solo 50 metros de la playa de {destino}, nuestro hotel socio ofrece comodidad y practicidad para su estadía. Con piscina, restaurante y habitaciones espaciosas, tendrá todo lo que necesita para relajarse después de un día de playa o excursiones.

El paquete incluye traslado de ida y vuelta, desayuno completo todos los días, y dos excursiones exclusivas: un city tour por Florianópolis y un paseo en barco por la Bahía Norte con parada en la Isla del Francés.',
  '[
    "Viaje cómodo en bus premium",
    "{dias} días completos de aventura",
    "{noites} noches en {hotel}",
    "Más tiempo para explorar",
    "Transporte con aire acondicionado"
  ]',
  '[
    "Transporte en bus premium",
    "Hospedaje por {noites} noches",
    "Viaje con aire acondicionado",
    "Desayuno completo todos los días",
    "Seguro de viaje incluido"
  ]',
  'Cancelación gratuita hasta 24 horas antes del viaje.',
  'Equipaje sin restricciones de peso en bus.',
  'Solo documento de identidad válido requerido.',
  1
),

-- ==========================================
-- TEMPLATES PARA AÉREO
-- ==========================================
(
  'Aéreo',
  'Experiencia Premium en {destino}',
  'Experimente {destino} con máximo confort! Nosso paquete aéreo premium incluye vuelos directos, hospedaje en {hotel} y {noites} noches de relajación. Desayunos completos, tours exclusivos y todas las comodidades para que vivas unas vacaciones perfectas en solo {dias} días.',
  'Disfrute de una experiencia única en {destino} con nuestro paquete premium. Hospedaje en {hotel} con vista al mar, transporte cómodo y experiencias gastronómicas exclusivas.

El paquete incluye traslado de ida y vuelta del aeropuerto, desayuno completo todos los días, y dos excursiones exclusivas: un city tour por Florianópolis y un paseo en barco por la Bahía Norte con parada en la Isla del Francés.',
  '[
    "Vuelos directos incluidos",
    "{dias} días, {noites} noches de relajación",
    "Hospedaje premium en {hotel}",
    "Transfers ejecutivos aeropuerto-hotel",
    "Tours y excursiones incluidas"
  ]',
  '[
    "Vuelos ida y vuelta",
    "Hospedaje por {noites} noches",
    "Transfers aeropuerto-hotel",
    "Desayuno completo todos los días",
    "Seguro de viaje incluido"
  ]',
  'Cancelación gratuita hasta 72 horas antes del vuelo.',
  'Incluye 1 maleta de hasta 23kg por persona en vuelo.',
  'Documento de identidad válido y confirmación de vuelo.',
  1
),

-- ==========================================
-- TEMPLATES ESPECÍFICOS POR DESTINO
-- ==========================================

-- Canasvieiras - Bus
(
  'Bus',
  'Aventura Total en Canasvieiras',
  '¡Vive {dias} días de aventura total en Canasvieiras! Nuestro paquete en bus te lleva a una de las playas más hermosas de Florianópolis. {noites} noches en {hotel}, tiempo para explorar mercados locales, life nocturna y todas las bellezas naturales de la región.',
  NULL,
  '[
    "Canasvieiras - Playa paradisíaca",
    "Mercado de pulgas los jueves",
    "Vida nocturna vibrante",
    "Restaurantes frente al mar",
    "Fácil acceso a otras playas"
  ]',
  NULL,
  NULL,
  NULL,
  NULL,
  2
),

-- Canasvieiras - Aéreo  
(
  'Aéreo',
  'Relax Premium en Canasvieiras',
  'Relájate en Canasvieiras con nuestro paquete aéreo premium. {dias} días de puro confort en una de las playas más exclusivas de Florianópolis. {noites} noches en {hotel} con todos los servicios incluidos.',
  NULL,
  '[
    "Playa de aguas cristalinas",
    "Gastronomía frente al mar",
    "Spa y relajación",
    "Compras en boutiques locales",
    "Sunset en la playa"
  ]',
  NULL,
  NULL,
  NULL,
  NULL,
  2
),

-- ==========================================
-- TEMPLATES ESPECÍFICOS POR HOTEL (Opcional)
-- ==========================================

-- Residencial Terrazas
(
  'Bus',
  'Terrazas Experience',
  'Hospédate en el exclusivo Residencial Terrazas y disfruta de {dias} días de comodidad total. Con vista privilegiada al mar y {noites} noches de descanso garantizado.',
  NULL,
  '[
    "Vista panorámica al mar",
    "Habitaciones amplias y modernas",
    "Piscina con vista oceánica",
    "A pasos de la playa",
    "Restaurante gourmet"
  ]',
  NULL,
  NULL,
  NULL,
  NULL,
  3
);

-- ====================================
-- FUNCIÓN PARA APLICAR VARIABLES
-- ====================================

-- Esta función puede ser llamada do lado do JavaScript
CREATE OR REPLACE FUNCTION format_package_content(
  template_text TEXT,
  destino_val VARCHAR DEFAULT '',
  hotel_val VARCHAR DEFAULT '',
  dias_val INTEGER DEFAULT 0,
  noites_val INTEGER DEFAULT 0
)
RETURNS TEXT AS $$
BEGIN
  RETURN replace(
    replace(
      replace(
        replace(template_text, '{destino}', destino_val),
        '{hotel}', hotel_val
      ),
      '{dias}', dias_val::TEXT
    ),
    '{noites}', noites_val::TEXT
  );
END;
$$ LANGUAGE plpgsql; 