#!/bin/bash
# ========================================
# CEBIO Brasil - Deploy na Azure
# URL temporária via Azure Container Apps
# ========================================
set -e

echo "╔════════════════════════════════════════════╗"
echo "║   🚀 CEBIO Brasil - Deploy na Azure       ║"
echo "╚════════════════════════════════════════════╝"

# ========================
# CONFIGURAÇÕES - EDITE AQUI
# ========================
RESOURCE_GROUP="cebio-rg"
LOCATION="eastus"
ACR_NAME="cebioacr$(openssl rand -hex 4)"
ENVIRONMENT="cebio-env"
DB_PASSWORD="Cebio@2024Db!"
DB_ROOT_PASSWORD="Cebio@Root2024!"
JWT_SECRET="4c8cb482b2ceeb7ebe08079ad46e6bee76112d78db2056562c8aa0617613b408"

echo ""
echo "📋 Pré-requisitos:"
echo "  1. Azure CLI instalado (az)"
echo "  2. Estar logado: az login"
echo ""

# Verificar Azure CLI
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI não encontrado."
    echo "   Instale: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash"
    exit 1
fi

# Verificar login
az account show > /dev/null 2>&1 || {
    echo "❌ Não está logado. Execute: az login"
    exit 1
}

echo "✅ Azure CLI configurado"
echo ""

# ========================
# 1. Criar Resource Group
# ========================
echo "1️⃣  Criando Resource Group..."
az group create --name $RESOURCE_GROUP --location $LOCATION -o none

# ========================
# 2. Criar Azure Container Registry
# ========================
echo "2️⃣  Criando Container Registry..."
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true -o none
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)

# ========================
# 3. Criar MySQL Flexible Server
# ========================
echo "3️⃣  Criando MySQL na Azure..."
MYSQL_SERVER="cebio-mysql-$(openssl rand -hex 4)"
az mysql flexible-server create \
    --resource-group $RESOURCE_GROUP \
    --name $MYSQL_SERVER \
    --admin-user cebio_user \
    --admin-password "$DB_PASSWORD" \
    --sku-name Standard_B1ms \
    --tier Burstable \
    --storage-size 20 \
    --version 8.0.21 \
    --location $LOCATION \
    --public-access 0.0.0.0 \
    -o none

# Criar database
az mysql flexible-server db create \
    --resource-group $RESOURCE_GROUP \
    --server-name $MYSQL_SERVER \
    --database-name cebio_brasil \
    -o none

MYSQL_HOST=$(az mysql flexible-server show --resource-group $RESOURCE_GROUP --name $MYSQL_SERVER --query fullyQualifiedDomainName -o tsv)

echo "   MySQL Host: $MYSQL_HOST"

# Importar schema
echo "   Importando schema do banco..."
mysql -h $MYSQL_HOST -u cebio_user -p"$DB_PASSWORD" cebio_brasil < server/cebio_database_updated.sql 2>/dev/null || echo "   ⚠️  Importe o schema manualmente (ver README_DEPLOY.md)"

# ========================
# 4. Build e Push das imagens Docker
# ========================
echo "4️⃣  Construindo imagens Docker..."
az acr login --name $ACR_NAME

# Backend
echo "   Building backend..."
docker build -t $ACR_LOGIN_SERVER/cebio-backend:latest ./server
docker push $ACR_LOGIN_SERVER/cebio-backend:latest

# Frontend
echo "   Building frontend..."
docker build -t $ACR_LOGIN_SERVER/cebio-frontend:latest \
    --build-arg VITE_API_URL=/api .
docker push $ACR_LOGIN_SERVER/cebio-frontend:latest

# ========================
# 5. Criar Container Apps Environment
# ========================
echo "5️⃣  Criando Container Apps Environment..."
az containerapp env create \
    --name $ENVIRONMENT \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    -o none

# ========================
# 6. Deploy Backend
# ========================
echo "6️⃣  Deployando Backend..."
az containerapp create \
    --name cebio-backend \
    --resource-group $RESOURCE_GROUP \
    --environment $ENVIRONMENT \
    --image $ACR_LOGIN_SERVER/cebio-backend:latest \
    --registry-server $ACR_LOGIN_SERVER \
    --registry-username $ACR_NAME \
    --registry-password "$ACR_PASSWORD" \
    --target-port 8000 \
    --ingress external \
    --min-replicas 1 \
    --max-replicas 3 \
    --env-vars \
        "PORT=8000" \
        "DB_HOST=$MYSQL_HOST" \
        "DB_PORT=3306" \
        "DB_USER=cebio_user" \
        "DB_PASSWORD=$DB_PASSWORD" \
        "DB_NAME=cebio_brasil" \
        "JWT_SECRET=$JWT_SECRET" \
        "NODE_ENV=production" \
        "CORS_ORIGINS=*" \
    -o none

BACKEND_URL=$(az containerapp show --name cebio-backend --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv)

# ========================
# 7. Deploy Frontend
# ========================
echo "7️⃣  Deployando Frontend..."
az containerapp create \
    --name cebio-frontend \
    --resource-group $RESOURCE_GROUP \
    --environment $ENVIRONMENT \
    --image $ACR_LOGIN_SERVER/cebio-frontend:latest \
    --registry-server $ACR_LOGIN_SERVER \
    --registry-username $ACR_NAME \
    --registry-password "$ACR_PASSWORD" \
    --target-port 80 \
    --ingress external \
    --min-replicas 1 \
    --max-replicas 3 \
    -o none

FRONTEND_URL=$(az containerapp show --name cebio-frontend --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv)

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   ✅ Deploy concluído!                                   ║"
echo "║                                                          ║"
echo "║   🌐 Frontend: https://$FRONTEND_URL"
echo "║   📡 Backend:  https://$BACKEND_URL"
echo "║   🗄️  MySQL:    $MYSQL_HOST"
echo "║                                                          ║"
echo "║   ⚠️  IMPORTANTE:                                        ║"
echo "║   Atualize CORS_ORIGINS do backend com a URL do frontend ║"
echo "║   e rebuild o frontend com VITE_API_URL do backend       ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "📝 Salve estas informações!"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   ACR: $ACR_NAME"
echo "   MySQL Server: $MYSQL_SERVER"
