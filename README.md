# 🌴 Nice Trip v3.0 - Sistema de Pacotes Turísticos Premium

> **Plataforma completa para venda de pacotes turísticos com IA, design premium e sistema multi-quartos inteligente**

## ✨ **Principais Funcionalidades**

### 🎨 **Design System Premium v3.0**
- **Apple-style Interface**: Gradientes, micro-interações e shine effects
- **Paleta de cores profissional**: Orange #EE7215 como cor primária
- **Tipografia hierárquica**: Inter font system com pesos estratégicos
- **Componentes premium**: Botões com gradientes, cards com shadows suaves
- **Responsivo completo**: Mobile-first design otimizado

### 🏨 **Sistema Multi-Quartos Inteligente**
- **Distribuição automática**: Algoritmo que distribui pessoas entre quartos
- **Tipos dinâmicos**: Individual, Doble, Triple, Cuádruple, Quíntuple
- **Breakdown detalhado**: Mostra preço por quarto e ocupação
- **Validação inteligente**: Respeita capacidade máxima de 5 pessoas por quarto

### 🔍 **Sistema de Busca Avançado**
- **Filtros premium**: Saída, destino, data, transporte, quartos
- **Calendar inteligente**: Abre no mês correto da data selecionada
- **Validação de pessoas**: Máximo 5 pessoas com feedback visual
- **URL Parameters**: Mantém estado através da navegação

### 🤖 **Integração com IA**
- **Sugestões inteligentes**: GPT analisa preferências e sugere pacotes
- **Busca semântica**: Encontra pacotes baseado em descrição natural
- **Recommendations engine**: IA priioriza pacotes mais relevantes

### 💾 **Database & Backend**
- **Supabase Integration**: Database real-time com credenciais seguras
- **Fallback System**: Dados demo para desenvolvimento
- **Pricing Structure**: Preços individuais por faixa etária
- **Capacity Management**: 1-5 pessoas por quarto (Individual a Quíntuple)

### 🌍 **Localização Completa**
- **Espanhol nativo**: Interface 100% em espanhol
- **Formatação regional**: Datas, moedas e textos localizados
- **UX terms**: "Habitación Individual", "Cuarto", "Niños", etc.

## 🚀 **Tecnologias Utilizadas**

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **Database**: Supabase (PostgreSQL)
- **IA**: OpenAI GPT integration
- **UI Components**: shadcn/ui
- **Deployment**: Vercel ready

## 📦 **Instalação e Setup**

```bash
# Clone o repositório
git clone [repository-url]
cd nice-trip-page-complete

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Execute o projeto
npm run dev
```

### 🔑 **Variáveis de Ambiente Necessárias**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

## 🗄️ **Estrutura do Database**

### Tabela `disponibilidades`
```sql
- id: bigint (primary key)
- hotel: text
- destino: text  
- cidade_saida: text
- data_saida: date
- transporte: text
- quarto_tipo: text
- capacidade: integer (1-5)
- preco_adulto: numeric
- preco_crianca_0_3: numeric
- preco_crianca_4_5: numeric
- preco_crianca_6_mais: numeric
- noites_hotel: integer
- created_at: timestamp
```

### Tabela `hospedagens` (Nova)
```sql
- id: bigint (primary key)
- nome: text (nome do hotel)
- inclusos: json (serviços inclusos)
- comodidades: json (comodidades do hotel)
- created_at: timestamp
```

### Tabela `package_content_templates` (Nova v3.4)
```sql
- id: serial (primary key)
- transporte: varchar(10) (Bus/Aéreo)
- destino: varchar(100) (nullable)
- hotel: varchar(255) (nullable)
- titulo: varchar(255)
- descricao: text
- descricao_detalhada: text
- condicoes_cancelacao: text
- condicoes_equipaje: text  
- condicoes_documentos: text
- condicoes_cancelacao_completa: text (v3.4)
- condicoes_equipaje_completa: text (v3.4)
- condicoes_documentos_completa: text (v3.4)
- ativo: boolean
- created_at: timestamp
```

