# Guia de Hospedagem - CEBIO Brasil (Versão Corrigida)

Este guia explica como hospedar o sistema CEBIO Brasil exatamente como configurado nesta sessão, garantindo que o Frontend, Backend e Banco de Dados funcionem perfeitamente.

## 1. Requisitos do Sistema
- **Node.js:** v18 ou superior (recomendado v22)
- **Gerenciador de Pacotes:** `pnpm` (recomendado) ou `npm`
- **Banco de Dados:** MySQL 8.0+

---

## 2. Configuração do Banco de Dados (MySQL)
Crie o banco de dados e o usuário executando os seguintes comandos no seu terminal MySQL:

```sql
CREATE DATABASE IF NOT EXISTS cebio_db;
CREATE USER IF NOT EXISTS 'cebio_user'@'localhost' IDENTIFIED BY 'cebio_pass';
GRANT ALL PRIVILEGES ON cebio_db.* TO 'cebio_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 3. Configuração do Backend
Acesse a pasta `server` e configure as variáveis de ambiente:

1. Entre na pasta: `cd server`
2. Crie ou edite o arquivo `.env`:
   ```env
   PORT=8000
   NODE_ENV=production
   
   # Banco de Dados
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=cebio_user
   DB_PASS=cebio_pass
   DB_NAME=cebio_db
   
   # Segurança
   JWT_SECRET=sua_chave_secreta_aqui
   ```
3. Instale as dependências: `pnpm install`
4. Inicie o servidor: `pnpm run dev` (ou `npm run dev`)

---

## 4. Configuração do Frontend
Acesse a pasta raiz do projeto:

1. Edite o arquivo `src/services/api.ts`:
   - Altere a constante `API_BASE_URL` para o endereço do seu servidor (ex: `http://localhost:8000/api`).
2. Instale as dependências: `pnpm install`
3. Inicie o frontend: `pnpm run dev`

---

## 5. Credenciais Padrão (Admin)
Após iniciar o sistema, você pode acessar com o usuário administrador padrão:
- **E-mail:** `admin@cebio.org.br`
- **Senha:** `admin123`

---

## 6. Observações Importantes
- **CORS:** O backend já está configurado para permitir conexões de qualquer origem (`origin: true`). Para produção, recomenda-se restringir ao seu domínio real.
- **Relatórios PDF:** O sistema utiliza `pdfkit` para gerar gráficos nativos de alta qualidade. Certifique-se de que o servidor tenha permissão de escrita na pasta `server/logs`.
- **Uploads:** Os arquivos enviados ficam armazenados na pasta `uploads/` na raiz do projeto.

---
*CEBIO Brasil - Centro de Excelência em Bioinsumos*
