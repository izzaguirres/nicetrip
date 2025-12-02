"use client"

import { useState } from "react"
import Image, { StaticImageData } from "next/image"
import { ChevronLeft, ChevronRight, Camera } from "lucide-react"

interface PackageGalleryProps {
  images: (string | StaticImageData)[]
}

export function PackageGallery({ images }: PackageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const nextImage = () => setCurrentImageIndex((prev) => prev === images.length - 1 ? 0 : prev + 1)
  const prevImage = () => setCurrentImageIndex((prev) => prev === 0 ? images.length - 1 : prev - 1)
  
  const handleTouchStart = (e: React.TouchEvent) => { setTouchEnd(0); setTouchStart(e.targetTouches[0].clientX) }
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX)
  const handleTouchEnd = () => { if (!touchStart || !touchEnd) return; const distance = touchStart - touchEnd; if (distance > 50) nextImage(); if (distance < -50) prevImage() }

  if (!images || images.length === 0) return null

  return (
    <>
      <div className="mb-8">
        {/* Mobile Carousel */}
        <div className="lg:hidden">
          <div className="relative">
            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-2 px-4 -mx-4">
              {images.map((image, index) => (
                <div key={index} className="relative flex-shrink-0 w-[90%] snap-center" onClick={() => { setCurrentImageIndex(index); setShowAllPhotos(true) }}>
                  <div className="relative h-72 w-full rounded-2xl overflow-hidden shadow-sm">
                    <Image src={image} alt={`Imagen ${index + 1}`} fill className="object-cover" priority={index === 0} />
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute bottom-4 right-8 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
               <Camera className="w-3 h-3" />
               <span>1 / {images.length}</span>
            </div>
          </div>
        </div>

        {/* Desktop Grid - Airbnb Style */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:grid-rows-2 gap-2 h-[500px] rounded-[2rem] overflow-hidden relative">
          <div className="lg:col-span-2 lg:row-span-2 relative group cursor-pointer" onClick={() => setShowAllPhotos(true)}>
            <Image src={images[0]} alt="Imagen principal" fill className="object-cover transition-transform duration-700 group-hover:scale-105" priority />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
          {images.slice(1, 5).map((image, index) => (
            <div key={index} className="relative group h-full w-full cursor-pointer" onClick={() => setShowAllPhotos(true)}>
              <Image src={image} alt={`Imagen ${index + 2}`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          ))}
          
          {/* Botão Ver Todas - Flutuante */}
          <button 
            onClick={() => setShowAllPhotos(true)} 
            className="absolute bottom-6 right-6 bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-bold text-gray-900 flex items-center gap-2 hover:bg-gray-50 hover:scale-105 transition-all shadow-[0_8px_16px_rgba(0,0,0,0.12)]"
          >
            <Camera className="w-4 h-4" /> 
            Mostrar todas las fotos
          </button>
        </div>
      </div>

      {showAllPhotos && (
        <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center" onClick={(e) => { if (e.target === e.currentTarget) { setShowAllPhotos(false) } }}>
          <div className="absolute top-0 left-0 right-0 z-[10000] flex items-center justify-between p-4"><button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAllPhotos(false) }} className="text-white hover:bg-white/20 p-3 rounded-full transition-all flex items-center gap-2 bg-black/20 backdrop-blur-sm cursor-pointer"><ChevronLeft className="w-5 h-5" /><span className="text-sm font-medium">Volver</span></button><button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAllPhotos(false) }} className="text-white hover:bg-white/20 p-3 rounded-full transition-all text-xl font-bold bg-black/20 backdrop-blur-sm w-12 h-12 flex items-center justify-center cursor-pointer">×</button></div>
          <div className="relative w-full h-full flex items-center justify-center" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            {images.length > 1 && (<button onClick={(e) => { e.stopPropagation(); prevImage() }} className="absolute left-4 text-white hover:bg-white/20 p-3 rounded-full z-10 transition-all bg-black/20 backdrop-blur-sm"><ChevronLeft className="w-6 h-6" /></button>)}
            <Image src={images[currentImageIndex]} alt={`Foto ${currentImageIndex + 1}`} width={1200} height={800} className="max-w-full max-h-full object-contain select-none cursor-pointer" onClick={(e) => e.stopPropagation()} />
            {images.length > 1 && (<button onClick={(e) => { e.stopPropagation(); nextImage() }} className="absolute right-4 text-white hover:bg-white/20 p-3 rounded-full z-10 transition-all bg-black/20 backdrop-blur-sm"><ChevronRight className="w-6 h-6" /></button>)}
          </div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">{currentImageIndex + 1} / {images.length}</div>
          <div className="lg:hidden absolute bottom-16 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full cursor-pointer" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAllPhotos(false) }}>Toque para fechar</div>
        </div>
      )}
    </>
  )
}
