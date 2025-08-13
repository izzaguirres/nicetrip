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

## Como Executar

Para executar o projeto localmente, siga os passos:

1.  Clone o repositório.
2.  Instale as dependências: `npm install`
3.  Execute o servidor de desenvolvimento: `npm run dev`
4.  Abra `http://localhost:3000` no seu navegador.
