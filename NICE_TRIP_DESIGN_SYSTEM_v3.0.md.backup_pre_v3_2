# 🎨 Nice Trip v3.0 - Design System Premium

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Paleta de Cores](#paleta-de-cores)
3. [Tipografia](#tipografia)
4. [Componentes](#componentes)
5. [Gradientes](#gradientes)
6. [Micro-interações](#micro-interações)
7. [Espaçamentos](#espaçamentos)
8. [Sombras](#sombras)
9. [Estados](#estados)
10. [Guidelines](#guidelines)

---

## 🎯 Visão Geral

O **Nice Trip Design System v3.0** é inspirado na excelência visual da Apple, combinando:
- **Minimalismo Premium**: Clean, elegante, focado
- **Micro-interações Sofisticadas**: Transitions suaves e efeitos visuais
- **Consistência Absoluta**: Padrões repetíveis em todos os componentes
- **Responsividade Nativa**: Mobile-first com adaptação perfeita

### **Filosofia de Design**
> "Simplicidade é a máxima sofisticação" - Leonardo da Vinci

Cada elemento foi pensado para proporcionar uma experiência premium, desde a primeira interação até a conversão final.

---

## 🎨 Paleta de Cores

### **Cores Primárias**
```css
--nice-orange-primary: #EE7215;    /* Cor principal da marca */
--nice-orange-light: #F7931E;      /* Variação clara */
--nice-orange-dark: #E65100;       /* Variação escura */
--nice-orange-accent: #FF6B35;     /* Accent vibrante */
```

### **Cores Secundárias**
```css
--nice-purple: #6366F1;            /* IA e tecnologia */
--nice-purple-light: #8B5CF6;      /* Variação clara */
--nice-green: #10B981;             /* Sucesso e aprovação */
--nice-blue: #3B82F6;              /* Informação */
```

### **Neutros**
```css
--gray-50: #FAFAFA;                /* Background claro */
--gray-100: #F5F5F5;               /* Background cards */
--gray-200: #E5E5E5;               /* Borders */
--gray-300: #D4D4D4;               /* Borders hover */
--gray-600: #6B7280;               /* Texto secundário */
--gray-800: #1F2937;               /* Texto principal */
--gray-900: #111827;               /* Texto destaque */
```

### **Cores Semânticas**
```css
--success: #10B981;                /* Verde sucesso */
--warning: #F59E0B;                /* Amarelo atenção */
--error: #EF4444;                  /* Vermelho erro */
--info: #3B82F6;                   /* Azul informação */
```

---

## ✍️ Tipografia

### **Font Stack**
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

### **Hierarquia de Texto**
```css
/* Headers */
.text-hero: { font-size: 3.5rem; font-weight: 900; }      /* 56px */
.text-h1: { font-size: 2.5rem; font-weight: 800; }        /* 40px */
.text-h2: { font-size: 2rem; font-weight: 700; }          /* 32px */
.text-h3: { font-size: 1.5rem; font-weight: 600; }        /* 24px */

/* Body */
.text-lg: { font-size: 1.125rem; font-weight: 500; }      /* 18px */
.text-md: { font-size: 1rem; font-weight: 500; }          /* 16px */
.text-sm: { font-size: 0.875rem; font-weight: 500; }      /* 14px */
.text-xs: { font-size: 0.75rem; font-weight: 600; }       /* 12px */

/* Labels */
.label-bold: { font-size: 0.875rem; font-weight: 700; }   /* 14px bold */
.label-semibold: { font-size: 0.75rem; font-weight: 600; } /* 12px semibold */
```

---

## 🧩 Componentes

### **1. Botões**

#### **Botão Primário (Buscar)**
```css
.btn-primary {
  @apply relative w-full h-10 
         bg-gradient-to-r from-[#FF6B35] via-[#EE7215] to-[#F7931E]
         hover:from-[#FF5722] hover:via-[#E65100] hover:to-[#FF8F00]
         text-white font-bold rounded-2xl
         shadow-[0_8px_24px_rgba(238,114,21,0.4)]
         hover:shadow-[0_12px_32px_rgba(238,114,21,0.6)]
         transition-all duration-300
         hover:scale-[1.02] active:scale-[0.98]
         transform-gpu overflow-hidden group;
}

/* Shine Effect */
.btn-primary::before {
  @apply absolute inset-0 
         bg-gradient-to-r from-transparent via-white/20 to-transparent
         translate-x-[-100%] group-hover:translate-x-[100%]
         transition-transform duration-1000 ease-out;
}
```

#### **Botões de Controle (+/-)**
```css
.btn-control {
  @apply h-7 w-7 rounded-lg border border-gray-300
         hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5
         disabled:opacity-50 disabled:cursor-not-allowed
         transition-all duration-200
         flex items-center justify-center;
}
```

### **2. Inputs e Selects**

#### **Select Premium**
```css
.select-premium {
  @apply w-full h-10 rounded-2xl border-2 border-gray-200
         hover:border-[#EE7215]/50 focus:border-[#EE7215]
         transition-all duration-200
         shadow-sm hover:shadow-md;
}

.select-content {
  @apply rounded-xl border-2 border-gray-200 shadow-xl;
}

.select-item {
  @apply rounded-lg hover:bg-[#EE7215]/5;
}
```

#### **Labels**
```css
.label {
  @apply text-sm font-bold text-gray-800;
}
```

### **3. Cards de Hotel**

#### **Card Container**
```css
.hotel-card {
  @apply bg-white border border-gray-200 rounded-3xl overflow-hidden
         shadow-[0_8px_32px_rgba(0,0,0,0.08)]
         hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)]
         hover:-translate-y-2 hover:scale-[1.02]
         transition-all duration-500 ease-out
         transform-gpu;
}
```

#### **Card Header com Gradiente**
```css
.card-header {
  @apply bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700
         p-6 text-white relative overflow-hidden;
}

.card-header::before {
  @apply absolute inset-0 bg-black/10;
}
```

#### **Badges**
```css
.badge-popular {
  @apply bg-gradient-to-r from-[#FF6B35] to-[#F7931E]
         text-white text-xs font-bold px-3 py-1.5 rounded-full
         shadow-lg;
}

.badge-ia {
  @apply bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]
         text-white text-xs font-bold px-3 py-1.5 rounded-full
         shadow-lg flex items-center gap-1;
}
```

### **4. Popovers e Dropdowns**

#### **Popover Container**
```css
.popover-content {
  @apply w-72 p-3 rounded-xl border-2 border-gray-200 shadow-xl;
}
```

#### **Room Container no Popover**
```css
.room-container {
  @apply border rounded-xl p-3 space-y-2 transition-all duration-200
         border-gray-200 bg-white;
}

.room-container.near-limit {
  @apply border-orange-200 bg-orange-50;
}

.room-container.at-limit {
  @apply border-amber-300 bg-amber-50;
}
```

---

## 🌈 Gradientes

### **Gradientes Principais**
```css
/* Botão Primário */
.gradient-primary {
  background: linear-gradient(to right, #FF6B35, #EE7215, #F7931E);
}

.gradient-primary-hover {
  background: linear-gradient(to right, #FF5722, #E65100, #FF8F00);
}

/* Badge Popular */
.gradient-popular {
  background: linear-gradient(to right, #FF6B35, #F7931E);
}

/* Badge IA */
.gradient-ia {
  background: linear-gradient(to right, #6366F1, #8B5CF6);
}

/* Card Headers */
.gradient-card-blue {
  background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 50%, #6366F1 100%);
}

.gradient-card-purple {
  background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #4F46E5 100%);
}

.gradient-card-orange {
  background: linear-gradient(135deg, #F97316 0%, #EE7215 50%, #EA580C 100%);
}
```

---

## ⚡ Micro-interações

### **Hover States**
```css
/* Cards */
.hover-lift {
  @apply hover:-translate-y-2 hover:scale-[1.02]
         transition-all duration-500 ease-out;
}

/* Botões */
.hover-scale {
  @apply hover:scale-[1.02] active:scale-[0.98]
         transition-all duration-300;
}

/* Sombras expansivas */
.hover-shadow {
  @apply shadow-[0_8px_24px_rgba(238,114,21,0.4)]
         hover:shadow-[0_12px_32px_rgba(238,114,21,0.6)]
         transition-all duration-300;
}
```

### **Shine Effect**
```css
.shine-effect {
  @apply relative overflow-hidden;
}

.shine-effect::before {
  content: '';
  @apply absolute inset-0
         bg-gradient-to-r from-transparent via-white/20 to-transparent
         translate-x-[-100%] group-hover:translate-x-[100%]
         transition-transform duration-1000 ease-out;
}
```

### **Loading States**
```css
.skeleton {
  @apply animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200
         bg-[length:200%_100%];
}

@keyframes pulse {
  0%, 100% { background-position: 200% 0; }
  50% { background-position: -200% 0; }
}
```

---

## 📏 Espaçamentos

### **Sistema de Grid Responsivo**
```css
/* Container Principal */
.container-main {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

/* Grid de Filtros */
.filter-grid {
  @apply grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4;
}

/* Grid de Cards */
.cards-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8;
}
```

### **Padding e Margin Padrões**
```css
.spacing-xs: { padding: 0.5rem; }      /* 8px */
.spacing-sm: { padding: 0.75rem; }     /* 12px */
.spacing-md: { padding: 1rem; }        /* 16px */
.spacing-lg: { padding: 1.5rem; }      /* 24px */
.spacing-xl: { padding: 2rem; }        /* 32px */
.spacing-2xl: { padding: 3rem; }       /* 48px */
```

---

## 🌘 Sombras

### **Sistema de Sombras**
```css
/* Sombras de Cards */
.shadow-card: {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.shadow-card-hover: {
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
}

/* Sombras de Botões */
.shadow-button: {
  box-shadow: 0 8px 24px rgba(238, 114, 21, 0.4);
}

.shadow-button-hover: {
  box-shadow: 0 12px 32px rgba(238, 114, 21, 0.6);
}

/* Sombras de Popovers */
.shadow-popover: {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}
```

---

## 🎮 Estados

### **Estados de Inputs**
```css
/* Normal */
.input-normal {
  @apply border-gray-200 bg-white;
}

/* Hover */
.input-hover {
  @apply border-[#EE7215]/50 shadow-md;
}

/* Focus */
.input-focus {
  @apply border-[#EE7215] ring-2 ring-[#EE7215]/20;
}

/* Disabled */
.input-disabled {
  @apply border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed;
}

/* Error */
.input-error {
  @apply border-red-300 ring-2 ring-red-200;
}
```

### **Estados de Rooms**
```css
/* Room Normal (1-3 pessoas) */
.room-normal {
  @apply border-gray-200 bg-white;
}

/* Room Near Limit (4 pessoas) */
.room-near-limit {
  @apply border-orange-200 bg-orange-50;
}

/* Room At Limit (5 pessoas) */
.room-at-limit {
  @apply border-amber-300 bg-amber-50;
}
```

---

## 📱 Responsividade

### **Breakpoints**
```css
/* Mobile First */
.mobile: { min-width: 0px; }          /* 0px+ */
.tablet: { min-width: 640px; }        /* 640px+ */
.desktop: { min-width: 1024px; }      /* 1024px+ */
.wide: { min-width: 1280px; }         /* 1280px+ */
```

### **Padrões Responsivos**
```css
/* Texto Responsivo */
.text-responsive {
  @apply text-2xl lg:text-4xl font-bold;
}

/* Spacing Responsivo */
.spacing-responsive {
  @apply px-4 sm:px-6 lg:px-8;
}

/* Grid Responsivo */
.grid-responsive {
  @apply grid-cols-1 lg:grid-cols-2 xl:grid-cols-3;
}
```

---

## 🎯 Guidelines

### **Implementação de Componentes**

#### **1. Estrutura Base**
```tsx
// Sempre usar esta estrutura para novos componentes
export function NovoComponente() {
  return (
    <div className="container-class hover:hover-class transition-all duration-300">
      {/* Conteúdo */}
    </div>
  )
}
```

#### **2. Padrão de Hover**
```tsx
// Todo elemento interativo deve ter hover state
className="hover:scale-[1.02] hover:shadow-lg transition-all duration-300"
```

#### **3. Padrão de Loading**
```tsx
// Loading states sempre com skeleton
{loading ? (
  <div className="animate-pulse bg-gray-200 rounded-2xl h-10" />
) : (
  <ComponenteReal />
)}
```

### **Aplicação do Design System**

#### **1. Para Botões**
```tsx
<button className="btn-primary group">
  <span className="relative z-10 flex items-center justify-center gap-2">
    <Icon className="w-4 h-4" />
    Texto
  </span>
</button>
```

#### **2. Para Inputs**
```tsx
<div className="space-y-2">
  <label className="label">Label</label>
  <input className="input-premium" />
</div>
```

#### **3. Para Cards**
```tsx
<div className="hotel-card group">
  <div className="card-header">
    {/* Header content */}
  </div>
  <div className="p-6">
    {/* Body content */}
  </div>
</div>
```

### **Validação de Qualidade**

#### **Checklist de Implementação**
- [ ] ✅ Hover states implementados
- [ ] ✅ Transitions suaves (300ms)
- [ ] ✅ Cores da paleta oficial
- [ ] ✅ Tipografia consistente
- [ ] ✅ Espaçamentos do sistema
- [ ] ✅ Sombras apropriadas
- [ ] ✅ Estados visuais claros
- [ ] ✅ Responsividade testada
- [ ] ✅ Acessibilidade considerada

---

## 🔄 Versionamento

### **v3.0 - Atual**
- Design System Premium completo
- Apple-inspired components
- Micro-interações sofisticadas
- Sistema de cores expandido
- Gradientes signature

### **Histórico de Mudanças**
```
v3.0.0 - Design System Premium Apple
v2.1.0 - Adição de gradientes e shine effects
v2.0.0 - Padronização de cores e tipografia
v1.0.0 - Implementação inicial
```

---

## 📝 Como Usar Este Documento

### **Para Desenvolvedores**
1. **Copie as classes CSS** diretamente nos seus componentes
2. **Use os padrões estabelecidos** para manter consistência
3. **Valide com o checklist** antes de fazer deploy
4. **Documente novos componentes** seguindo este formato

### **Para Designers**
1. **Use as cores especificadas** em todos os designs
2. **Siga a hierarquia tipográfica** estabelecida
3. **Mantenha os espaçamentos** do sistema
4. **Aplique os estados visuais** conforme definido

### **Para Novos Chats/Conversas**
**Prompt Sugerido:**
```
"Olá! Estou trabalhando no projeto Nice Trip v3.0. 
Por favor, leia o arquivo NICE_TRIP_DESIGN_SYSTEM_v3.0.md 
e aplique todos os padrões visuais definidos lá em qualquer 
componente que você criar ou modificar. É importante manter 
a consistência visual premium que já foi estabelecida."
```

---

## 🚀 Conclusão

Este Design System representa a evolução visual do Nice Trip para um padrão **premium e profissional**, inspirado na excelência da Apple. 

Cada detalhe foi pensado para:
- ✨ **Encantar o usuário** desde o primeiro olhar
- 🎯 **Guiar a conversão** através do design
- 🔄 **Manter consistência** em todos os pontos de contato
- 📱 **Funcionar perfeitamente** em qualquer dispositivo

**Lembre-se**: Um bom design é invisível - ele simplesmente funciona e faz o usuário se sentir bem. 

---

*"Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away." - Antoine de Saint-Exupéry*

**Nice Trip Design System v3.0** ✨ 