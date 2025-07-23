"use client"

import { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { Phone, Mail, MapPin, Instagram } from 'lucide-react'

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
    console.log('Form data submitted:', formData)
    // Aqui viria a lógica para enviar o formulário
    alert('Mensaje enviado con éxito! (Simulación)')
  }

  return (
    <div className="bg-gray-50">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative w-full h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden">
          <Image
            src="/images/contacto.jpg"
            alt="Escritório moderno"
            fill
            className="object-cover"
            priority
          />
        </section>

        {/* Content Section */}
        <section className="py-16 lg:py-24">
          <div className="relative z-10 container mx-auto px-4 lg:px-[70px] h-full flex flex-col justify-center items-center text-center text-white">
            {/* Text removed from here */}
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-[70px]">
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                ¡Ponte en Contacto!
              </h1>
              <p className="mt-4 text-lg max-w-2xl mx-auto text-gray-600">
                Estamos siempre listos para atender tus necesidades y aclarar tus dudas.
              </p>
            </div>
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Form Column */}
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">Envía tu mensaje</h2>
                  <p className="mt-2 text-gray-600">
                    Estaremos encantados de recibir tu mensaje. Estamos a tu disposición para cualquier duda.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="font-semibold text-gray-700">Nombre*</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Tu nombre"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="font-semibold text-gray-700">Email*</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp" className="font-semibold text-gray-700">Whatsapp*</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="+54 9..."
                      value={formData.whatsapp}
                      onChange={handleChange}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message" className="font-semibold text-gray-700">Mensaje*</Label>
                    <Textarea
                      id="message"
                      placeholder="Deja tu mensaje aquí..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="mt-2 min-h-[150px]"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg">
                    Enviar Mensaje
                  </Button>
                </form>
              </div>

              {/* Contact Info Column */}
              <div className="lg:col-span-1">
                <div className="bg-orange-500 text-white p-8 rounded-2xl sticky top-28">
                  <h3 className="text-2xl font-bold mb-6">Habla con nosotros</h3>
                  <div className="space-y-5 text-sm">
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Teléfono y WhatsApp</p>
                        <a href="tel:+5548998601754" className="hover:underline opacity-80">+55 48 99860-1754</a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Instagram className="w-5 h-5 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Instagram</p>
                        <a href="https://www.instagram.com/nicetripturismo/" target="_blank" rel="noopener noreferrer" className="hover:underline opacity-80">@nicetripturismo</a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Email</p>
                        <a href="mailto:reservas@nicetripturismo.com.br" className="hover:underline opacity-80">reservas@nicetripturismo.com.br</a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Dirección</p>
                        <p className="opacity-80">Rua Madre Maria Villac, 1189 - Sala 4 - Canasvieiras, Florianópolis - SC, 88054-000</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
} 