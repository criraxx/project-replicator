# ========================
# Backend Node.js
# ========================
FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json ./

# Instalar dependências
RUN npm ci --omit=dev

# Instalar ts-node para seed (opcional)
RUN npm install -g typescript ts-node

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN npx tsc

# Criar pasta de uploads
RUN mkdir -p /app/uploads

EXPOSE 8000

CMD ["node", "dist/index.js"]
