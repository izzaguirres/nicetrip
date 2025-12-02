# 🎨 Nice Trip - Design System Premium (v4.0)

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Filosofia Visual](#filosofia-visual)
3. [Paleta de Cores](#paleta-de-cores)
4. [Tipografia & Ícones](#tipografia--ícones)
5. [Componentes Core](#componentes-core)
6. [Páginas & Layouts](#páginas--layouts)
7. [Micro-interações](#micro-interações)
8. [Sombras & Profundidade](#sombras--profundidade)

---

## 🎯 Visão Geral

O **Nice Trip Design System v4.0** representa a evolução para um padrão estético de classe mundial, inspirado diretamente na sofisticação visual do **Airbnb** e no minimalismo funcional da **Apple**.

### **Pilares do Design**
- **Imersão**: Imagens grandes, sem bordas (bleed), que convidam o usuário a "entrar" na experiência.
- **Leveza**: Uso extensivo de espaço em branco, sombras difusas e bordas arredondadas suaves (`rounded-3xl`).
- **Clareza**: Informações estruturadas em grids e pílulas, evitando blocos de texto denso.
- **Tactilidade**: Micro-interações que dão feedback físico (scale, glow, shadow) ao usuário.

---

## 🎨 Paleta de Cores

### **Primária (Ação & Marca)**
O Laranja Vibrante é a única cor de ação forte. Deve ser usada para botões primários, links importantes e ícones de destaque.
```css
--orange-500: #F97316; /* Principal */
--orange-600: #EA580C; /* Hover */
--orange-50:  #FFF7ED; /* Backgrounds sutis */
```

### **Neutros (Estrutura)**
A base é branca, com tons de Slate para hierarquia de texto. Evitamos o preto puro (#000) para textos longos.
```css
--white:      #FFFFFF; /* Card Backgrounds */
--slate-50:   #F8FAFC; /* Page Backgrounds / Pills */
--slate-100:  #F1F5F9; /* Dividers / Secondary Pills */
--slate-900:  #0F172A; /* Headings (Quase preto) */
--slate-500:  #64748B; /* Body Text */
```

---

## ✍️ Tipografia & Ícones

### **Ícones Finos (Fine Icons)**
Abandonamos os ícones grossos padrão. Todos os ícones `lucide-react` devem usar **strokeWidth={1.5}** para elegância.
```tsx
<MapPin className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
```

### **Tipografia**
- **Fonte**: Manrope (Headings), Inter/Sans (Body).
- **Headings**: ExtraBold ou Bold, tracking-tight (letras mais juntas).
- **Labels**: Uppercase, tracking-wider (letras espaçadas), font-bold, tamanho pequeno (10-11px).

---

## 🧩 Componentes Core

### **1. Cards Imersivos (Airbnb Style)**
Usados em Resultados e Listagens.
- **Borda**: `rounded-[2rem]` (32px).
- **Sombra**: `shadow-[0_8px_30px_rgb(0,0,0,0.04)]` (Difusa).
- **Imagem**: `w-full`, sem padding lateral, ocupando o topo.
- **Conteúdo**: Padding interno generoso (`p-5` ou `p-6`).

```tsx
<div className="group bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 flex flex-col overflow-hidden">
  {/* Imagem Full Bleed */}
  <div className="relative w-full h-64">...</div>
  {/* Conteúdo */}
  <div className="p-6">...</div>
</div>
```

### **2. Grid de Informações (Pílulas)**
Usado para exibir metadados (Data, Duração, Transporte).
- **Container**: `bg-slate-100` ou `bg-slate-50`.
- **Borda**: Transparente por padrão, colorida no hover.
- **Layout**: Grid 2 colunas.

### **3. Botão "Liquid Orange"**
Botão de ação principal com gradiente sutil ou cor sólida vibrante e sombra colorida.
```tsx
<Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 h-12 font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all hover:-translate-y-0.5">
  Ver detalles <ArrowRight className="ml-2" strokeWidth={2} />
</Button>
```

### **4. Inputs Flutuantes**
Inputs de busca com estilo "Glass" na Home e "Clean" nas internas.
- **Home**: `bg-white/90 backdrop-blur-md border-white/20`.
- **Internas**: `bg-white border-slate-200`.
- **Label**: Flutuante interno (absolute top-2 left-12).

---

## 📄 Páginas & Layouts

### **1. Página de Resultados (`/resultados`)**
- **Grid Adaptativo**: Os cards mudam os ícones/labels dependendo da aba ativa (Hospedagem vs Pacotes).
  - *Hospedagem*: Check-in, Estadía, Categoría, Huéspedes.
  - *Pacote*: Salida, Duración, Paquete, Pasajeros.
- **Filtro Inteligente**: Bloqueia buscas incompletas e mostra "Empty State" amigável.

### **2. Página de Detalhes (`/detalhes`)**
- **Galeria**: Grid assimétrico arredondado (`rounded-3xl`). Botão "Ver todas" flutuante.
- **Card de Reserva**: Sticky, flutuante, branco. Mostra preço final em destaque. Acordeão para detalhes financeiros.
- **Smart Reviews**: Sistema determinístico que gera notas e comentários consistentes baseados no nome do hotel (sem backend real).

### **3. Página de Contato (`/contacto`)**
- **Bento Grid**: Informações de contato organizadas em grid irregular.
- **Hero Tipográfico**: Título grande sem imagem de fundo pesada.

---

## ⚡ Micro-interações

- **Hover em Cards**: `hover:-translate-y-1` e sombra mais forte.
- **Imagens**: Zoom suave (`scale-105`) no hover.
- **Botões**: `active:scale-95` (efeito de clique físico).
- **Abas**: Underline animado ou troca de cor de fundo/texto.

---

## 📝 Como Manter o Padrão (Prompt para AI)

Ao pedir novas telas ou componentes, use este prompt:

> "Utilize o padrão visual **Nice Trip v4.0**: Cards estilo Airbnb com bordas `rounded-[2rem]`, sombras difusas `shadow-[0_8px_30px...]`, ícones Lucide com `strokeWidth={1.5}` e tipografia Manrope/Inter. Mantenha o layout limpo com muito espaço em branco (bg-white) e use Laranja (#EA580C) apenas para ações principais."

---

**Nice Trip Design System v4.0** — *Sofisticação em cada pixel.*