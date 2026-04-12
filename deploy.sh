#!/bin/bash
# ========================================
# CEBIO Brasil - Script de Deploy
# ========================================
set -e

echo "╔════════════════════════════════════════╗"
echo "║   🚀 CEBIO Brasil - Deploy na VPS     ║"
echo "╚════════════════════════════════════════╝"

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Instalando..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo "✅ Docker instalado. Faça logout e login novamente, depois rode este script de novo."
    exit 0
fi

# Verificar se Docker Compose está disponível
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Instalando..."
    sudo apt-get update && sudo apt-get install -y docker-compose-plugin
fi

# Criar .env se não existir
if [ ! -f .env ]; then
    echo "📋 Criando arquivo .env a partir do template..."
    cp .env.production .env
    echo "⚠️  IMPORTANTE: Edite o arquivo .env com suas senhas antes de continuar!"
    echo "   Execute: nano .env"
    echo "   Depois rode este script novamente."
    exit 1
fi

echo ""
echo "🔨 Construindo e iniciando containers..."
echo ""

# Parar containers existentes
docker compose down 2>/dev/null || true

# Construir e iniciar
docker compose up -d --build

echo ""
echo "⏳ Aguardando serviços iniciarem..."
sleep 10

# Verificar health
echo ""
echo "🔍 Verificando serviços..."

if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend: OK"
else
    echo "⏳ Backend ainda iniciando... aguarde mais alguns segundos"
fi

if curl -sf http://localhost > /dev/null 2>&1; then
    echo "✅ Frontend: OK"
else
    echo "⏳ Frontend ainda iniciando..."
fi

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║   ✅ Deploy concluído!                         ║"
echo "║                                                ║"
echo "║   🌐 Frontend: http://$(hostname -I | awk '{print $1}')        ║"
echo "║   📡 API:      http://$(hostname -I | awk '{print $1}'):8000   ║"
echo "║   📊 Health:   http://$(hostname -I | awk '{print $1}'):8000/health ║"
echo "║                                                ║"
echo "║   📝 Comandos úteis:                           ║"
echo "║   docker compose logs -f    (ver logs)         ║"
echo "║   docker compose restart    (reiniciar)        ║"
echo "║   docker compose down       (parar tudo)       ║"
echo "╚════════════════════════════════════════════════╝"
