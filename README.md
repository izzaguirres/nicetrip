# Nice Trip - Site de Reservas de Viagens

Este é o repositório para o site da Nice Trip, uma plataforma moderna para busca e reserva de pacotes de viagem e hospedagens, construída com Next.js, TypeScript e Supabase.

## Resumo das Últimas Alterações

Nas últimas sessões, implementamos uma série de melhorias significativas, com foco na lógica de busca de hospedagens e na experiência do usuário.

### Lógica de Negócio e Cálculos

- **Cálculo de Pagantes:** Foi implementada uma lógica de negócio complexa para o cálculo de hóspedes pagantes, que considera regras de gratuidade para crianças (a cada 2 adultos, 1 criança de 0 a 5 anos é gratuita).
- **Filtragem Inteligente:** A página de resultados agora filtra os quartos de forma inteligente, garantindo que a capacidade física total seja respeitada, ao mesmo tempo que seleciona o tipo de quarto (Doble, Triple, etc.) com base no número de pagantes.
- **Lógica de Preços:** O cálculo de preço para hospedagens foi corrigido para ser baseado no valor da diária do quarto, e não por pessoa, refletindo o modelo de negócio correto.

### Novas Funcionalidades e Melhorias de UX

- **Página de Detalhes de Hospedagem Dedicada:** Criamos uma nova página (`/detalhes-hospedagem`) específica para os detalhes de quartos, separada da página de detalhes de pacotes. Isso resultou em um código mais limpo e facilitou a customização.
- **Melhorias Visuais:**
    - Os ícones de comodidades foram corrigidos e padronizados em todo o site.
    - O card de resumo de compra na página de detalhes foi redesenhado para ser mais claro e informativo.
    - As comodidades agora são exibidas diretamente nos cards de resultados, tanto para pacotes quanto para hospedagens.
- **Correções de Bugs:**
    - Resolvido um problema de dessincronização com o Supabase após a remoção de colunas, garantindo que os dados dos hotéis (incluindo imagens e comodidades) sejam sempre carregados corretamente.
    - Corrigido um bug de fuso horário que fazia com que as datas de pacotes fossem exibidas incorretamente.

## Tecnologias

- **Framework:** Next.js (com App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS & shadcn/ui
- **Banco de Dados:** Supabase
- **Features de IA:** Integração com OpenAI para buscas inteligentes.

## Documentação

- Guia do Smart Filter, regras de cálculo e composição por hotel: [`SMART_FILTER.md`](SMART_FILTER.md)
- Esquema do banco e colunas necessárias (incluindo Aéreo): [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md)
- Roteiro completo para o painel admin: [`ADMIN_SPEC.md`](ADMIN_SPEC.md)

## ⚠️ Core que não pode ser alterado

Para manter os resultados aprovados com clientes, estas regras são obrigatórias:

- `computePackageBaseTotal` (em `lib/package-pricing.ts`) define os valores por adulto/criança; nunca altere a fórmula sem atualizar os testes de baseline.
- `app/resultados/page.tsx` e `app/detalhes/page.tsx` devem continuar gerando os mesmos cards, valores e parcelas para todos os filtros já validados (Bus/Aéreo, múltiplos quartos, hospedagens).
- O serviço `lib/supabase-service.ts` deve ser a única fonte de dados reais; `NEXT_PUBLIC_ENABLE_FALLBACK` precisa estar `false` em produção.
- Qualquer refatoração ou otimização só pode ser concluída após rodar `npm run lint`, `npm run test` e comparar os outputs com os fixtures de baseline (`tests/baseline`).

## Migrations do Supabase

As tabelas e policies necessárias para o painel admin ficam versionadas em `supabase/migrations`.

1. Abra o **SQL Editor** do Supabase (ou use o CLI) e execute os arquivos na ordem de data:
   - `20250215_admin_core.sql` cria as tabelas (`admin_users`, `discount_rules`, `search_events`, etc.).
   - `20250215_discount_rule_targets.sql` adiciona campos opcionais de targeting.
   - `20250220_admin_rls.sql` habilita RLS e publica as policies de leitura/escrita.
2. Depois de aplicar cada arquivo, valide com:
   ```sql
   set role anon;
   select count(*) from public.disponibilidades;
   reset role;
   ```
3. Cadastre o primeiro usuário admin manualmente (via SQL) ou com o serviço `SUPABASE_SERVICE_ROLE_KEY`.

> Dica: mantenha o arquivo `SUPABASE_RLS_ROLLOUT.md` por perto – ele traz blocos de rollback e testes rápidos.

## Checklist antes de publicar

- Confirme que `NEXT_PUBLIC_ENABLE_FALLBACK=false` no ambiente de produção.
- Execute `npm run lint`, `npm run test` e `npm run test:baseline` – o deploy só pode seguir com a suíte verde.
- Rode `npm run build` para garantir que não há erros de compilação.
- Verifique se as migrations acima já estão aplicadas e se existe pelo menos um usuário em `admin_users`.
- Gere um search/conversion manual no ambiente de staging e confira os contadores em `/admin/analytics` (os testes automatizados cobrem os casos principais, mas a checagem manual evita dados truncados).

## Como Executar

Para executar o projeto localmente, siga os passos:

1.  Clone o repositório.
2.  Instale as dependências: `npm install`
3.  Execute o servidor de desenvolvimento: `npm run dev`
4.  Abra `http://localhost:3000` no seu navegador.
5.  Antes de qualquer deploy, rode `npm run lint` **e** `npm run test` para garantir que o baseline (tests/baseline) continua consistente.
