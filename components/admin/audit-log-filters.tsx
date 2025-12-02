"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { adminInputClass, adminSelectTriggerClass } from '@/components/admin/styles'

interface AuditLogFiltersProps {
  entities: string[]
  actions: string[]
  initial: {
    entity?: string
    action?: string
    performedBy?: string
    days: number
  }
}

export function AuditLogFilters({ entities, actions, initial }: AuditLogFiltersProps) {
  const router = useRouter()
  const [entity, setEntity] = useState(initial.entity ?? 'ALL')
  const [action, setAction] = useState(initial.action ?? 'ALL')
  const [performedBy, setPerformedBy] = useState(initial.performedBy ?? '')
  const [days, setDays] = useState(String(initial.days ?? 7))

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (entity && entity !== 'ALL') params.set('entity', entity)
    if (action && action !== 'ALL') params.set('action', action)
    if (performedBy) params.set('performedBy', performedBy)
    if (days) params.set('days', days)
    router.replace(`/admin/audit-log?${params.toString()}`)
  }

  const handleReset = () => {
    setEntity('ALL')
    setAction('ALL')
    setPerformedBy('')
    setDays('7')
    router.replace('/admin/audit-log')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-[minmax(0,220px)_minmax(0,220px)_minmax(0,220px)_minmax(0,160px)_auto]"
    >
      <div className="grid gap-1.5">
        <span className="text-xs font-medium text-muted-foreground uppercase">Entidade</span>
        <Select value={entity} onValueChange={setEntity}>
          <SelectTrigger className={adminSelectTriggerClass}>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas</SelectItem>
            {entities.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <span className="text-xs font-medium text-muted-foreground uppercase">Ação</span>
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className={adminSelectTriggerClass}>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas</SelectItem>
            {actions.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <span className="text-xs font-medium text-muted-foreground uppercase">Usuário</span>
        <Input
          value={performedBy}
          onChange={(event) => setPerformedBy(event.target.value)}
          placeholder="UUID do usuário"
          className={adminInputClass}
        />
      </div>
      <div className="grid gap-1.5">
        <span className="text-xs font-medium text-muted-foreground uppercase">Período</span>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className={adminSelectTriggerClass}>
            <SelectValue placeholder="7 dias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end gap-2">
        <Button type="submit">Filtrar</Button>
        <Button type="button" variant="outline" onClick={handleReset}>
          Limpar
        </Button>
      </div>
    </form>
  )
}
