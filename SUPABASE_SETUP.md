# Configuração do Supabase - Nice Trip (Tabelas Reais)

## 1. Configurar variáveis de ambiente

1. Copie o arquivo `env.example` para `.env.local`
2. Preencha com suas credenciais do Supabase:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

## 2. Estrutura das tabelas existentes

### Tabela: `disponibilidades`
```sql
- id (string)
- destino (string)
- data_saida (string/date)
- transporte (string)
- hotel (string)
- quarto_tipo (string)
- capacidade (number)
- preco_adulto (number)
- preco_crianca_0_3 (number)
- preco_crianca_4_5 (number)
- preco_crianca_6_mais (number)
- noites_hotel (number)
- dias_viagem (number)
- dias_totais (number)
- link_imagem (string)
- slug (string)
```

### Tabela: `cidades_saida`
```sql
- id (number)
- transporte (string)
- cidade (string)
- provincia (string)
- pais (string)
```

### Tabela: `voos_aereos` (novo)
```sql
create table if not exists public.voos_aereos (
  id bigserial primary key,
  origem text not null check (origem in ('Córdoba','Buenos Aires')),
  origem_iata text check (origem_iata in ('COR','EZE','AEP')),
  destino text not null default 'Florianópolis',
  destino_iata text not null default 'FLN',
  tipo text not null check (tipo in ('charter','regular')),
  sentido text not null check (sentido in ('ida','volta')),
  data date null,
  saida_hora text not null,
  chegada_hora text not null,
  aeroporto_saida text null,
  aeroporto_chegada text null,
  bag_carry_kg integer null,
  bag_despachada_kg integer null,
  companhia text null,
  observacao text null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists voos_aereos_origem_data_idx on public.voos_aereos (origem, data);
create index if not exists voos_aereos_tipo_sentido_idx on public.voos_aereos (tipo, sentido);
```

Seeds exemplo:
```sql
-- Córdoba charter (data null)
insert into public.voos_aereos (origem, origem_iata, tipo, sentido, data, saida_hora, chegada_hora, bag_carry_kg, bag_despachada_kg)
values
('Córdoba','COR','charter','ida',   null,'08:30','11:05',10,15),
('Córdoba','COR','charter','volta', null,'11:55','14:00',10,15)
on conflict do nothing;

-- Buenos Aires regulares (ajuste datas/trechos conforme planilha)
insert into public.voos_aereos (origem, origem_iata, tipo, sentido, data, saida_hora, chegada_hora, aeroporto_saida, aeroporto_chegada, bag_carry_kg, bag_despachada_kg)
values
('Buenos Aires','EZE','regular','ida',   '2025-01-08','18:00','19:55','EZE','FLN',10,12),
('Buenos Aires','EZE','regular','ida',   '2025-01-15','18:00','19:55','EZE','FLN',10,12),
('Buenos Aires','EZE','regular','volta', '2025-01-15','20:50','22:55','FLN','EZE',10,12)
on conflict do nothing;
```

### Tabela: `disponibilidades` (campos relevantes – Paquetes)
Campos existentes para Bus/Bús:
```sql
preco_adulto numeric,
preco_crianca_0_3 numeric,
preco_crianca_4_5 numeric,
preco_crianca_6_mais numeric
```

Novos campos para Aéreo:
```sql
-- valores base por persona
preco_adulto_aereo numeric,
preco_crianca_0_2_aereo numeric,
preco_crianca_2_5_aereo numeric,
preco_crianca_6_mais_aereo numeric,

-- taxa por persona (adultos, 2–5 e 6+). 0–2 isento
taxa_aereo_por_pessoa numeric DEFAULT 200
```

Notas:
- Se `preco_adulto_aereo` estiver nulo, o sistema usa `preco_adulto` como fallback.
- Se `preco_crianca_6_mais_aereo` estiver nulo, usa `preco_adulto_aereo`.
- A taxa de Aéreo é aplicada por pessoa (adultos + 2–5 + 6+). 0–2 não paga taxa.

## 3. Funcionalidades implementadas

- ✅ Busca de disponibilidades com filtros
- ✅ Filtros por destino, cidade de saída, transporte
- ✅ Filtro de faixa de preço (por adulto)
- ✅ Cálculo automático de preço total baseado em pessoas
- ✅ Visualização em grid e lista
- ✅ Carregamento dinâmico das cidades de saída
- ✅ Estados de loading e erro
- ✅ Design responsivo
- ✅ Integração com header e footer

## 4. Como testar

1. Configure as variáveis de ambiente
2. Execute `npm run dev`
3. Acesse `http://localhost:3000/resultados`
4. Teste os filtros e visualizações

## 5. Hooks disponíveis

- `useDisponibilidades(filters)` - Busca disponibilidades
- `useDisponibilidade(id)` - Busca uma disponibilidade específica
- `useCidadesSaida()` - Carrega cidades de saída
- `useCalcularPreco(disponibilidade, pessoas)` - Calcula preço total

## 6. Próximos passos

- [ ] Página de detalhes da disponibilidade (`/disponibilidade/[slug]`)
- [ ] Sistema de reservas
- [ ] Integração com formulário de busca da home
- [ ] Sistema de favoritos
- [ ] Carrinho de compras 