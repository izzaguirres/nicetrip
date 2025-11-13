"use client"

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSurface } from '@/components/admin/surface'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'

interface ProfileSettingsCardProps {
  profile: {
    displayName: string
    phone: string
    avatarUrl: string
    email: string
  } | null
}

const getInitials = (name: string, email: string) => {
  const source = name || email
  return source
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function ProfileSettingsCard({ profile }: ProfileSettingsCardProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [displayName, setDisplayName] = useState(profile?.displayName ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? '')

  if (!profile) return null

  const handleAvatarUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/admin/users/upload-avatar', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Erro no upload')
      }
      const data = await response.json()
      if (data.url) {
        setAvatarUrl(data.url)
        toast({ title: 'Foto atualizada', description: 'Novo avatar salvo, lembre-se de salvar o perfil.' })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Falha no upload',
        description: error instanceof Error ? error.message : 'Erro inesperado',
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleAvatarUpload(file)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName,
          phone,
          avatar_url: avatarUrl,
        }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Falha ao atualizar perfil')
      }
      toast({ title: 'Perfil atualizado', description: 'Suas informações foram salvas.' })
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: error instanceof Error ? error.message : 'Erro inesperado',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminSurface className="space-y-5 p-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={avatarUrl || undefined} alt={displayName || profile.email} />
          <AvatarFallback>{getInitials(displayName, profile.email)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Seu perfil</p>
          <h3 className="text-lg font-semibold text-slate-900">{displayName || 'Usuário sem nome'}</h3>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
        </div>
        <div className="ml-auto flex flex-col items-end gap-2 text-xs text-muted-foreground">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFileChange} />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Enviando...' : 'Trocar foto'}
          </Button>
          <span>PNG/JPG até 2MB</span>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Nome completo</Label>
            <Input
              id="profile-name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Ex.: Maria Operações"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-phone">Telefone</Label>
            <Input
              id="profile-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="WhatsApp do plantão"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-avatar">Avatar (URL)</Label>
            <Input
              id="profile-avatar"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </form>
    </AdminSurface>
  )
}
