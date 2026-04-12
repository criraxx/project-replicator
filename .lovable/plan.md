

## Plano: SQL limpo + limpeza de arquivos nao utilizados

### 1. Criar `server/cebio_database_production.sql` (SQL limpo)

Script SQL com a estrutura completa das 12 tabelas (extraida do `cebio_database_updated.sql` que e a versao mais atual) mas com **apenas 1 registro de seed**: o usuario admin.

- 12 tabelas na ordem correta de dependencias (users primeiro, depois as que referenciam users)
- ENUM de status completo: `rascunho, pendente, em_revisao, aprovado, rejeitado, aguardando_autores, devolvido`
- Todos os indices e foreign keys
- Configuracoes do sistema (system_config) com valores padrao
- **Unico dado**: admin@cebio.org.br / admin123 (SHA256)
- Tabelas de categorias, niveis academicos, projetos, etc: **vazias**

### 2. Remover arquivos nao utilizados

| Arquivo | Motivo da remocao |
|---|---|
| `server/cebio_database.sql` | SQL antigo, substituido pelo novo production.sql |
| `server/cebio_database_updated.sql` | Dump de teste com dados lixo, substituido pelo novo |
| `server/src/database/seed.ts` | Script de seed com dados fictícios, desnecessario em producao |
| `server/uploads/project_10/*` | Arquivos de teste (3 arquivos) |
| `server/uploads/project_11/*` | Arquivos de teste |
| `server/uploads/project_13/*` | Arquivos de teste |
| `src/test/setup.ts` | Setup de testes sem nenhum teste no frontend |
| `vitest.config.ts` | Config de testes sem nenhum teste no frontend |
| `bun.lock` | Lock file duplicado (ja existe pnpm-lock.yaml) |
| `bun.lockb` | Lock file duplicado |
| `package-lock.json` | Lock file duplicado |
| `pnpm-lock.yaml` (raiz) | Lock file duplicado (projeto usa bun no Lovable) |
| `server/package-lock.json` | Lock file duplicado (server usa pnpm) |

### 3. Atualizar `src/pages/admin/AdminUsers.tsx`

Remover o import `type User` de `@/data/mockData` — verificar se o tipo User ja existe em `src/services/api.ts` ou definir inline.

### 4. Avaliar `src/data/mockData.ts`

O arquivo contem apenas **interfaces TypeScript** (nao dados mock de verdade). So e importado em AdminUsers.tsx. Se o tipo User ja existir em api.ts, remover o mockData.ts inteiro. Caso contrario, mover o tipo para um local mais adequado.

### Detalhes tecnicos do SQL

- Senha do admin: `240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9` (SHA256 de "admin123")
- O backend migra automaticamente para bcrypt no primeiro login
- Charset: utf8mb4, collation: utf8mb4_unicode_ci
- Engine: InnoDB
- Compatible com MySQL 8.x e MariaDB 10.6+

