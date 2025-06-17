# 📦 PROJECT CONFIG BACKUP v2.0
**Sistema Inteligente de Recomendação Completo**

## 🚀 VERSÕES ATUAIS

### Node.js & Package Manager
- **Node.js**: v18+ (recomendado)
- **Package Manager**: npm (compatible com pnpm)
- **Next.js**: v14.2.3

### 📋 DEPENDÊNCIAS PRINCIPAIS
```json
{
  "@headlessui/react": "^2.0.4",
  "@heroicons/react": "^2.1.3",
  "@radix-ui/react-select": "^2.1.1",
  "@radix-ui/react-slot": "^1.1.0",
  "@supabase/supabase-js": "^2.43.2",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.1",
  "date-fns": "^3.6.0",
  "lucide-react": "^0.379.0",
  "next": "14.2.3",
  "react": "^18",
  "react-dom": "^18",
  "tailwind-merge": "^2.3.0",
  "tailwindcss-animate": "^1.0.7"
}
```

## 🔧 CONFIGURAÇÕES CRÍTICAS

### `.env.local` (Necessário)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration (para GPT suggestions)
OPENAI_API_KEY=your_openai_key
```

### `next.config.mjs`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/izzaguirres/nicetrip/**',
      },
    ],
  },
};

export default nextConfig;
```

## 🗄️ ESTRUTURA DE BANCO (Supabase)

### Tabela Principal: `disponibilidades`
```sql
CREATE TABLE disponibilidades (
  id SERIAL PRIMARY KEY,
  cidade_saida VARCHAR(100),
  destino VARCHAR(100),
  data_saida DATE,
  transporte VARCHAR(50),
  hotel VARCHAR(200),
  quarto_tipo VARCHAR(100),
  capacidade INTEGER,
  preco_adulto DECIMAL(10,2),
  preco_crianca_0_3 DECIMAL(10,2),
  preco_crianca_4_5 DECIMAL(10,2),
  preco_crianca_6_mais DECIMAL(10,2),
  noites_hotel INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Índices para Performance
```sql
CREATE INDEX idx_disponibilidades_destino ON disponibilidades(destino);
CREATE INDEX idx_disponibilidades_data_saida ON disponibilidades(data_saida);
CREATE INDEX idx_disponibilidades_transporte ON disponibilidades(transporte);
CREATE INDEX idx_disponibilidades_capacidade ON disponibilidades(capacidade);
```

## 🎨 COMPONENTES PRINCIPAIS

### Core Components
- `app/page.tsx` - Homepage com filtros
- `app/resultados/page.tsx` - **SISTEMA INTELIGENTE** (arquivo principal)
- `components/unified-search-filter.tsx` - Filtro unificado
- `components/header.tsx` - Header responsivo
- `components/footer.tsx` - Footer

### UI Components (Shadcn/ui)
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/select.tsx`
- `components/ui/badge.tsx`
- `components/ui/calendar.tsx`

## 🧠 FUNCIONALIDADES INTELIGENTES

### 1. Sistema de Diversificação
**Arquivo**: `app/resultados/page.tsx`
**Função**: `filtrarPacotesValidos()`
**Linha**: ~208

### 2. Filtro de Capacidade
**Arquivo**: `app/resultados/page.tsx`
**Função**: `verificarCapacidadeQuartos()`
**Linha**: ~193

### 3. Proximidade Temporal
**Arquivo**: `app/resultados/page.tsx`
**Seção**: Etapa 3 - Seleção por hotel
**Linha**: ~280

## 🔄 COMANDOS DE SETUP

### Instalação Inicial
```bash
cd /path/to/project
npm install
```

### Desenvolvimento
```bash
npm run dev
# Servidor: http://localhost:3000
```

### Build & Deploy
```bash
npm run build
npm start
```

## 🛡️ BACKUP FILES IMPORTANTES

### Backups Existentes
- `BACKUP_FILTROS_FINALIZADOS_README.md` - v1.0 Filtros básicos
- `BACKUP_TIMEZONE_FIXES_README.md` - Correções de timezone
- `BACKUP_UI_IMPROVED_README.md` - Melhorias de UI
- `BACKUP_SISTEMA_INTELIGENTE_RECOMENDACAO_README.md` - **v2.0 ATUAL**

### Arquivos de Configuração
- `PROJECT_CONFIG_BACKUP_v2.0.md` - **ESTE ARQUIVO**
- `CONFIGURACAO_VARIAVEIS_AMBIENTE.md` - Setup das env vars
- `STATUS_PROJETO_FINAL_2025.md` - Status geral

## 🚨 TROUBLESHOOTING

### Problema Comum 1: Cards Limitados a 6
**Solução**: Verificar `app/resultados/page.tsx` linha ~800
- Não deve ter `slice(0,6)` ou `slice(3,6)`
- UI deve usar `resultados.map()` sem limitação

### Problema Comum 2: Quartos Inadequados Aparecendo
**Solução**: Verificar filtro de capacidade linha ~193
- `verificarCapacidadeQuartos()` deve retornar `false` para inadequados
- Console deve mostrar "REMOVIDO:" para quartos inadequados

### Problema Comum 3: Datas Distantes em Sugestões
**Solução**: Verificar proximidade temporal linha ~280
- Algoritmo deve priorizar `proximidadeData` sobre `pontuacao`
- Console deve mostrar "dias de diferença" para cada opção

## 📊 MÉTRICAS DE SUCESSO

### Performance KPIs
- ✅ Tempo de carregamento < 2s
- ✅ Máximo 12 cards renderizados
- ✅ Zero quartos inadequados exibidos
- ✅ 100% relevância temporal

### User Experience KPIs  
- ✅ Diversidade: 1 resultado por hotel
- ✅ Proximidade: Sugestões ≤30 dias quando possível
- ✅ Flexibilidade: Todos os hotéis quando há >3 próximos
- ✅ Precisão: Apenas quartos que comportam pessoas solicitadas

---

**🎯 SISTEMA STATUS**: ✅ FUNCIONANDO PERFEITAMENTE
**📅 ÚLTIMA ATUALIZAÇÃO**: Dezembro 3, 2024
**🔧 PRÓXIMA REVISÃO**: Conforme necessidade 