# 🚀 Deploy CEBIO Brasil na Azure

## Pré-requisitos

1. **Azure CLI** instalado: [Instalar Azure CLI](https://learn.microsoft.com/pt-br/cli/azure/install-azure-cli)
2. **Docker** instalado: [Instalar Docker](https://docs.docker.com/get-docker/)
3. **Conta Azure** com assinatura ativa

## Opção 1: Deploy Automático (Recomendado)

```bash
# 1. Faça login na Azure
az login

# 2. Rode o script de deploy
chmod +x deploy-azure.sh
./deploy-azure.sh
```

O script cria tudo automaticamente e te dá uma **URL temporária gratuita** (`.azurecontainerapps.io`).

---

## Opção 2: Deploy Manual (VM/VPS na Azure)

### 1. Criar a VM

```bash
az vm create \
  --resource-group cebio-rg \
  --name cebio-vm \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard
```

### 2. Abrir portas

```bash
az vm open-port --resource-group cebio-rg --name cebio-vm --port 80 --priority 1001
az vm open-port --resource-group cebio-rg --name cebio-vm --port 443 --priority 1002
az vm open-port --resource-group cebio-rg --name cebio-vm --port 8000 --priority 1003
```

### 3. Conectar na VM

```bash
# Pegar IP público
az vm show --resource-group cebio-rg --name cebio-vm -d --query publicIps -o tsv

# Conectar via SSH
ssh azureuser@<IP_PUBLICO>
```

### 4. Na VM, instalar Docker e clonar projeto

```bash
# Instalar Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Clonar o projeto (ou enviar via scp)
git clone <URL_DO_SEU_REPO> cebio
cd cebio

# Configurar ambiente
cp .env.production .env
nano .env  # Ajustar senhas e domínio

# Rodar deploy
chmod +x deploy.sh
./deploy.sh
```

### 5. Acessar

A URL temporária será: `http://<IP_PUBLICO>`

---

## Opção 3: Deploy com Docker Compose na VM (Mais Simples)

Se você já tem uma VM Azure, basta enviar os arquivos e rodar:

```bash
# No seu computador local - enviar projeto para VM
scp -r ./* azureuser@<IP_VM>:~/cebio/

# Na VM
cd ~/cebio
cp .env.production .env
nano .env
chmod +x deploy.sh
./deploy.sh
```

---

## Importar o Banco de Dados

Após o deploy, importe o schema:

```bash
# Se usando docker-compose (VM)
docker exec -i cebio-db mysql -u cebio_user -pcebio_pass cebio_brasil < server/cebio_database_updated.sql

# Se usando Azure MySQL
mysql -h <MYSQL_HOST>.mysql.database.azure.com -u cebio_user -p cebio_brasil < server/cebio_database_updated.sql
```

## Seed de dados iniciais (admin)

```bash
# Na VM com docker-compose
docker exec cebio-backend npx ts-node src/database/seed.ts
```

---

## Custos Estimados (Azure)

| Recurso | Estimativa/mês |
|---------|---------------|
| Container Apps (2 apps, min replicas) | ~$10-15 |
| MySQL Flexible (B1ms) | ~$13 |
| Container Registry (Basic) | ~$5 |
| **Total Container Apps** | **~$28-33** |
| | |
| VM Standard_B2s (alternativa) | ~$30 |
| **Total VM (tudo junto)** | **~$30** |

💡 **Dica**: Para URL temporária gratuita, use Container Apps com o **free tier** (180.000 vCPU-s/mês grátis).

---

## Comandos Úteis

```bash
# Ver logs do backend
docker compose logs -f backend

# Reiniciar serviços
docker compose restart

# Parar tudo
docker compose down

# Atualizar após mudanças no código
docker compose up -d --build

# Backup do banco
docker exec cebio-db mysqldump -u root -p cebio_brasil > backup_$(date +%Y%m%d).sql
```
