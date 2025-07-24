export interface PaseoImageData {
  displayName: string;
  imageFiles: string[];
}

// Mapeamento centralizado de passeios para suas imagens reais
const paseoDataMap: Record<string, PaseoImageData> = {
  "balneario-camboriu": {
    displayName: "Balneário Camboriú",
    imageFiles: [
      "/images/paseos/Balneário Camboriú/1.jpg",
      "/images/paseos/Balneário Camboriú/2.jpg", 
      "/images/paseos/Balneário Camboriú/3.jpg",
      "/images/paseos/Balneário Camboriú/4.png",
      "/images/paseos/Balneário Camboriú/5.jpg",
      "/images/paseos/Balneário Camboriú/6.jpg",
      "/images/paseos/Balneário Camboriú/7.jpg"
    ]
  },
  "beto-carrero-world": {
    displayName: "Beto Carrero World",
    imageFiles: [
      "/images/paseos/Beto Carrero World/1.jpg",
      "/images/paseos/Beto Carrero World/2.jpg",
      "/images/paseos/Beto Carrero World/3.jpg",
      "/images/paseos/Beto Carrero World/4.jpg",
      "/images/paseos/Beto Carrero World/5.jpg",
      "/images/paseos/Beto Carrero World/6.jpg",
      "/images/paseos/Beto Carrero World/7.jpg",
      "/images/paseos/Beto Carrero World/8.jpg",
      "/images/paseos/Beto Carrero World/9.jpg",
      "/images/paseos/Beto Carrero World/10.jpg"
    ]
  },
  "barra-da-lagoa-y-playa-joaquina": {
    displayName: "Barra da Lagoa y Playa Joaquina",
    imageFiles: [
      "/images/paseos/Barra da Lagoa y Playa Joaquina/1.jpg",
      "/images/paseos/Barra da Lagoa y Playa Joaquina/2.jpg",
      "/images/paseos/Barra da Lagoa y Playa Joaquina/3.jpg",
      "/images/paseos/Barra da Lagoa y Playa Joaquina/4.webp",
      "/images/paseos/Barra da Lagoa y Playa Joaquina/5.jpg",
      "/images/paseos/Barra da Lagoa y Playa Joaquina/6.jpg"
    ]
  },
  "isla-do-campeche": {
    displayName: "Isla do Campeche", 
    imageFiles: [
      "/images/paseos/Isla do Campeche/1.jpg",
      "/images/paseos/Isla do Campeche/2.jpg",
      "/images/paseos/Isla do Campeche/3.png",
      "/images/paseos/Isla do Campeche/4.jpg",
      "/images/paseos/Isla do Campeche/5.jpg",
      "/images/paseos/Isla do Campeche/6.jpg"
    ]
  },
  "fallback": {
    displayName: "Passeio não encontrado",
    imageFiles: ["/placeholder.svg"]
  }
};

// Função unificada para normalizar e buscar dados do passeio
export function getPaseoImageData(paseoName: string): PaseoImageData {
  if (!paseoName) {
    return paseoDataMap["fallback"];
  }

  // Normaliza o nome buscado para um formato consistente
  const normalize = (str: string) => 
    (str || '').toLowerCase()
       .normalize("NFD")
       .replace(/[\u0300-\u036f]/g, "")
       .replace(/[^a-z0-9\s-]/g, '')
       .trim()
       .replace(/\s+/g, '-');

  const normalizedQueryName = normalize(paseoName);
  
  // 1. Tenta correspondência exata primeiro
  const exactMatch = paseoDataMap[normalizedQueryName];
  if (exactMatch) {
    return exactMatch;
  }

  // 2. Tenta correspondência parcial
  const partialMatchKey = Object.keys(paseoDataMap).find(key => 
    key.includes(normalizedQueryName) || normalizedQueryName.includes(key)
  );

  if (partialMatchKey && paseoDataMap[partialMatchKey]) {
    return paseoDataMap[partialMatchKey];
  }
  
  // Se não encontrar, retorna o fallback
  console.warn(`[getPaseoImageData] Passeio não encontrado para o nome: "${paseoName}" (Normalizado como: "${normalizedQueryName}")`);
  return paseoDataMap["fallback"];
}

// Função helper para pegar apenas a primeira imagem (para cards)
export function getPaseoCoverImage(paseoName: string): string {
  const paseoData = getPaseoImageData(paseoName);
  return paseoData.imageFiles[0] || "/placeholder.svg";
}

// Função helper para pegar todas as imagens (para galeria)
export function getPaseoGalleryImages(paseoName: string): string[] {
  const paseoData = getPaseoImageData(paseoName);
  return paseoData.imageFiles;
} 