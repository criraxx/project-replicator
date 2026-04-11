

## Plano de Correções — 4 Problemas Identificados

### Problema 1: Ao recarregar a página, mostra conteúdo do perfil errado (admin em vez de pesquisador)

**Causa raiz**: As rotas não têm proteção por role. Qualquer usuário logado (ou com dados em cache de outro login) pode acessar `/admin/*`, `/pesquisador/*`, etc. Quando o usuário recarrega, o React Router renderiza a rota diretamente sem verificar se o role do usuário corresponde ao prefixo da URL.

**Solução**: Criar um componente `ProtectedRoute` que:
- Verifica se o usuário está autenticado (senão redireciona para `/login`)
- Verifica se o `user.role` corresponde ao role exigido pela rota
- Se não corresponder, redireciona para o dashboard correto do usuário
- Envolver **todas** as rotas em `App.tsx` com este componente

### Problema 2: Feedback de validação de senha no cadastro de usuários

**Causa raiz**: O frontend no `AdminUsers.tsx` não valida a senha antes de enviar. O backend exige maiúscula, minúscula, número e caractere especial (regex já existe), mas o frontend não informa ao admin essas regras e não mostra o erro de forma clara.

**Solução**:
- Adicionar validação client-side da senha no formulário de criação de usuário
- Mostrar mensagem clara dos requisitos (min 8 chars, maiúscula, minúscula, número, caractere especial)
- Exibir erros do backend de forma legível quando a API retorna erro de validação
- Alterar a senha padrão de `cebio2024` para algo como `Cebio@2024` que atende os requisitos

### Problema 3: Auto-preenchimento do CPF e dados do autor principal na submissão

**Causa raiz**: O `SubmissionForm` inicializa o autor principal só com `user.name`, mas sem CPF nem instituição do perfil real. O `AuthContext.User` não inclui CPF.

**Solução**:
- No `SubmissionForm`, fazer um `api.getProfile()` ao montar o componente para buscar CPF, instituição e outros dados
- Auto-preencher o autor principal com esses dados
- Tornar os campos do autor principal somente leitura (são dados do usuário logado)

### Problema 4: Auto-formatação de CPF no formulário de submissão

**Causa raiz**: O campo CPF no `SubmissionForm` não tem máscara de formatação. O `AdminUsers` já tem `formatCpf`, `formatDate` e `formatPhone` implementados, mas não foram reutilizados.

**Solução**:
- Extrair as funções `formatCpf`, `formatDate`, `formatPhone` para um utilitário compartilhado (`src/lib/formatters.ts`)
- Aplicar `formatCpf` no campo CPF do `SubmissionForm`
- Reutilizar em ambos os lugares

---

### Arquivos a criar/modificar

1. **Criar** `src/components/ProtectedRoute.tsx` — componente de proteção de rotas
2. **Modificar** `src/App.tsx` — envolver todas as rotas com `ProtectedRoute`
3. **Criar** `src/lib/formatters.ts` — funções de formatação compartilhadas
4. **Modificar** `src/pages/admin/AdminUsers.tsx` — validação de senha no form + usar formatters + senha padrão corrigida
5. **Modificar** `src/pages/shared/SubmissionForm.tsx` — buscar perfil, auto-preencher autor principal, aplicar máscara CPF

