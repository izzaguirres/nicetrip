"use client"

import { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Clock, 
  MessageCircle, 
  ArrowRight, 
  Send 
} from 'lucide-react'
import { FadeIn } from "@/components/ui/fade-in"
import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Simulação de envio
    alert('¡Mensaje enviado! Entraremos en contacto pronto.')
  }

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-orange-100 selection:text-orange-900">
      <Header />
      
      <main className="pt-32 pb-24">
        {/* Hero Section - Typography Focused */}
        <section className="container mx-auto px-4 lg:px-[70px] mb-20">
          <FadeIn>
            <span className="text-orange-600 font-bold tracking-widest text-xs uppercase mb-4 block">Contacto</span>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-8 max-w-4xl leading-[1.1]">
              Estamos aquí para <br className="hidden md:block" />
              <span className="text-slate-400">ayudar en tu viaje.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
              Ya sea una duda sobre paquetes, una solicitud especial o simplemente para decir hola. Nuestro equipo está listo para atenderte.
            </p>
          </FadeIn>
        </section>

        <div className="container mx-auto px-4 lg:px-[70px]">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
            
            {/* Left Column: Bento Grid Contact Info */}
            <div className="lg:col-span-5 space-y-6">
              <FadeIn delay={0.2}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                  
                  {/* WhatsApp Card - Primary Action */}
                  <motion.a 
                    href="https://wa.me/5548998601754" 
                    target="_blank"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-[#25D366] p-6 rounded-3xl text-white shadow-lg hover:shadow-xl transition-all relative overflow-hidden group md:col-span-2 lg:col-span-1"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <MessageCircle size={120} />
                    </div>
                    <div className="relative z-10">
                      <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-1">WhatsApp</h3>
                      <p className="text-white/90 text-sm mb-6">Respuesta rápida en horario comercial.</p>
                      <div className="flex items-center font-bold text-sm bg-white/20 w-fit px-4 py-2 rounded-full backdrop-blur-sm">
                        Iniciar Chat <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  </motion.a>

                  {/* Info Cards Grid */}
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                      <Mail className="w-5 h-5 text-slate-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Email</h3>
                    <a href="mailto:reservas@nicetripturismo.com.br" className="text-slate-500 text-sm hover:text-orange-600 transition-colors break-words">
                      reservas@nicetripturismo.com.br
                    </a>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                      <Instagram className="w-5 h-5 text-slate-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Instagram</h3>
                    <a href="https://instagram.com/nicetripturismo" target="_blank" className="text-slate-500 text-sm hover:text-orange-600 transition-colors">
                      @nicetripturismo
                    </a>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:border-slate-200 transition-colors md:col-span-2 lg:col-span-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                        <MapPin className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Abierto Ahora
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Oficina Central</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">
                      Rua Madre Maria Villac, 1189 - Sala 4<br />
                      Canasvieiras, Florianópolis - SC
                    </p>
                    <div className="h-32 w-full bg-slate-200 rounded-xl overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-500">
                         {/* Placeholder map - Em produção usar Google Maps Embed */}
                         <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-100">
                            <span className="text-xs font-medium">Mapa Interativo</span>
                         </div>
                    </div>
                  </div>

                </div>
              </FadeIn>
            </div>

            {/* Right Column: Clean Form */}
            <div className="lg:col-span-7">
              <FadeIn delay={0.4}>
                <div className="bg-white p-0 lg:pl-12">
                  <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    Envíame un mensaje
                    <span className="h-px flex-1 bg-slate-100"></span>
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre Completo</Label>
                        <Input
                          id="name"
                          placeholder="Ej. Juan Pérez"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="border-0 border-b border-slate-200 rounded-none px-0 py-2 focus-visible:ring-0 focus-visible:border-orange-500 transition-colors placeholder:text-slate-300 text-lg"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp" className="text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp</Label>
                        <Input
                          id="whatsapp"
                          type="tel"
                          placeholder="+54 9..."
                          value={formData.whatsapp}
                          onChange={handleChange}
                          required
                          className="border-0 border-b border-slate-200 rounded-none px-0 py-2 focus-visible:ring-0 focus-visible:border-orange-500 transition-colors placeholder:text-slate-300 text-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="border-0 border-b border-slate-200 rounded-none px-0 py-2 focus-visible:ring-0 focus-visible:border-orange-500 transition-colors placeholder:text-slate-300 text-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mensaje</Label>
                      <Textarea
                        id="message"
                        placeholder="Cuéntanos sobre tu viaje ideal..."
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="border-0 border-b border-slate-200 rounded-none px-0 py-2 focus-visible:ring-0 focus-visible:border-orange-500 transition-colors placeholder:text-slate-300 text-lg min-h-[120px] resize-none"
                      />
                    </div>

                    <div className="pt-4">
                      <Button type="submit" className="h-14 px-8 rounded-full bg-slate-900 hover:bg-orange-600 text-white font-bold text-sm tracking-wide transition-all w-full md:w-auto group">
                        Enviar Solicitud
                        <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </form>

                  {/* FAQ Section Mini */}
                  <div className="mt-20">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Preguntas Frecuentes</h3>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1" className="border-b-slate-100">
                        <AccordionTrigger className="text-slate-700 hover:text-orange-600 hover:no-underline text-sm">¿Cuál es el horario de atención?</AccordionTrigger>
                        <AccordionContent className="text-slate-500">
                          Atendemos de Lunes a Sábado de 09:00 a 19:00. Domingos solo urgencias vía WhatsApp.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2" className="border-b-slate-100">
                        <AccordionTrigger className="text-slate-700 hover:text-orange-600 hover:no-underline text-sm">¿Realizan reservas personalizadas?</AccordionTrigger>
                        <AccordionContent className="text-slate-500">
                          Sí, armamos paquetes a medida para grupos, parejas o viajes individuales según tus necesidades.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3" className="border-b-0">
                        <AccordionTrigger className="text-slate-700 hover:text-orange-600 hover:no-underline text-sm">¿Cuáles son las formas de pago?</AccordionTrigger>
                        <AccordionContent className="text-slate-500">
                          Aceptamos transferencias bancarias (Reales/Pesos), tarjetas de crédito y efectivo en la agencia.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                </div>
              </FadeIn>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
 