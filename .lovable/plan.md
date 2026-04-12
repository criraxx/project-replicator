

## Plano: Documento de Metodologia e Tecnologias do Sistema CEBIO Brasil

### Resumo

Gerar um documento PDF profissional descrevendo toda a metodologia do projeto, incluindo as tecnologias utilizadas, a arquitetura, os modulos funcionais e a logica de cada funcionalidade — tanto no frontend quanto no backend.

### O que o documento contera

**1. Introducao e Visao Geral do Sistema**
- Descricao do CEBIO Brasil como plataforma de gestao de projetos academicos/cientificos
- Tres perfis de acesso: Administrador, Pesquisador, Bolsista

**2. Arquitetura do Sistema**
- Diagrama textual da arquitetura: Frontend SPA → Nginx (proxy reverso) → Backend API → MySQL
- Separacao clara entre cliente e servidor
- Comunicacao via API REST com caminhos relativos (`/api`)

**3. Stack Tecnologico Detalhado**

*Frontend:*
- React 18, TypeScript 5, Vite 5 (bundler/dev server)
- Tailwind CSS 3 (estilizacao utilitaria)
- Shadcn/UI + Radix UI (componentes acessiveis)
- React Router DOM 6 (roteamento SPA)
- TanStack React Query 5 (gerenciamento de estado servidor)
- React Hook Form + Zod (formularios e validacao)
- Recharts (graficos e visualizacoes)
- Lucide React (icones)
- date-fns (manipulacao de datas)
- Sonner (notificacoes toast)

*Backend:*
- Node.js + Express 4 (servidor HTTP)
- TypeScript 5 (tipagem estatica)
- TypeORM 0.3 (ORM para MySQL)
- MySQL 8.x (banco de dados relacional)
- JSON Web Token (autenticacao stateless)
- bcryptjs (hashing de senhas com migracao SHA256→bcrypt)
- Helmet (headers de seguranca HTTP)
- express-rate-limit (protecao contra abuso)
- express-validator + xss (validacao e sanitizacao de entrada)
- Multer (upload de arquivos)
- ExcelJS + PDFKit (exportacao de relatorios)
- Winston (logging estruturado)

*Infraestrutura/DevOps:*
- Docker + Docker Compose (containerizacao)
- Nginx (proxy reverso e servidor de arquivos estaticos)
- Let's Encrypt / Certbot (SSL/HTTPS)
- Azure VM (hospedagem)

**4. Descricao de Cada Modulo Funcional**

Para cada modulo, descreverei: o que faz, como funciona no frontend, como funciona no backend, e o fluxo de dados.

- **Autenticacao**: Login com JWT, validacao de sessao via `/auth/me`, logout, troca de senha, migracao transparente SHA256→bcrypt
- **Gestao de Usuarios**: CRUD completo (admin), cadastro individual e em lote, reset de senha, busca por CPF, validacao de duplicidade (email+CPF)
- **Gestao de Projetos**: Criacao, edicao, submissao com ciclo de vida completo (rascunho → pendente → aprovado/rejeitado/devolvido), soft-delete, versionamento de campos, busca
- **Fluxo de Coautoria**: Adicao de coautores por CPF, status `aguardando_autores`, aprovacao/rejeicao individual, notificacao automatica, avanço automatico para `pendente`
- **Solicitacao de Edicao**: Projetos aprovados permitem edicoes pendentes que requerem aprovacao administrativa
- **Upload de Arquivos**: Fotos (JPG/PNG/GIF/WEBP) e PDFs, limite de 5 cada, 50MB max, armazenamento em disco organizado por projeto
- **Notificacoes**: Criacao automatica por eventos, notificacao em massa (broadcast), marcar como lida, listagem paginada
- **Auditoria**: Log de todas as acoes criticas (login, CRUD, aprovacoes), com severidade, IP, usuario e timestamp
- **Relatorios e Exportacao**: Dashboards com KPIs, graficos (pizza, barras, linhas, pictograma), exportacao em PDF/Excel/JSON, exportacao completa do banco
- **Categorias e Niveis Academicos**: CRUD administrativo com slug, cor, descricao
- **Seguranca**: Helmet, rate limiting (5 login/15min, 200 global/15min), validacao de Content-Type, sanitizacao XSS, protecao de rotas por role

**5. Modelo de Dados**
- 12 entidades: User, Project, ProjectVersion, ProjectComment, ProjectAuthor, ProjectLink, ProjectFile, Category, AcademicLevel, AuditLog, Notification, SystemConfig
- Relacionamentos principais documentados

**6. Padroes de Seguranca**
- JWT com expiracao de 4h
- Bcrypt com 10 rounds
- Controle de acesso por middleware (authMiddleware + requireRole)
- Validacao e sanitizacao de todas as entradas
- Soft-delete para projetos (preserva dados)

### Como sera feito

Gerarei o documento como PDF profissional em `/mnt/documents/metodologia_cebio_brasil.pdf` usando um script Python com a biblioteca `reportlab`, formatado com capa, sumario, secoes numeradas e diagramas textuais.

### Resultado

Um PDF completo e profissional descrevendo toda a metodologia e tecnologias do sistema CEBIO Brasil, pronto para uso academico ou institucional.

