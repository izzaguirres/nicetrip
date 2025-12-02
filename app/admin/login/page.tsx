'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { supabaseBrowser } from '@/lib/supabase-browser'
import { adminInputClass } from '@/components/admin/styles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const message = searchParams.get('message')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const supabase = supabaseBrowser()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        const normalized = signInError.message.toLowerCase()
        if (normalized.includes('rate limit')) {
          setError('Muitas tentativas em sequência. Aguarde um minuto e tente novamente.')
        } else {
          setError(signInError.message)
        }
        setLoading(false)
        return
      }
      router.replace('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f5f6fb] via-[#eef1f8] to-[#e5e9f4] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff80_0%,transparent_55%)]" />

      <div className="relative z-10 flex w-full max-w-[420px] flex-col gap-8 rounded-[32px] border border-white/60 bg-white/85 p-8 shadow-[0_40px_120px_rgba(15,23,42,0.18)] backdrop-blur-2xl">
        <div className="mx-auto flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/70 bg-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
            <Image src="/images/nicetrip-logo-1.png" alt="Nice Trip" width={48} height={48} priority />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Nice Trip Admin</h1>
          <p className="mt-1 text-sm text-slate-500">Acesse com sua conta administrativa para gerenciar o cockpit.</p>
          {message && <p className="mt-3 text-xs text-orange-500">{message}</p>}
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className={adminInputClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className={adminInputClass}
            />
          </div>

          {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 py-3 text-base font-semibold shadow-[0_18px_40px_rgba(249,115,22,0.35)] transition hover:from-orange-500 hover:to-orange-600"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Precisa de acesso?{' '}
          <Link className="font-medium text-orange-500 hover:underline" href="mailto:contato@nicetrip.com">
            contato@nicetrip.com
          </Link>
        </p>
      </div>
    </div>
  )
}
