"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Clock, Users, MapPin, Bus, Star, Info } from "lucide-react"
import type { Paseo } from "@/lib/passeios-service"
import { getPaseoCoverImage } from "@/lib/paseos-data"
import { FadeIn } from "@/components/ui/fade-in"

interface PaseoCardProps {
  passeio: Paseo
}

export function PaseoCard({ passeio }: PaseoCardProps) {
  // O preço será implementado futuramente
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
    <FadeIn>
      <div className="group bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 flex flex-col overflow-hidden h-full hover:-translate-y-1">
        
        {/* Imagem Imersiva */}
        <div className="relative w-full h-64 overflow-hidden">
          <Image
            src={getCoverImage()}
            alt={`Foto de ${passeio.nome}`}
            layout="fill"
            objectFit="cover"
            className="group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
          
          {/* Badge de Categoria */}
          <div className="absolute bottom-3 left-3">
             <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm border border-white/50">
               Paseo & Excursión
             </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 p-5 md:p-6">
          {/* Cabeçalho */}
          <div className="mb-4">
            <h3 className="font-manrope text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-1 group-hover:text-orange-600 transition-colors">
              {passeio.nome}
            </h3>
            <div className="flex items-center text-sm text-gray-500 gap-2">
              <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" strokeWidth={1.5} />
              <span className="truncate font-medium">{passeio.local || 'Florianópolis e Região'}</span>
            </div>
          </div>

          {/* Subtítulo / Descrição Curta */}
          <p className="text-sm text-gray-600 mb-6 line-clamp-2 min-h-[2.5em]">
            {passeio.subtitulo || "Disfruta de los mejores paisajes y experiencias únicas con nuestro equipo especializado."}
          </p>

          {/* Info Grid - Design Refinado */}
          <div className="grid grid-cols-2 gap-3 mb-5">
             {/* Frequência */}
             <div className="bg-slate-100 rounded-2xl p-3 flex flex-col items-start justify-center hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-100">
                <div className="flex items-center gap-1.5 text-slate-600 mb-1">
                   <Calendar className="w-4 h-4 text-orange-600" strokeWidth={1.5} />
                   <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">Frecuencia</span>
                </div>
                <span className="text-sm font-bold text-slate-900 capitalize tracking-tight">
                   Diariamente
                </span>
             </div>

             {/* Duração */}
             <div className="bg-slate-100 rounded-2xl p-3 flex flex-col items-start justify-center hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-100">
                <div className="flex items-center gap-1.5 text-slate-600 mb-1">
                   <Clock className="w-4 h-4 text-orange-600" strokeWidth={1.5} />
                   <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">Duración</span>
                </div>
                <span className="text-sm font-bold text-slate-900 capitalize tracking-tight">
                   {passeio.duracion || 'Día completo'}
                </span>
             </div>

             {/* Transporte */}
             <div className="bg-slate-100 rounded-2xl p-3 flex flex-col items-start justify-center hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-100">
                <div className="flex items-center gap-1.5 text-slate-600 mb-1">
                   <Bus className="w-4 h-4 text-orange-600" strokeWidth={1.5} />
                   <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">Transporte</span>
                </div>
                <span className="text-sm font-bold text-slate-900 truncate w-full capitalize tracking-tight">
                   Ida y Vuelta
                </span>
             </div>

             {/* Guia */}
             <div className="bg-slate-100 rounded-2xl p-3 flex flex-col items-start justify-center hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-100">
                <div className="flex items-center gap-1.5 text-slate-600 mb-1">
                   <Users className="w-4 h-4 text-orange-600" strokeWidth={1.5} />
                   <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">Guía</span>
                </div>
                <span className="text-sm font-bold text-slate-900 truncate w-full capitalize tracking-tight">
                   Español/Port
                </span>
             </div>
          </div>
          
          <div className="flex-1"></div>
          <div className="border-t border-gray-100 my-4"></div>

          {/* Footer de Ação */}
          <div className="flex items-center justify-between gap-4 mt-2">
             <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-400 mb-0.5 uppercase tracking-wide">Valor</span>
                <span className="text-xl font-bold text-slate-900">
                  A Consultar
                </span>
             </div>

             <Link href={`/detalhes-passeio?id=${passeio.id}`} passHref className="w-auto">
                <Button className="group relative bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 h-12 font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
                   <span className="relative z-10 flex items-center">
                     Ver detalles <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                   </span>
                </Button>
             </Link>
          </div>

        </div>
      </div>
    </FadeIn>
  )
}