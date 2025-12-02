export interface Review {
  id: string
  author: string
  avatar: string
  date: string
  rating: number
  content: string
  tags?: string[]
}

export interface HotelReviewsData {
  totalCount: number
  averageRating: number
  breakdown: {
    limpieza: number
    ubicacion: number
    servicio: number
    precio_calidad: number
  }
  reviews: Review[]
}

const REVIEWS_POOL = [
  { content: "La ubicación es inmejorable, cerca de todo pero tranquilo por la noche. El desayuno superó nuestras expectativas.", author: "Sofía Martinez", tags: ["Familia", "Desayuno"] },
  { content: "Excelente atención del personal. Las habitaciones son tal cual las fotos. Volveremos seguro!", author: "Juan Pablo Fernandez", tags: ["Pareja"] },
  { content: "Buena relación precio-calidad. La piscina es un poco más chica de lo que parece, pero se disfruta igual.", author: "Lucas Rodriguez", tags: ["Amigos"] },
  { content: "Todo impecable. La limpieza de 10. Muy recomendable para ir con niños pequeños.", author: "Valentina Lopez", tags: ["Familia"] },
  { content: "El hotel es hermoso, moderno y muy cómodo. El wifi funcionaba perfecto para trabajar.", author: "Martín Gomez", tags: ["Solo", "Trabajo"] },
  { content: "Increíble experiencia. Los coordinadores de Nice Trip estuvieron en cada detalle. El hotel un sueño.", author: "Camila Silva", tags: ["Grupo"] },
  { content: "Lo mejor fue la cercanía a la playa. Desayunar mirando el mar no tiene precio.", author: "Diego Torres", tags: ["Pareja", "Vista"] },
  { content: "Habitaciones amplias y limpias. El baño renovado a nuevo. Muy conforme.", author: "Lucía Diaz", tags: ["Pareja"] },
  { content: "Un poco ruidoso el fin de semana, pero el resto de la estadía fue muy tranquila. El personal muy amable.", author: "Gabriel Ruiz", tags: ["Amigos"] },
  { content: "Hermoso lugar. Nos sentimos como en casa. Gracias por todo!", author: "Ana María Sosa", tags: ["Familia"] },
  { content: "La cama super cómoda y la ducha con buena presión. Detalles que importan.", author: "Federico Castro", tags: ["Solo"] },
  { content: "El paquete cumplió con todo lo prometido. Los traslados fueron puntuales.", author: "Micaela Benitez", tags: ["Pareja"] },
  { content: "Lugar estratégico para recorrer la isla. El servicio de limpieza excelente.", author: "Javier Acosta", tags: ["Familia"] },
  { content: "Desayuno muy variado, con frutas frescas y tortas caseras. Me encantó.", author: "Florencia Medina", tags: ["Amigos", "Comida"] },
  { content: "Todo muy bien organizado. Llegamos y la habitación ya estaba lista. Super recomendable.", author: "Ricardo Pereyra", tags: ["Pareja"] }
]

// Função simples de hash para gerar números consistentes baseados em uma string (nome do hotel)
const stringToSeed = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Gerador Pseudo-Aleatório com Semente
const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function generateSmartReviews(hotelName: string): HotelReviewsData {
  const seed = stringToSeed(hotelName || "Default Hotel");
  
  // Gerar contagem de reviews (entre 40 e 300)
  const totalCount = Math.floor(seededRandom(seed) * 260) + 40;
  
  // Gerar nota média (entre 4.2 e 4.9) - mantendo premium
  const rawRating = (seededRandom(seed + 1) * 0.7) + 4.2;
  const averageRating = Math.round(rawRating * 10) / 10;

  // Gerar breakdown coerente com a nota
  const breakdown = {
    limpieza: Math.min(5, Math.round((rawRating + (seededRandom(seed + 2) * 0.4 - 0.2)) * 10) / 10),
    ubicacion: Math.min(5, Math.round((rawRating + (seededRandom(seed + 3) * 0.4 - 0.2)) * 10) / 10),
    servicio: Math.min(5, Math.round((rawRating + (seededRandom(seed + 4) * 0.4 - 0.2)) * 10) / 10),
    precio_calidad: Math.min(5, Math.round((rawRating + (seededRandom(seed + 5) * 0.4 - 0.2)) * 10) / 10),
  }

  // Selecionar 4 a 6 reviews do pool baseados na seed
  const reviewsCount = Math.floor(seededRandom(seed + 6) * 3) + 4;
  const selectedReviews: Review[] = [];
  const poolCopy = [...REVIEWS_POOL];
  
  for (let i = 0; i < reviewsCount; i++) {
    const index = Math.floor(seededRandom(seed + 10 + i) * poolCopy.length);
    const reviewData = poolCopy.splice(index, 1)[0]; // Remove para não repetir
    
    // Gerar data aleatória recente (últimos 6 meses)
    const daysAgo = Math.floor(seededRandom(seed + 20 + i) * 180);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    // Gerar iniciais para o avatar
    const initials = reviewData.author.split(' ').map(n => n[0]).join('').substring(0, 2);

    selectedReviews.push({
      id: `rev-${i}`,
      author: reviewData.author,
      avatar: initials,
      content: reviewData.content,
      rating: 5, // Reviews selecionadas são geralmente as boas
      date: `Hace ${daysAgo > 30 ? Math.floor(daysAgo/30) + ' meses' : daysAgo + ' días'}`,
      tags: reviewData.tags
    });
  }

  return {
    totalCount,
    averageRating,
    breakdown,
    reviews: selectedReviews
  };
}