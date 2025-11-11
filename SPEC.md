# Smart Filter & Admin Integration — Stabilization Plan (v2)

## Context & Non‑Negotiable Guarantees

The current Smart Filter + detalhes flow is **correct** and already validated with clientes.  
The pages `/resultados` and `/detalhes` must continue devolvendo:

- Mesmas disponibilidades exibidas hoje para qualquer combinação de filtros.
- Mesmos valores (total do pacote, preço por pessoa, parcelamento, taxas) com regras atuais de cortesia e transporte.
- Mesmas recomposições por quarto, inclusive quando existem múltiplos quartos ou diárias agregadas.

O objetivo deste plano é:
1. Proteger essa base com testes e fixtures para evitar regressões.
2. Preparar o código para evoluções futuras (descontos configuráveis, analytics, admin CRUD) **sem quebrar o core**.
3. Integrar o painel administrativo (ADMIN_SPEC) com o mesmo serviço de dados, mantendo consistência ponta a ponta.

## Fases e Guard‑rails

### Fase 0 – Baseline congelado
Antes de qualquer mudança estrutural:
- Criar fixtures com os filtros críticos usados pelo cliente (ex.: Bus + Córdoba + Canasvieiras + 19/out + 2 adultos, Aéreo + Córdoba + Canasvieiras + 4/jan etc.).  
  Armazenar em `tests/fixtures/baseline/*.json`.
- Escrever um teste (`vitest`) que chame os helpers usados hoje (`fetchRealData`, `filtrarResultados`, cálculos de parcelas) e compare o output com as fixtures.
- Adicionar um script utilitário `npm run test:baseline` que roda somente esses asserts. Ele deve falhar se qualquer campo importante mudar.

> Nenhuma refatoração (nem extração para `result-composer`) deve ocorrer até esses testes existirem.

### Fase 1 – UX & Observabilidade (sem tocar nos cálculos)
1. **Loading amigável em `/resultados`**  
   - Enquanto `loadData()` estiver rodando, exibir shimmer/spinner em vez do estado "sem resultados".
   - Assegurar que o primeiro render nunca mostre cards vazios.

2. **Logger controlado**  
   - Pequeno utilitário (ex.: `lib/logger.ts`) que respeita `NEXT_PUBLIC_DEBUG_LOGS`.  
   - Substituir `console.log` diretos apenas onde necessário; comportamento padrão = silencioso.

3. **Coleta de analytics** (já prevista na ADMIN_SPEC)  
   - Garantir que `insertSearchEvent` e `insertConversionEvent` são chamados somente após o retorno dos resultados corretos.
   - Teste unitário assegurando que uma chamada de busca válida grava o evento com o payload esperado.

### Fase 2 – Test Harness para cálculos
1. **Snapshots de preços**  
   - Criar testes em `lib/__tests__/package-pricing.test.ts` com os casos clássicos (Bus 2+1, Bus 2+2, Aéreo 2+0+1 etc.).
   - Adicionar teste para parcelamento (`calculateInstallments`) com as datas utilizadas no site.
2. **Comparação Resultado ↔ Detalhes**  
   - Testar uma função `assertResultAndDetailParity` que:
     - pega uma disponibilidade simulada;
     - gera URL com `gerarUrlDetalhes`;
     - reexecuta o cálculo da página de detalhes (com os mesmos dados) e compara total final e parcelas.
3. **Fixtures do Smart Filter**  
   - Criar mocks minimalistas para `/api/smart-filter` (pacote Bus, pacote Aéreo) e garantir que a resposta bate com os dados dos cartões atuais.

### Fase 3 – Integração do Painel Admin (ADMIN_SPEC)
> Só iniciar esta fase depois que Fase 0–2 estiverem verdes e o baseline conferido manualmente.

1. **Service único com descontos**  
   - `lib/supabase-service.ts` deve expor:
     - `fetchRealData`, `fetchDisponibilidadeById`, `fetchActiveDiscountRules`, `insertSearchEvent`, `insertConversionEvent`, `insertAuditLog`.
     - `fetchActiveDiscountRules` precisa aplicar filtros opcionais (transporte, destino, slug, hotel) e ignorar regras expiradas.
   - Introduzir `computePackageTotalWithDiscounts` (em `lib/package-pricing.ts`) como um wrapper de `computePackageBaseTotal`.  
     - Quando não houver regras ativas → saída idêntica ao cálculo base (validado em teste).  
     - Quando houver, aplicar as regras e armazenar `totalOriginalUSD` + breakdown de descontos para exibir no detalhe.

