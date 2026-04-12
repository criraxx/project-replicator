#!/bin/bash
# ========================================
# CEBIO Brasil - Setup SSL com Let's Encrypt
# ========================================
# Uso: ./setup-ssl.sh seudominio.com
# ========================================
set -e

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "❌ Uso: ./setup-ssl.sh seudominio.com"
    exit 1
fi

echo "╔════════════════════════════════════════════╗"
echo "║   🔒 Setup SSL - Let's Encrypt            ║"
echo "║   Domínio: $DOMAIN"
echo "╚════════════════════════════════════════════╝"

# 1. Parar o frontend para liberar porta 80
echo "1️⃣  Parando frontend..."
docker compose stop frontend

# 2. Instalar certbot se necessário
if ! command -v certbot &> /dev/null; then
    echo "2️⃣  Instalando Certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot
else
    echo "2️⃣  Certbot já instalado ✅"
fi

# 3. Obter certificado
echo "3️⃣  Obtendo certificado SSL..."
sudo certbot certonly --standalone \
    -d $DOMAIN \
    -d www.$DOMAIN \
    --non-interactive \
    --agree-tos \
    --email admin@$DOMAIN \
    --no-eff-email

# 4. Preparar nginx-ssl.conf com domínio correto
echo "4️⃣  Configurando Nginx com SSL..."
sed "s/\${DOMAIN}/$DOMAIN/g" nginx-ssl.conf > nginx-ssl-final.conf

# 5. Atualizar docker-compose para usar SSL
echo "5️⃣  Atualizando docker-compose..."

# Criar override para SSL
cat > docker-compose.ssl.yml << EOF
version: '3.8'
services:
  frontend:
    volumes:
      - ./nginx-ssl-final.conf:/etc/nginx/conf.d/default.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - certbot_webroot:/var/www/certbot:ro
    ports:
      - "80:80"
      - "443:443"

  certbot:
    image: certbot/certbot
    container_name: cebio-certbot
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt
      - certbot_webroot:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew --webroot -w /var/www/certbot; sleep 12h & wait \$\${!}; done;'"

volumes:
  certbot_webroot:
EOF

# 6. Subir com SSL
echo "6️⃣  Iniciando com SSL..."
docker compose -f docker-compose.yml -f docker-compose.ssl.yml up -d

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║   ✅ SSL configurado!                          ║"
echo "║                                                ║"
echo "║   🔒 https://$DOMAIN"
echo "║                                                ║"
echo "║   O certificado renova automaticamente.        ║"
echo "║                                                ║"
echo "║   ⚠️  Lembre de atualizar no .env:             ║"
echo "║   CORS_ORIGINS=https://$DOMAIN"
echo "║   E rebuildar: docker compose up -d --build    ║"
echo "╚════════════════════════════════════════════════╝"
