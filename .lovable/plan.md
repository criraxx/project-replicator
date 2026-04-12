

## Plan: Hardening de Segurança do Backend

### O que sera feito

**1. JWT_SECRET forte (server/.env)**
- Gerar uma chave aleatoria de 64 caracteres (256+ bits) usando `crypto.randomBytes(32).toString('hex')`
- Substituir `manus_secret_key_123` pela chave gerada
- Adicionar validacao no startup do servidor para rejeitar secrets fracos (< 32 caracteres)

**2. Reativar Rate Limiting (server/src/middleware/security.ts)**
- Importar `rateLimit` de `express-rate-limit` (ja instalado)
- `globalLimiter`: 200 requests / 15 min por IP
- `loginLimiter`: 5 tentativas / 15 min por IP (protecao contra brute-force)
- `apiLimiter`: 100 requests / 15 min por IP
- Mensagens de erro em portugues

**3. Proteger rota de download (server/src/routes/files.ts)**
- Adicionar `authMiddleware` na rota `/projects/:id/files/:fileId/download`
- Isso garante que apenas usuarios autenticados possam baixar arquivos (fotos e PDFs)
- O frontend ja envia o token JWT nas requisicoes, entao nao havera quebra de funcionalidade

### Arquivos alterados

| Arquivo | Alteracao |
|---------|-----------|
| `server/.env` | JWT_SECRET com chave forte gerada |
| `server/src/middleware/security.ts` | Rate limiters reais com `express-rate-limit` |
| `server/src/routes/files.ts` | `authMiddleware` na rota de download |
| `server/src/index.ts` | Validacao de JWT_SECRET no startup |

