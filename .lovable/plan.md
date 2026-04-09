

## Plan: Alinhar e Organizar o Frontend CEBIO

### Problemas Identificados

1. **ADMIN_NAV duplicado** em 6 arquivos admin (Dashboard, Projects, Users, Actions, Reports, Audit) -- idêntico em todos
2. **statusColors e statusLabels duplicados** em 4 arquivos (AdminDashboard, AdminProjects, PesquisadorDashboard, BolsistaDashboard)
3. **roleBadge duplicado** em TopHeader e AdminUsers
4. **Credenciais mock desalinhadas** com o seed do backend -- frontend usa `admin@cebio.com` mas o backend usa `admin@cebio.org.br`
5. **Mock data**: interfaces Project, User, AuditLog não refletem todas as entidades do backend (faltam ProjectAuthor, ProjectComment, ProjectFile, ProjectLink, ProjectVersion, SystemConfig)
6. **Rotas placeholder** -- `/pesquisador/projetos`, `/pesquisador/historico`, `/bolsista/projetos`, `/bolsista/historico` apontam para o mesmo Dashboard sem conteúdo diferenciado
7. **Import não usado**: `useNavigate` em AdminActions.tsx
8. **`Project` import não usado**: em AdminProjects.tsx (`Project` type importado mas não utilizado como tipo explícito)

### O que será feito

#### 1. Extrair constantes compartilhadas para `src/constants/navigation.ts`
- `ADMIN_NAV`, `PESQUISADOR_NAV`, `BOLSISTA_NAV` num único arquivo
- `statusColors`, `statusLabels`, `roleBadge`, `severityColors` em `src/constants/ui.ts`
- Atualizar todos os 10 arquivos que usam essas constantes

#### 2. Sincronizar credenciais e mock data com o backend (seed.ts)
- Atualizar `AuthContext.tsx`: emails para `admin@cebio.org.br`, `pesquisador@cebio.org.br`, `bolsista@cebio.org.br`
- Atualizar senhas conforme seed: `admin123`, `pesq123`, `bolsa123`
- Atualizar nomes conforme seed
- Atualizar credenciais de teste no `Login.tsx`
- Atualizar `mockData.ts` para alinhar emails/nomes com os novos dados

#### 3. Expandir interfaces para refletir as entities do backend
- Adicionar interfaces: `ProjectAuthor`, `ProjectComment`, `ProjectFile`, `ProjectLink`, `ProjectVersion` em `mockData.ts`
- Expandir `Project` para incluir campos `keywords`, `authors`, `files`, `links`, `comments`
- Adicionar interface `SystemConfig`

#### 4. Criar páginas distintas para rotas placeholder
- `src/pages/pesquisador/PesquisadorProjects.tsx` -- lista de projetos do pesquisador
- `src/pages/pesquisador/PesquisadorHistory.tsx` -- histórico de submissões
- `src/pages/bolsista/BolsistaProjects.tsx` -- lista de projetos do bolsista
- `src/pages/bolsista/BolsistaHistory.tsx` -- histórico de submissões
- Atualizar `App.tsx` com as novas rotas

#### 5. Limpeza de imports e código
- Remover `useNavigate` não utilizado em AdminActions
- Remover tipo `Project` não utilizado em AdminProjects
- Garantir que todos os imports estejam corretos

### Arquivos modificados
- `src/constants/navigation.ts` (novo)
- `src/constants/ui.ts` (novo)
- `src/contexts/AuthContext.tsx`
- `src/data/mockData.ts`
- `src/pages/Login.tsx`
- `src/pages/admin/AdminDashboard.tsx`
- `src/pages/admin/AdminProjects.tsx`
- `src/pages/admin/AdminUsers.tsx`
- `src/pages/admin/AdminActions.tsx`
- `src/pages/admin/AdminAudit.tsx`
- `src/pages/admin/AdminReports.tsx`
- `src/pages/pesquisador/PesquisadorDashboard.tsx`
- `src/pages/pesquisador/PesquisadorProjects.tsx` (novo)
- `src/pages/pesquisador/PesquisadorHistory.tsx` (novo)
- `src/pages/bolsista/BolsistaDashboard.tsx`
- `src/pages/bolsista/BolsistaProjects.tsx` (novo)
- `src/pages/bolsista/BolsistaHistory.tsx` (novo)
- `src/pages/shared/SubmissionForm.tsx`
- `src/components/layout/TopHeader.tsx`
- `src/components/layout/SubHeader.tsx`
- `src/App.tsx`

### Sem mudança funcional
Nenhuma funcionalidade será adicionada ou removida. Apenas organização, deduplicação e alinhamento com o backend.

