# ========================
# Frontend - Build Stage
# ========================
FROM node:20-alpine AS build

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json ./

# Instalar dependências sem depender de lockfile sincronizado
RUN npm install

# Copiar código fonte
COPY . .

# Aceitar variável de API URL no build
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build do frontend
RUN npm run build

# ========================
# Frontend - Nginx Stage
# ========================
FROM nginx:alpine

# Copiar config do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build do frontend
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