### Tabela `package_descriptions` (Nova v3.4)
```sql
- id: serial (primary key)
- transporte: varchar(10) (Bus/Aéreo)
- destino: varchar(100) (nullable)
- hotel: varchar(255) (nullable)
- titulo: varchar(255)
- descripcion_detallada: text
- created_at: timestamp
```

### Estrutura JSON das Comodidades
```json
{
  "inclusos": [
    {"nome": "Wi-Fi", "icone": "wifi"},
    {"nome": "Aire Acondicionado", "icone": "aire"}
  ],
  "comodidades": [
    {"nome": "TV", "icone": "tv"},
    {"nome": "Frigobar", "icone": "fridge"}
  ]
}
```

## 🎯 **Funcionalidades Principais**

### 🏠 **Homepage**
- Header premium com navegação responsiva
- Hero section com formulário de busca unificado
- Seções de destinos populares
- Footer completo com links e informações

### 📋 **Página de Resultados**
- Filtros avançados no topo
- Cards premium com **imagens reais dos hotéis**
- **Comodidades reais** do Supabase com ícones dinâmicos
- Modo grid/list view otimizado
- Breakdown de quartos para múltiplas ocupações
- Integração direta com WhatsApp
- Badges "Más Popular" e "IA Recomienda"
- **Galeria de fotos** com modal premium

### 🏨 **Página de Detalhes**
- **Galeria completa** com navegação por setas
- **Comodidades reais** organizadas por categorias
- **Descrições dinâmicas** personalizadas por transporte/hotel
- **Sistema de abas**: Descripción, Condiciones, Avaliaciones
- **Condições dinâmicas** do Supabase com modal completo
- **Links condicionais** "Ver Condiciones Completas"
- **Modal premium** com formatação markdown
- **Processamento de texto** (negrito, quebras de linha)
- Modal responsivo com fechamento inteligente
- Informações detalhadas do pacote
- Mapeamento automático de dados Supabase

### 🤖 **Sistema de IA**
- Botão flutuante para sugestões
- Análise inteligente de preferências
- Recomendações personalizadas
- Busca por linguagem natural

## 🎨 **Design System**

### 🎨 **Cores**
```css
--primary: #EE7215 (Orange)
--secondary: #F7931E
--accent: #FF6B35
--neutral: #1F2937, #6B7280, #F9FAFB
--success: #10B981
--error: #EF4444
```

### 📝 **Tipografia**
- **Headings**: font-bold, tracking-tight
- **Body**: font-medium, Inter system
- **Labels**: font-semibold, text-sm
- **Hierarchy**: text-3xl → text-xl → text-base → text-sm

### 🔘 **Componentes**
- **Buttons**: Gradientes com shine effects
- **Cards**: Shadow-lg com hover:shadow-xl
- **Inputs**: Border-2 com focus states
- **Badges**: Gradientes temáticos
- **Popovers**: Backdrop-blur premium

## 📱 **Responsividade**

- **Mobile**: 320px+
- **Tablet**: 768px+
- **Desktop**: 1024px+
- **Large**: 1280px+

