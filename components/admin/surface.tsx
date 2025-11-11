import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface AdminSurfaceProps {
  children: ReactNode
  className?: string
}

export function AdminSurface({ children, className }: AdminSurfaceProps) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-white/60 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl',
        className,
      )}
    >
      {children}
    </div>
  )
}
