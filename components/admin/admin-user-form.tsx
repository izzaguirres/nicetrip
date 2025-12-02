"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { adminInputClass, adminSelectTriggerClass } from '@/components/admin/styles'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { AdminUser } from '@/lib/admin-users'

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Operação' },
]

interface AdminUserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  initialUser?: AdminUser
  onSaved?: () => void
}

export function AdminUserForm({ open, onOpenChange, mode, initialUser, onSaved }: AdminUserFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [role, setRole] = useState('admin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (mode === 'edit' && initialUser) {
      setEmail(initialUser.email ?? '')
      setDisplayName(initialUser.display_name ?? '')
      setPhone(initialUser.phone ?? '')
      setAvatarUrl(initialUser.avatar_url ?? '')
      setRole(initialUser.role ?? 'admin')
    } else if (mode === 'create') {
      setEmail('')
      setPassword('')
      setDisplayName('')
      setPhone('')
      setAvatarUrl('')
      setRole('admin')
    }
  }, [mode, initialUser, open])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload: Record<string, unknown> = {
        display_name: displayName,
        phone,
        avatar_url: avatarUrl,
        role,
      }

      let response: Response
      if (mode === 'create') {
        payload.email = email
        payload.password = password
        response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else if (initialUser) {
        payload.user_id = initialUser.user_id
        response = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        throw new Error('Usuário não selecionado')
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Erro ao salvar usuário')
      }

      onOpenChange(false)
      if (mode === 'create') {
        setEmail('')
        setPassword('')
      }
      toast({
        title: mode === 'create' ? 'Usuário criado' : 'Usuário atualizado',
        description:
          mode === 'create'
            ? 'O colaborador já pode acessar o painel admin.'
            : 'Os dados foram atualizados com sucesso.',
      })
      onSaved?.()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      toast({
        variant: 'destructive',
        title: mode === 'create' ? 'Falha ao criar usuário' : 'Falha ao atualizar',
        description: err instanceof Error ? err.message : 'Erro inesperado',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true)
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
        toast({ title: 'Avatar atualizado', description: 'Imagem salva, finalize o formulário.' })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Falha no upload',
        description: error instanceof Error ? error.message : 'Erro inesperado',
      })
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) handleAvatarUpload(file)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Novo usuário admin' : 'Editar usuário'}
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'create' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={adminInputClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha inicial</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={adminInputClass}
                />
                <p className="text-xs text-muted-foreground">
                  A senha pode ser provisória; o colaborador pode alterar depois via fluxo de recuperação.
                </p>
              </div>
            </>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="display_name">Nome completo</Label>
              <Input
                id="display_name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Ex.: Juliana Operações"
                className={adminInputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone/WhatsApp</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+55 48 99999-0000"
                className={adminInputClass}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="avatar"
                  value={avatarUrl}
                  onChange={(event) => setAvatarUrl(event.target.value)}
                  placeholder="URL da imagem"
                  className={adminInputClass}
                />
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFileChange} />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}>
                  {uploadingAvatar ? 'Enviando...' : 'Upload'}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Função</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className={adminSelectTriggerClass}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : mode === 'create' ? 'Criar usuário' : 'Salvar mudanças'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
