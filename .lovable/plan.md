

# Plano de Revisão Completa do Backend CEBIO Brasil

## Problemas Encontrados

### 1. BUG CRITICO: Erro de Sintaxe no ProjectService
O arquivo `server/src/services/ProjectService.ts` tem uma chave `}` faltando no final do método `rejectPendingEdit` (linha 259). Os métodos `listUserProjects` e `searchProjects` estão aninhados dentro de `rejectPendingEdit`, o que causa erro de compilação e impede o servidor de iniciar.

### 2. Entidade User Incompleta
A entidade `User` está faltando 4 colunas que existem no SQL e são usadas nas rotas:
- `phone` (VARCHAR 20)
- `department` (VARCHAR 300)
- `birth_date` (DATE)
- `registration_number` (VARCHAR 100)

As rotas de criação/atualização de usuário enviam esses campos, mas a entidade não os declara, então serão silenciosamente ignorados pelo TypeORM.

### 3. UserService Incompatível com as Rotas
- O método `createUser` aceita apenas 6 parâmetros, mas a rota envia 11 (incluindo cpf, birth_date, phone, department, registration_number)
- O método `getUserByCpf` não existe, mas a rota `/users/by-cpf/:cpf` tenta chamá-lo
- O perfil (`/auth/profile`) retorna `user.birth_date`, `user.phone`, etc. que não existem na entidade

### 4. Rotas de Exportação sem Autenticação
As rotas em `exports.ts` e `fullExport.ts` não usam `authMiddleware` nem `requireRole('admin')`. Qualquer pessoa pode acessar `/api/exports/full/excel` e exportar todos os dados do sistema, incluindo dados sensíveis.

### 5. Login sem Rate Limiting
O `loginLimiter` está definido em `security.ts` mas nunca é aplicado na rota `/api/login` em `auth.ts`. Isso permite ataques de força bruta ilimitados.

### 6. Hash de Senha Fraco (SHA256)
O sistema usa `crypto.createHash('sha256')` puro para senhas, sem salt. Isso é vulnerável a rainbow tables. O ideal seria bcrypt ou argon2, mas como o projeto é uma replicação 1:1 e o SQL já tem os hashes SHA256, vou manter a consistência e apenas documentar.

### 7. Validadores Definidos mas Não Usados
O arquivo `validation.ts` tem validadores completos (`validateLogin`, `validateCreateUser`, etc.), mas nenhuma rota os utiliza. Os dados passam direto sem validação/sanitização server-side.

---

## Plano de Correções

### Etapa 1: Corrigir User Entity
Adicionar as 4 colunas faltantes (`phone`, `department`, `birth_date`, `registration_number`) à entidade `User.ts`.

### Etapa 2: Corrigir UserService
- Expandir `createUser` para aceitar todos os campos (cpf, birth_date, phone, department, registration_number)
- Adicionar método `getUserByCpf`

### Etapa 3: Corrigir ProjectService (Bug Crítico)
Adicionar a chave `}` faltante para fechar corretamente o método `rejectPendingEdit` antes de `listUserProjects`.

### Etapa 4: Proteger Rotas de Exportação
Adicionar `authMiddleware` e `requireRole('admin')` em todas as rotas de `exports.ts` e `fullExport.ts`.

### Etapa 5: Aplicar Rate Limiting no Login
Importar e aplicar `loginLimiter` na rota POST `/login` em `auth.ts`.

### Etapa 6: Aplicar Validadores nas Rotas
Conectar os validadores já criados (`validateLogin`, `validateCreateUser`, `validateCreateProject`, etc.) às rotas correspondentes com `handleValidationErrors`.

### Etapa 7: Atualizar SQL de Banco
Atualizar `cebio_database.sql` para garantir total consistência com as entidades (já está correto - os campos existem no SQL mas faltavam na entidade TypeORM).

### Etapa 8: Configuração de Produção
- Desativar `synchronize: true` em produção no `database.ts`
- Garantir que `JWT_SECRET` use valor seguro (já configurável via env)

---

## Como Hospedar

Após as correções, para colocar tudo em produção:

1. **Servidor (VPS ou Cloud)**: Alugue um servidor (DigitalOcean, AWS, Contabo, etc.)
2. **MySQL**: Instale MySQL 8.x e importe o arquivo `cebio_database.sql`
3. **Backend**: Copie a pasta `server/`, execute `npm install`, configure o `.env` com dados do banco, e execute `npm run build && npm start`
4. **Frontend**: Execute `npm run build` na raiz e sirva a pasta `dist/` via Nginx
5. **Nginx**: Configure como proxy reverso para o backend na porta 8000 e sirva o frontend estático, com redirecionamento de `/api` para o backend

O frontend já usa `/api` como base URL relativa, então basta o Nginx rotear corretamente.

