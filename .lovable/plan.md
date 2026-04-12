## Plano: Relatórios Avançados, Migração para bcrypt e Auditoria de Produção

### 1. Novos Relatórios para o Admin

A página de relatórios atual tem apenas 5 gráficos básicos (por status, categoria, usuario, temporal, tipo). Vou adicionar relatórios analíticos e comparativos realmente úteis para gestão acadêmica:

**Novos relatórios/gráficos:**

- **Taxa de aprovação por categoria** -- comparar quais categorias têm mais aprovações vs rejeições
- **Tempo médio de revisão** -- quanto tempo leva da submissão à aprovação/rejeição
- **Projetos por nível acadêmico** -- distribuição por graduação, mestrado, doutorado etc.
- **Comparativo mensal** -- gráfico de linhas com múltiplas séries (aprovados vs rejeitados vs pendentes por mês)
- **Ranking de categorias por produtividade** -- categorias com mais projetos aprovados
- **Distribuição de co-autores** -- quantos projetos têm 1, 2, 3+ autores
- **Usuários inativos vs ativos** -- saúde da base de usuários
- **Projetos devolvidos/rejeitados** -- taxa de retrabalho por autor

**Função de comparação:**

- Seletor de dois períodos (ex: Jan-Mar vs Abr-Jun) para comparar métricas lado a lado
- Cards comparativos mostrando variação percentual entre períodos

**Arquivos afetados:**

- `src/pages/admin/AdminReports.tsx` -- adicionar novos gráficos, seção de comparação e KPIs extras

### 2. Migração SHA256 para bcrypt

Trocar o hash de senhas de SHA256 (inseguro) para bcrypt com salt.

**Arquivos afetados:**

- `server/package.json` -- adicionar `bcryptjs` e `@types/bcryptjs`
- `server/src/middleware/auth.ts` -- trocar `hashPassword` para usar `bcryptjs.hashSync` e `verifyPassword` para `bcryptjs.compareSync`
- `server/src/database/seed.ts` -- já usa `hashPassword`, funcionará automaticamente

**Compatibilidade:** Senhas existentes em SHA256 no banco não vão funcionar com bcrypt. Solução: manter um fallback que tenta bcrypt primeiro; se falhar, tenta SHA256 e, se válido, re-hash com bcrypt automaticamente (migração transparente).

### 3. Auditoria de Produção -- Problemas Identificados

Quero que faça o back ende em node js  
  
**Problemas encontrados que serão corrigidos:**

1. **URL hardcoded no frontend** -- `src/services/api.ts` linha 4 e `AdminReports.tsx` linha 295 apontam para `https://8000-ic0wocwek8fkyj0l4wen8-a1d98c48.us2.manus.computer/api`. Deve usar URL relativa (`/api`) ou variável de ambiente.
2. **Helmet e Rate Limiting comentados** -- `server/src/index.ts` linhas 38-44. Serão reativados com configuração adequada.
3. **Console.log de debug no middleware auth** -- `server/src/utils/auth.ts` linhas 17-19 exibem token no console. Serão removidos.
4. **Senha mínima de 6 chars** -- `server/src/routes/auth.ts` linha 117 exige apenas 6 chars, contradizendo a política de 8 chars com complexidade. Será corrigido.
5. **CORS origin: true** -- aceita qualquer origem. Em produção deve ser restrito. Será parametrizado via `.env`.

### Resumo de arquivos a modificar


| Arquivo                            | Alteração                                              |
| ---------------------------------- | ------------------------------------------------------ |
| `src/pages/admin/AdminReports.tsx` | Adicionar 8+ novos relatórios e comparação de períodos |
| `src/services/api.ts`              | Corrigir URL hardcoded para relativa                   |
| `server/package.json`              | Adicionar bcryptjs                                     |
| `server/src/middleware/auth.ts`    | Migrar para bcrypt com fallback SHA256                 |
| `server/src/utils/auth.ts`         | Remover console.logs de debug                          |
| `server/src/index.ts`              | Reativar Helmet e Rate Limiting                        |
| `server/src/routes/auth.ts`        | Corrigir validação de senha mínima para 8 chars        |