## 🔧 **Scripts Disponíveis**

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção  
npm run start        # Produção
npm run lint         # Linting
npm run type-check   # TypeScript check
```

## 🗂️ **Estrutura de Arquivos**

```
nice-trip-page-complete/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API Routes
│   ├── resultados/        # Página de resultados
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Homepage
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Components shadcn/ui
│   ├── header.tsx        # Header premium
│   ├── footer.tsx        # Footer completo
│   └── unified-search-filter.tsx # Sistema de busca
├── hooks/                # Custom hooks
│   └── use-packages.ts   # Hook Supabase
├── lib/                  # Utilities e configs
│   ├── supabase.ts      # Cliente Supabase
│   ├── hospedagens-service.ts # Serviço de dados de hotéis com cache
│   ├── package-conditions-service.ts # Condições dinâmicas (v3.4)
│   ├── package-description-service.ts # Descrições dinâmicas (v3.4)
│   └── utils.ts         # Funções utilitárias
├── public/              # Assets estáticos
└── README.md            # Esta documentação
```

## 🆕 **Atualizações Recentes v3.4**

### 🔗 **Sistema de Condições Dinâmicas e Modal Premium - Janeiro 2025**
- [x] **Condições Dinâmicas do Supabase**: 
  - Integração com tabela `package_content_templates` (IDs 3 e 4)
  - Condições específicas por transporte (Bus/Aéreo)
  - Cache inteligente por tipo de transporte
  - Fallback graceful para condições estáticas
- [x] **Modal de Condições Completas**:
  - Links "Ver Condiciones Completas" condicionais
  - Modal overlay responsivo com scroll interno
  - Formatação markdown (`**negrito**`, quebras de linha)
  - Múltiplas formas de fechar (ESC, backdrop, botões)
  - UX premium com backdrop-blur e animações
- [x] **Serviço de Descrições por Pacote**:
  - Tabela `package_descriptions` para conteúdo personalizado
  - Busca hierárquica: hotel específico → genérico → fallback
  - Processamento markdown completo
  - Cache otimizado para performance
- [x] **Melhorias de UX e Layout**:
  - Ajustes de espaçamento homepage (filtro mais próximo do subtítulo)
  - Mobile padding otimizado para melhor breathing room
  - Normalização de transportes ("Bús" → "Bus")
- [x] **Localização Completa para Espanhol**:
  - Partners section traduzida ("Una empresa del FLN GROUP")
  - Dados de contato reais no footer
  - Telefone: +55 48 99860-1754
  - Email: reservas@nicetripturismo.com.br
- [x] **Arquitetura de Dados Expandida**:
  - Colunas de condições completas no Supabase
  - Interface TypeScript atualizada
  - Serviços modulares e reutilizáveis
  - Estados de loading e erro tratados

### 🏨 **Sistema de Imagens e Comodidades Reais - Janeiro 2025**
- [x] **Imagens Reais dos Hotéis**: Integração completa com fotos reais dos 7 hotéis principais
  - **Residencial Terrazas**: 8 imagens (.png/.jpg)
  - **Residencial Leônidas**: 8 imagens (.jpg)
  - **Hotel Fênix**: 8 imagens (.jpg)
  - **Palace I**: 9 imagens (.jpg/.jpeg)
  - **Bombinhas Palace Hotel**: 7 imagens (.jpg)
  - **Canas Gold Hotel**: 8 imagens (.png/.jpg)
  - **Verdes Pássaros Apart Hotel**: 6 imagens (.png)
- [x] **Galeria Modal Premium**: 
  - Navegação por setas (teclado/mouse)
  - Fechamento via ESC, backdrop click ou botão
  - Design responsivo com z-index otimizado
  - Suporte a touch/swipe mobile
- [x] **Comodidades Reais do Supabase**:
  - Integração com tabela `hospedagens` (colunas `inclusos` e `comodidades`)
  - Mapeamento inteligente entre hotéis das tabelas `disponibilidades` ↔ `hospedagens`
  - Ícones Lucide React dinâmicos (Wifi, AirVent, Tv, Refrigerator, etc.)
  - Sistema de fallback para hotéis sem dados
- [x] **Sistema de Cache Inteligente**:
  - Cache de 30 minutos para performance
  - Serviço `lib/hospedagens-service.ts` para dados centralizados
  - Prevenção de queries desnecessárias ao Supabase
- [x] **Correções de Hidratação**: 
  - Função `formatPrice()` com detecção client-side
  - Resolução de erros `.toLocaleString()` server/client
  - Renderização de ícones React corrigida
- [x] **Arquitetura Limpa**: 
  - Single source of truth para dados de hotéis
  - Mapeamento robusto de nomes entre tabelas
  - Graceful fallbacks para UI nunca quebrar

### 📱 **Otimização Mobile Cards - Janeiro 2025**
- [x] **Cards Mobile Compactos**: Reduziu tamanho dos cards para melhor usabilidade mobile
- [x] **Badges Temáticos Coloridos**: 
  - Comodidades: Cinza com ícones laranja (#EE7215)
  - Detalhes del Viaje: Orange (data), Sky (transporte), Purple (noites), Emerald (pessoas)
- [x] **Layout de Preços Reestruturado**:
  - Esquerda: "Todo incluido" + badge verde "Bus + Hotel" ou "Aéreo + Hotel"
  - Direita: Valor em destaque + "Total para X Adultos"
- [x] **Hierarquia Visual Melhorada**:
  - Valores: text-3xl md:text-4xl (quarto único), text-2xl md:text-3xl (múltiplos)
  - Texto pessoas: text-xs para economia de espaço
  - Botão mais sutil: py-2.5 px-5 (list), py-3 px-6 (grid)
- [x] **Multi-Quartos Otimizado**: Ordem invertida (Desglose primeiro + linha divisória)
- [x] **Todas Informações Mantidas**: Design compacto sem perda de funcionalidade

### 🔥 **SmartFilter & Layout Optimizations (v3.1)**
- [x] **Layout Horizontal Premium**: Cards sem limitação de altura (`md:max-h-96` removido)
- [x] **View Mode Otimizado**: List view como padrão no desktop para melhor comparação
- [x] **Navbar Fixa Inteligente**: Header fixo com `!important` flags para economizar espaço
- [x] **Button Alignment**: "Ver detalles" alinhado na base com badge "Todo incluido"
- [x] **Espaçamento Refinado**: Micro-ajustes de `space-y-4` para `space-y-3`
- [x] **Reordenação UX**: Botões List/Grid reordenados (List primeiro)

### 📱 **Melhorias de Interface (v3.1)**
- [x] **Zero Height Overflow**: Conteúdo horizontal sempre visível
- [x] **Glassmorphism Mantido**: `bg-white/95 backdrop-blur-sm` preservado
- [x] **Apple-style Consistency**: Design premium sem comprometer funcionalidade
- [x] **Responsive Perfect**: Layout adaptativo em todos os breakpoints
- [x] **Micro-interactions**: Hover effects e animações mantidas

## 🎯 **Próximos Passos**

### 🚀 **Melhorias Futuras**
- [ ] **Sticky Filters**: Manter filtros visíveis durante scroll
- [ ] **Lazy Loading**: Otimizar carregamento de imagens
- [ ] **Skeleton Loading**: Estados de carregamento premium
- [ ] Sistema de autenticação de usuários
- [ ] Dashboard administrativo
- [ ] Sistema de pagamentos
- [ ] Multi-idiomas (PT, EN)

### 📊 **Monitoramento & Analytics**
- [ ] **View Mode Tracking**: Métricas de uso Grid vs List
- [ ] **Scroll Behavior**: Analytics de navegação
- [ ] **Performance Metrics**: Loading times e interactions
- [ ] Google Analytics 4
- [ ] Error tracking (Sentry)
- [ ] SEO optimization

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 **Equipe**

- **Desenvolvedor**: Claude Sonnet (IA Assistant)
- **Product Owner**: Izaguirres Team
- **Design System**: Apple-inspired Premium

## 📞 **Contato & Suporte**

- **WhatsApp**: +55 48 99860-1754
- **Email**: reservas@nicetripturismo.com.br
- **Website**: https://nicetrip.vercel.app
- **Empresa**: FLN GROUP

---

**🌴 Nice Trip v3.0 - Transformando sonhos em viagens inesquecíveis! ✈️**

*Feito com ❤️ e muito ☕ em São Paulo, Brasil* 🇧🇷
