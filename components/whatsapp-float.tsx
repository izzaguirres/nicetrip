"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, MessageCircle, X } from "lucide-react"
import { openWhatsapp, logWhatsappConversion } from "@/lib/whatsapp"

export default function WhatsappFloat() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onClickAway = (e: MouseEvent) => {
      if (!panelRef.current) return
      if (open && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClickAway)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClickAway)
    }
  }, [open])

  const send = () => {
    const msg = (message && message.trim().length > 0)
      ? message.trim()
      : 'Hola! 👋 Me gustaría hablar con Nice Trip.'
    const encoded = encodeURIComponent(msg)
    logWhatsappConversion({ origem: 'whatsapp-float', mensagem: msg })
    openWhatsapp('', encoded)
  }

  return (
    <div className="fixed z-[10000] bottom-24 md:bottom-5 right-5 flex flex-col items-end">
      {open && (
        <div ref={panelRef} className="mb-3 w-[320px] rounded-2xl bg-[#0f3c33] text-white shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-[#1b5a4f]">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold">Nice Trip</span>
            </div>
            <button aria-label="Fechar" className="p-1 rounded-full hover:bg-white/10" onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-4 pt-3">
            <div className="inline-flex bg-white text-[#0f3c33] rounded-2xl px-3 py-2 text-sm shadow">
              Descreva abaixo.
            </div>
          </div>
          <div className="px-4 py-3">
            <textarea
              className="w-full min-h-[110px] rounded-xl bg-[#e6f5f1] text-[#0f3c33] placeholder:text-[#5d7b75] text-sm p-3 outline-none"
              placeholder="Preciso de..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="px-4 pb-4">
            <button
              onClick={send}
              className="w-full rounded-2xl bg-[#1b5a4f] text-white py-3 text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#1f6a5d] transition-colors"
            >
              Ir para o Whatsapp
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir WhatsApp"
        className="h-14 w-14 rounded-full bg-[#25D366] shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-200 flex items-center justify-center"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </button>
    </div>
  )
}

