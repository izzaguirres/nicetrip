import { StaticImageData } from 'next/image';

// --- IMAGENS IMPORTADAS ESTATICAMENTE ---

// Bombinhas
import bombinhas1 from '@/public/images/paseos/Bombinhas/1.jpeg';
import bombinhas2 from '@/public/images/paseos/Bombinhas/2.jpg';
import bombinhas3 from '@/public/images/paseos/Bombinhas/3.jpg';
import bombinhas4 from '@/public/images/paseos/Bombinhas/4.png';
import bombinhas5 from '@/public/images/paseos/Bombinhas/5.jpg';

// City Tour – Florianópolis
import cityTour1 from '@/public/images/paseos/City Tour – Florianópolis/1.jpg';
import cityTour2 from '@/public/images/paseos/City Tour – Florianópolis/2.jpg';
import cityTour3 from '@/public/images/paseos/City Tour – Florianópolis/3.jpg';
import cityTour4 from '@/public/images/paseos/City Tour – Florianópolis/4.jpg';
import cityTour5 from '@/public/images/paseos/City Tour – Florianópolis/5.jpg';
import cityTour6 from '@/public/images/paseos/City Tour – Florianópolis/6.jpg';

// Guarda do Embaú
import guarda1 from '@/public/images/paseos/Guarda do Embaú/1.jpeg';
import guarda2 from '@/public/images/paseos/Guarda do Embaú/2.jpeg';
import guarda3 from '@/public/images/paseos/Guarda do Embaú/3.jpg';
import guarda4 from '@/public/images/paseos/Guarda do Embaú/4.jpg';

// Mergulho
import mergulho1 from '@/public/images/paseos/Mergulho/1.jpeg';
import mergulho2 from '@/public/images/paseos/Mergulho/2.jpeg';
import mergulho3 from '@/public/images/paseos/Mergulho/3.jpg';
import mergulho4 from '@/public/images/paseos/Mergulho/4.jpg';
import mergulho5 from '@/public/images/paseos/Mergulho/5.jpeg';

// Aqua Show Park
import aqua1 from '@/public/images/paseos/Aqua Show Park/1.jpg';
import aqua2 from '@/public/images/paseos/Aqua Show Park/2.webp';
import aqua3 from '@/public/images/paseos/Aqua Show Park/3.webp';
import aqua4 from '@/public/images/paseos/Aqua Show Park/4.jpg';
import aqua5 from '@/public/images/paseos/Aqua Show Park/5.jpg';
import aqua6 from '@/public/images/paseos/Aqua Show Park/6.jpg';

// Passeios antigos (mantidos para compatibilidade)
import balneario1 from '@/public/images/paseos/Balneário Camboriú/1.jpg';
import balneario2 from '@/public/images/paseos/Balneário Camboriú/2.jpg';
import balneario3 from '@/public/images/paseos/Balneário Camboriú/3.jpg';
import balneario4 from '@/public/images/paseos/Balneário Camboriú/4.png';
import balneario5 from '@/public/images/paseos/Balneário Camboriú/5.jpg';
import balneario6 from '@/public/images/paseos/Balneário Camboriú/6.jpg';
import balneario7 from '@/public/images/paseos/Balneário Camboriú/7.jpg';

import beto1 from '@/public/images/paseos/Beto Carrero World/1.jpg';
import beto2 from '@/public/images/paseos/Beto Carrero World/2.jpg';
import beto3 from '@/public/images/paseos/Beto Carrero World/3.jpg';
import beto4 from '@/public/images/paseos/Beto Carrero World/4.jpg';
import beto5 from '@/public/images/paseos/Beto Carrero World/5.jpg';
import beto6 from '@/public/images/paseos/Beto Carrero World/6.jpg';
import beto7 from '@/public/images/paseos/Beto Carrero World/7.jpg';
import beto8 from '@/public/images/paseos/Beto Carrero World/8.jpg';
import beto9 from '@/public/images/paseos/Beto Carrero World/9.jpg';
import beto10 from '@/public/images/paseos/Beto Carrero World/10.jpg';