2. **Admin CRUD (já implementado) – garantir consistência**
   - APIs `/api/admin/*` devem consumir diretamente `supabaseServer()` e chamar `insertAuditLog` com o mesmo client para respeitar RLS.
   - O painel `/admin/disponibilidades` precisa:
     - Usar `fetchDisponibilidadeById` na edição.
     - Exibir toast de loading apenas após resposta (já feito).
   - Para `discount_rules`:
     - UI deve mostrar claramente quanto a regra impacta (valor fixo ou %).  
     - Teste: ao criar uma regra para “Aéreo – adultos 6+ – USD 150” os cards exibem desconto e o total final confere com `computePackageTotalWithDiscounts`.

3. **Analytics**  
   - Página `/admin/analytics` usa `getAnalyticsOverview({ days })`, gráficos com Recharts e botão "Exportar CSV".  
   - CSV precisa incluir tanto `search_events` quanto `conversion_events`, e baixar com `attachment`.

4. **Audit Log & Rate‑limit**  
   - `/admin/audit-log` com filtros por entidade/usuário/período (já implementado).  
   - Middleware mantendo rate-limit (`rateLimitStore`) sem bloquear tráfego normal.

### Fase 4 – Fallback & Guardrails de Produção
1. `NEXT_PUBLIC_ENABLE_FALLBACK` deve ser **false** em produção.  
   - Adicionar uma verificação em `fetchRealData`: se fallback estiver desligado e a query falhar → propagar erro (para não retornar dados mockados sem querer).
2. Documentar no README a ordem das migrations e como ativar o painel admin.
3. Adicionar checagens automáticas (ex.: GitHub Actions futura) rodando `npm run lint`, `npm run test`, `npm run build`.

## Testes Obrigatórios
| Cenário | Filtro | Checagem |
| --- | --- | --- |
| Bus baseline | Bus + Córdoba + Canasvieiras + 19/out + 2 adultos | cards, parcelas e totais iguais aos prints validados |
| Bus + quartos múltiplos | Bus + Córdoba + Canasvieiras + 19/out + 2 quartos (2+2) | recomposição por quarto e totais consistentes |
| Aéreo baseline | Aéreo + Córdoba + Canasvieiras + 04/jan + 1 quarto (2 adultos) | valores com taxas aéreas corretas |
| Hospedagem baseline | Hospedagem + check-in/out fixos | subtotal = diária × noites, tipo de quarto coerente |
| Desconto admin | Regra "-USD 150 por adulto 6+" ativa | total original, total final, desconto por regra exibidos |
| Analytics | Executar busca de exemplo | `/admin/analytics` mostra contadores incrementados e CSV contém o evento |

## Deliverables
1. Fixtures e testes automatizados protegendo os combos críticos.
2. UX de carregamento em `/resultados` + logger controlado.
3. Painel admin integrado ao serviço único (CRUD, analytics, audit log) sem alterar o comportamento padrão do site.
4. Funções de pricing capazes de aplicar descontos quando existirem regras, mantendo 100% compatível quando não houver regras.
5. README e documentação atualizados (migrations, como habilitar admin, como rodar testes).

## Regras de Ouro
- Nunca alterar `computePackageBaseTotal` sem atualizar os testes de baseline.
- Qualquer mudança em filtros ou recomposição deve ser comparada com fixtures primeiro.
- Admin nunca deve introduzir fallback silencioso; todas as regras e dados vêm do Supabase real.
- Qualquer refatoração estrutural deve ser feita em pequenos passos; rode `npm run lint` e `npm run test` após cada bloco.

Seguindo esse roteiro, conseguimos evoluir o projeto (descontos dinâmicos, analytics, gestão via admin) mantendo a confiabilidade do Smart Filter e evitando regressões como as que observamos. Don’t break the core!
