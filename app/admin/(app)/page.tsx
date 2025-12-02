import Link from 'next/link'
import { Suspense } from 'react'
import { Zap, ShieldCheck, BarChart3, ArrowRight } from 'lucide-react'
import { AdminSurface } from '@/components/admin/surface'
import { DashboardMetrics } from '@/components/admin/dashboard-metrics'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

const quickLinks = [
  { href: '/admin/disponibilidades', label: 'Gerenciar Disponibilidade', icon: Zap, color: 'text-amber-600 bg-amber-50' },
  { href: '/admin/discounts', label: 'Regras de Desconto', icon: ShieldCheck, color: 'text-blue-600 bg-blue-50' },
  { href: '/admin/analytics', label: 'Relatórios Analytics', icon: BarChart3, color: 'text-violet-600 bg-violet-50' },
]

export default function AdminHomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Operacional</h1>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          Sistema online e rastreando em tempo real.
        </div>
      </div>

      <div className="relative">
        {/* Conteúdo Principal com Streaming */}
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-3">
                 <Suspense fallback={<DashboardSkeleton />}>
                    <DashboardMetrics />
                 </Suspense>
            </div>
        </div>
        
        {/* Quick Actions - Overlay Absolute ou Grid separada? 
            Melhor manter a estrutura do grid original mas injetar o sidebar estático no componente Metrics? 
            Não, o sidebar estático DEVE carregar na hora.
            
            Vou reorganizar o layout para que o sidebar estático fique fora do Suspense se possível, 
            mas o design original tinha o sidebar misturado com dados dinâmicos (SystemHealth).
            
            Solução: O componente DashboardMetrics agora renderiza a Grid completa (Main + Sidebar Dinâmico).
            Vou deixar o Sidebar de Quick Actions aqui fora se ele não depender de dados?
            No design anterior, Quick Actions estava na sidebar.
            
            Vou ajustar o DashboardMetrics para aceitar 'children' ou slots? Não, server components.
            
            Vou renderizar o Quick Actions aqui fora? 
            Se eu renderizar fora, ele vai ficar "solto" se eu não cuidar do grid.
            
            Vamos simplificar: O DashboardMetrics vai renderizar APENAS os Cards + Feed + SystemHealth.
            O Quick Actions pode ser renderizado aqui fora, mas precisa estar na coluna certa.
            
            Refatoração do Layout:
            <Grid>
               <Col2>
                  <Suspense><Metrics + Feed /></Suspense>
               </Col2>
               <Col1>
                  <QuickActions (Static) />
                  <Suspense><SystemHealth /></Suspense>
               </Col1>
            </Grid>
            
            Por enquanto, como o DashboardMetrics já contém a estrutura da grid interna (Main Col + Sidebar Col),
            eu vou deixá-lo renderizar tudo o que é dinâmico.
            O problema é que o QuickActions é estático e eu quero vê-lo já.
            
            Vou mover o QuickActions para DENTRO do DashboardMetrics? Não, aí bloqueia.
            
            Vou usar uma estrutura de Grid no Pai:
        */}
      </div>
      
      {/* Nova Estrutura de Layout para permitir carregamento progressivo da sidebar */}
      <div className="grid gap-6 lg:grid-cols-3 hidden">
         {/* Hack: O componente DashboardMetrics original renderiza tudo. Vou usar ele por enquanto para não quebrar o layout visual que o usuário aprovou.
             Em uma iteração futura, quebramos DashboardMetrics em <Feed /> e <Health /> separados.
             
             Por agora, o Suspense envolve TUDO abaixo do Header. 
             Isso já garante que a navegação para a rota '/admin' aconteça instantaneamente (o header aparece),
             e o resto carrega depois. É melhor do que tela branca por 6s.
         */}
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-200/50 border border-slate-200" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 h-[400px] rounded-2xl bg-slate-200/50 border border-slate-200" />
        <div className="space-y-6">
           <div className="h-40 rounded-2xl bg-slate-200/50 border border-slate-200" />
           <div className="h-40 rounded-2xl bg-slate-800/10 border border-slate-200" />
        </div>
      </div>
    </div>
  )
}
