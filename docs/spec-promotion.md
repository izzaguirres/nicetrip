# Promoções Destacadas – Especificação

## Visão Geral

Criar uma seção "Promoções" na home com três trilhas (Paquetes, Hospedajes, Paseos) que o time admin possa editar. Cada trilha exibe até 4 cards em desktop (grid) e carrossel no mobile.

## Requisitos Funcionais

1. **Fonte de dados única:** armazenar promoções em tabela dedicada para evitar hardcode.
2. **Admin CRUD:** permitir criar, ordenar, ativar/desativar cards para cada tipo.
3. **Home UI:** renderizar grid/carrossel consumindo apenas promoções ativas.
4. **CTA:** cada card abre a rota correta (detalhes do pacote/hospedagem/passeio ou link customizado).

## Modelo de Dados

Tabela `promotions` (nova):
- `id` uuid PK
- `type` enum text (`paquete` | `hospedaje` | `paseo`)
- `order` smallint (para definir posição)
- `title` text
- `subtitle` text
- `destino`, `hotel`, `transporte` textos opcionais
- `slug_disponibilidade` (pacote) / `slug_hospedagem` / `slug_paseo`
- `price_single`, `price_double`, `price_triple`, `price_quad`, `price_quint` numeric (nullable)
- `cta_label`, `cta_url`
- `image_url`
- `is_active` boolean default true
- `created_at`, `updated_at`

Justificativa: manter tudo em uma única tabela facilita ordenação e compartilhamento de lógica no admin.

## API / Serviço

- Função `getPromotions(type)` em `lib/supabase-service.ts` retornando registros ordenados.
- Endpoint admin `/api/admin/promotions` com GET/POST/DELETE para CRUD.

## Admin UI

Nova página `app/admin/(app)/promotions/page.tsx` com:
1. Tabs por tipo.
2. Lista de cards com preview (imagem, títulos, preços) + botões Editar/Remover/Ativar.
3. Botão "Nova promoção" abre modal `PromotionForm` com campos:
   - Tipo (select)
   - Informação textual (título/subtítulo)
   - Binding opcional a uma disponibilidade/hospedagem/passeio (combobox usando lookups existentes).
   - Preços (inputs para Single/Doble/Triple/Quadruple/Quintuple).
   - CTA (texto + link). Se estiver ligado a um slug, CTA default = "Ver detalhes" com URL gerada.
   - Upload/URL da imagem (para já manter no front).
   - Toggle ativo.
4. Reordenação simples via "mover para cima/baixo" (controlar `order`).

## Home UI

Criar componente `components/promotions-section.tsx`:
- Recebe `paquetes`, `hospedajes`, `paseos` como props.
- Renderiza título + descrição.
- Para cada categoria:
  - Desktop: grid `grid-cols-4` limitado a 4 itens (mostrar "Ver todos" se houver mais?).
  - Mobile: `Carousel` (Embla) exibindo 1 card + peek.
- Card mostra: imagem, título, destino/hotel, badge transporte, tabela de preços (somente campos preenchidos), CTA.

Adicionar chamada em `app/page.tsx` (seção após hero) fazendo `await getPromotions` via server component.

## Tasks

1. **Schema:** criar migration `20250305_create_promotions.sql` com tabela + índices.
2. **Tipos/Serviço:** atualizar `lib/supabase.ts` e `lib/supabase-service.ts` com tipos/helpers.
3. **API Admin:** criar `/api/admin/promotions` usando serviços similares aos de discount rules.
4. **UI Admin:** implementar tabela + modal + validações (Zod) e reordenação.
5. **Home UI:** nova seção com cards/carrossel consumindo dados reais.
6. **Smoke tests:** atualizar `npm run lint` + adicionar teste unitário para helper de formatação de preços dos cards.

## Considerações

- **Performance:** cache leve no serviço (ex.: 1 min) pois promoções mudam pouco.
- **Fallback:** se não houver promoções ativas para um tipo, esconder a seção correspondente.
- **Acessibilidade:** carrossel com botões anterior/próximo + sr-only labels.
- **Uploads:** inicialmente aceitar apenas URL; futuramente integrar storage.
- **Segurança:** reusar middleware admin existente para rota `/api/admin/promotions`.

---
Esta spec deve ser atualizada conforme avançarmos (ex.: se o cliente pedir mais campos). Cada task concluída deve ser marcada no PR/commit associado.
