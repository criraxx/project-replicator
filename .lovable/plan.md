

## Plano de Implementacao

### Resumo
3 tarefas principais:
1. Criar pagina de Rejeicao em Lote
2. Mover criacao de categorias/niveis do Dashboard para Acoes Admin
3. Reconstruir pagina de Relatorios com filtros completos e graficos interativos

---

### 1. Pagina de Rejeicao em Lote (`AdminBatchRejection.tsx`)

Criar pagina similar a `AdminBatchApproval.tsx` mas para rejeicao:
- Lista projetos pendentes com checkbox de selecao
- Campo obrigatorio de motivo da rejeicao (textarea)
- Botao "Rejeitar Selecionados" que envia os IDs + comentario
- Atualizar `api.ts` para `batchReject` aceitar comentario
- Registrar rota `/admin/rejeicao-lote` em `App.tsx`

### 2. Mover Categorias/Niveis para Acoes Admin

**Dashboard (`AdminDashboard.tsx`):**
- Remover botoes "Nova Categoria" e "Novo Nivel" da area de acoes rapidas
- Manter apenas: Novo Usuario, Pendentes, Auditoria

**Acoes Admin (`AdminActions.tsx`):**
- Adicionar 2 novos cards: "Gerenciar Categorias" (link para `/admin/categorias`) e "Gerenciar Niveis Academicos" (link para `/admin/categorias` na tab niveis)

### 3. Pagina de Relatorios Completa (`AdminReports.tsx`)

Reconstruir totalmente com:

**Painel de Filtros:**
- Status (pendente, aprovado, rejeitado, em revisao)
- Categoria (dropdown com categorias do sistema)
- Tipo de usuario (pesquisador, bolsista)
- Data de inicio e termino (range picker)
- Proprietario/autor especifico
- Botao "Gerar Relatorio" e "Limpar Filtros"

**KPIs dinamicos (cards no topo):**
- Total de projetos (filtrado), usuarios ativos, taxa de aprovacao, tempo medio de revisao

**Graficos interativos (Recharts, ja instalado):**
- **Colunas**: Projetos por categoria
- **Barras horizontais**: Projetos por usuario (top 10)
- **Linhas**: Evolucao temporal de submissoes por mes
- **Pizza/Setores**: Distribuicao por status
- **Pictograma**: Proporcao pesquisadores vs bolsistas (grid de icones)

**Seletor de tipo de grafico**: O admin pode alternar entre os 5 tipos para cada visualizacao

**Tabela resumo**: Dados tabulares com totais, exportavel

**Botao Exportar PDF**: Gera relatorio com os filtros aplicados

**Backend**: Criar endpoint `GET /api/reports/advanced` que aceita query params de filtro e retorna dados agregados (por status, por categoria, por usuario, por mes, totais).

---

### Detalhes Tecnicos

**Arquivos novos:**
- `src/pages/admin/AdminBatchRejection.tsx`

**Arquivos editados:**
- `src/pages/admin/AdminReports.tsx` (reconstruido)
- `src/pages/admin/AdminDashboard.tsx` (remover botoes categoria/nivel)
- `src/pages/admin/AdminActions.tsx` (adicionar cards categoria/nivel)
- `src/App.tsx` (rota rejeicao-lote)
- `src/services/api.ts` (endpoint reports/advanced, batchReject com comment)
- `server/src/routes/admin.ts` (endpoint reports/advanced)
- `server/src/services/ProjectService.ts` (metodo getAdvancedReport com filtros)

**Bibliotecas**: Recharts (ja instalado) para todos os graficos incluindo pictograma customizado.

