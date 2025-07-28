"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Clock, Users, MapPin, Bus, Star } from "lucide-react"
import type { Paseo } from "@/lib/passeios-service"
import { getPaseoCoverImage } from "@/lib/paseos-data"

interface PaseoCardProps {
  passeio: Paseo
}

export function PaseoCard({ passeio }: PaseoCardProps) {
  // O preço será implementado futuramente, por enquanto deixamos um placeholder
  const finalPrice = passeio.preco_adulto || 0; 
  
  const formatPrice = (price: number) => {
    const validPrice = Number(price) || 0;
    if (isNaN(validPrice)) return 'USD 0';
    return `USD ${Math.round(validPrice).toLocaleString('es-AR')}`;
  }

  const getCoverImage = () => {
    // ✅ NOVOS PASSEIOS: Força uso do sistema local (funciona no deploy)
    const novosPasseios = ['Bombinhas', 'City Tour – Florianópolis', 'Guarda do Embaú', 'Mergulho', 'Aqua Show Park'];
    if (novosPasseios.includes(passeio.nome || '')) {
      return getPaseoCoverImage(passeio.nome || 'fallback');
    }

    // ✅ PASSEIOS ANTIGOS: Prioriza imagem do Supabase se existir
    if (passeio.imagem_url) return passeio.imagem_url;

    // ✅ FALLBACK: Usa o sistema centralizado de imagens
    return getPaseoCoverImage(passeio.nome || 'fallback');
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-lg p-3 flex flex-col gap-4 hover:shadow-2xl transition-shadow duration-300">
      <div className="relative h-64 w-full overflow-hidden rounded-2xl">
        <Image
          src={getCoverImage()}
          alt={`Foto de ${passeio.nome}`}
          layout="fill"
          objectFit="cover"
        />
      </div>

      <div className="flex flex-col gap-4 px-4 pb-2">
        <div className="text-left">
          <h3 className="font-manrope text-2xl font-bold text-gray-900">{passeio.nome}</h3>
          <p className="text-sm text-gray-600">{passeio.subtitulo}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 rounded-xl border p-2"><Calendar className="h-4 w-4 text-orange-500"/><span>Diariamente</span></div>
          <div className="flex items-center gap-2 rounded-xl border p-2"><Clock className="h-4 w-4 text-orange-500"/><span>{passeio.duracion || 'Dia completo'}</span></div>
          <div className="flex items-center gap-2 rounded-xl border p-2"><Bus className="h-4 w-4 text-orange-500"/><span>Transporte Incluso</span></div>
          <div className="flex items-center gap-2 rounded-xl border p-2"><Users className="h-4 w-4 text-orange-500"/><span>Guia Turístico</span></div>
        </div>
        
        <div className="mt-2 flex flex-col gap-3 border-t pt-4">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">à Consultar</p>
          </div>
          <Link href={`/detalhes-passeio?id=${passeio.id}`} passHref className="w-full">
            <Button className="w-full rounded-xl bg-orange-500 px-6 py-5 font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 hover:shadow-orange-500/40">
              Ver detalles <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 