import barra1 from '@/public/images/paseos/Barra da Lagoa y Playa Joaquina/1.jpg';
import barra2 from '@/public/images/paseos/Barra da Lagoa y Playa Joaquina/2.jpg';
import barra3 from '@/public/images/paseos/Barra da Lagoa y Playa Joaquina/3.jpg';
import barra4 from '@/public/images/paseos/Barra da Lagoa y Playa Joaquina/4.webp';
import barra5 from '@/public/images/paseos/Barra da Lagoa y Playa Joaquina/5.jpg';
import barra6 from '@/public/images/paseos/Barra da Lagoa y Playa Joaquina/6.jpg';

import campeche1 from '@/public/images/paseos/Isla do Campeche/1.jpg';
import campeche2 from '@/public/images/paseos/Isla do Campeche/2.jpg';
import campeche3 from '@/public/images/paseos/Isla do Campeche/3.png';
import campeche4 from '@/public/images/paseos/Isla do Campeche/4.jpg';
import campeche5 from '@/public/images/paseos/Isla do Campeche/5.jpg';
import campeche6 from '@/public/images/paseos/Isla do Campeche/6.jpg';

export interface PaseoImageData {
  displayName: string;
  imageFiles: (string | StaticImageData)[];
}

// Mapeamento centralizado de passeios para suas imagens reais
const paseoDataMap: Record<string, PaseoImageData> = {
  // ✅ NOVOS PASSEIOS ATUALIZADOS
  "bombinhas": {
    displayName: "Bombinhas",
    imageFiles: [bombinhas1, bombinhas2, bombinhas3, bombinhas4, bombinhas5]
  },
  "city-tour-florianopolis": {
    displayName: "City Tour – Florianópolis",
    imageFiles: [cityTour1, cityTour2, cityTour3, cityTour4, cityTour5, cityTour6]
  },
  "city-tour": {
    displayName: "City Tour – Florianópolis",
    imageFiles: [cityTour1, cityTour2, cityTour3, cityTour4, cityTour5, cityTour6]
  },
  "florianopolis": {
    displayName: "City Tour – Florianópolis",
    imageFiles: [cityTour1, cityTour2, cityTour3, cityTour4, cityTour5, cityTour6]
  },
  "guarda-do-embau": {
    displayName: "Guarda do Embaú",
    imageFiles: [guarda1, guarda2, guarda3, guarda4]
  },
  "guarda-embau": {
    displayName: "Guarda do Embaú",
    imageFiles: [guarda1, guarda2, guarda3, guarda4]
  },
  "mergulho": {
    displayName: "Mergulho",
    imageFiles: [mergulho1, mergulho2, mergulho3, mergulho4, mergulho5]
  },
  "aqua-show-park": {
    displayName: "Aqua Show Park",
    imageFiles: [aqua1, aqua2, aqua3, aqua4, aqua5, aqua6]
  },
  "aqua-show": {
    displayName: "Aqua Show Park",
    imageFiles: [aqua1, aqua2, aqua3, aqua4, aqua5, aqua6]
  },
  // ✅ PASSEIOS ANTIGOS (mantidos para compatibilidade se ainda existirem)
  "balneario-camboriu": {
    displayName: "Balneário Camboriú",
    imageFiles: [balneario1, balneario2, balneario3, balneario4, balneario5, balneario6, balneario7]
  },
  "beto-carrero-world": {
    displayName: "Beto Carrero World",
    imageFiles: [beto1, beto2, beto3, beto4, beto5, beto6, beto7, beto8, beto9, beto10]
  },
  "barra-da-lagoa-y-playa-joaquina": {
    displayName: "Barra da Lagoa y Playa Joaquina",
    imageFiles: [barra1, barra2, barra3, barra4, barra5, barra6]
  },
  "isla-do-campeche": {
    displayName: "Isla do Campeche", 
    imageFiles: [campeche1, campeche2, campeche3, campeche4, campeche5, campeche6]
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
export function getPaseoCoverImage(paseoName: string): string | StaticImageData {
  const paseoData = getPaseoImageData(paseoName);
  return paseoData.imageFiles[0] || "/placeholder.svg";
}

// Função helper para pegar todas as imagens (para galeria)
export function getPaseoGalleryImages(paseoName: string): (string | StaticImageData)[] {
  const paseoData = getPaseoImageData(paseoName);
  return paseoData.imageFiles;
} 