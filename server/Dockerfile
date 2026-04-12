# ========================
# Backend Node.js
# ========================
FROM node:20-alpine AS build

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar dependências de build
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN pnpm run build

FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar apenas dependências de produção
RUN npm install -g pnpm && pnpm install --prod --no-frozen-lockfile

# Copiar build final
COPY --from=build /app/dist ./dist

# Criar pasta de uploads
RUN mkdir -p /app/uploads

EXPOSE 8000

CMD ["node", "dist/index.js"]
