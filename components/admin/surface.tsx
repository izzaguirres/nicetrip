import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface AdminSurfaceProps {
  children: ReactNode
  className?: string
  noPadding?: boolean
}

export function AdminSurface({ children, className, noPadding = false }: AdminSurfaceProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm transition-all hover:shadow-md',
        !noPadding && 'p-6',
        className,
      )}
    >
      {children}
    </div>
  )
}
