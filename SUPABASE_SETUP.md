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

### Tabela: `cidades_salida`
```sql
- id (number)
- cidade (string)
- estado (string)
```

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