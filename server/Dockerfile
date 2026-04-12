# ========================
# Backend Node.js
# ========================
FROM node:20-alpine AS build

WORKDIR /app

# Copiar package.json (npm install gera o lock automaticamente)
COPY package.json ./

# Instalar todas as dependências (incluindo dev para compilar TS)
RUN npm install

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package.json ./

# Instalar apenas dependências de produção
RUN npm install --omit=dev

# Copiar build compilado
COPY --from=build /app/dist ./dist

# Criar pasta de uploads
RUN mkdir -p /app/uploads

EXPOSE 8000

CMD ["node", "dist/index.js"]
