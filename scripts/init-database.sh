#!/bin/bash

# Script para inicializar o banco de dados com dados padrão

echo "🗄️  Inicializando banco de dados FornecedorAir..."
echo "================================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Execute este script a partir da raiz do projeto${NC}"
    exit 1
fi

# Parse command line arguments
MODE=${1:-"development"}  # development or mock
VERBOSE=${2:-"false"}

echo ""
echo "Modo: $MODE"
echo ""

# 1. Check if PostgreSQL is running
echo "1️⃣  Verificando PostgreSQL..."
if docker ps | grep -q fornecedorair-db; then
    echo -e "   ${GREEN}✅ PostgreSQL está rodando${NC}"
else
    echo -e "   ${YELLOW}⚠️  Iniciando PostgreSQL...${NC}"
    docker-compose up -d postgres

    echo "   Aguardando PostgreSQL ficar pronto..."
    sleep 10

    # Wait for healthy status
    for i in {1..30}; do
        if docker ps | grep fornecedorair-db | grep -q "healthy"; then
            echo -e "   ${GREEN}✅ PostgreSQL está pronto${NC}"
            break
        fi
        echo "   Aguardando... ($i/30)"
        sleep 2
    done
fi

# 2. Install backend dependencies if needed
echo ""
echo "2️⃣  Verificando dependências do backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "   Instalando dependências..."
    npm install
else
    echo -e "   ${GREEN}✅ Dependências já instaladas${NC}"
fi

# 3. Create .env if doesn't exist
echo ""
echo "3️⃣  Verificando configuração..."
if [ ! -f ".env" ]; then
    echo "   Criando .env a partir do .env.example..."
    cp .env.example .env
    echo -e "   ${GREEN}✅ Arquivo .env criado${NC}"
else
    echo -e "   ${GREEN}✅ Arquivo .env existe${NC}"
fi

# 4. Drop and recreate database (WARNING: This deletes all data)
echo ""
echo "4️⃣  Resetando banco de dados..."
echo -e "   ${YELLOW}⚠️  ATENÇÃO: Isso irá deletar todos os dados existentes!${NC}"

if [ "$MODE" != "force" ]; then
    read -p "   Continuar? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "   Operação cancelada."
        exit 0
    fi
fi

# Drop all tables
echo "   Revertendo todas migrations..."
npm run migration:revert 2>/dev/null || true

# 5. Run migrations
echo ""
echo "5️⃣  Executando migrations..."
npm run migration:run

if [ $? -eq 0 ]; then
    echo -e "   ${GREEN}✅ Migrations executadas com sucesso${NC}"
else
    echo -e "   ${RED}❌ Erro ao executar migrations${NC}"
    exit 1
fi

# 6. Seed database
echo ""
if [ "$MODE" = "mock" ]; then
    echo "6️⃣  Gerando dados MOCK completos..."
    echo "   Isso pode levar alguns minutos..."
    npx ts-node src/infrastructure/database/seeds/mock-data-generator.ts

    if [ $? -eq 0 ]; then
        echo -e "   ${GREEN}✅ Dados mock gerados com sucesso${NC}"
    else
        echo -e "   ${RED}❌ Erro ao gerar dados mock${NC}"
        exit 1
    fi
else
    echo "6️⃣  Gerando dados básicos de desenvolvimento..."
    npx ts-node src/infrastructure/database/seeds/initial-data.seed.ts

    if [ $? -eq 0 ]; then
        echo -e "   ${GREEN}✅ Dados básicos gerados com sucesso${NC}"
    else
        echo -e "   ${RED}❌ Erro ao gerar dados básicos${NC}"
        exit 1
    fi
fi

cd ..

echo ""
echo "================================================"
echo -e "${GREEN}✅ Banco de dados inicializado com sucesso!${NC}"
echo ""

if [ "$MODE" = "mock" ]; then
    echo "📊 Dados gerados:"
    echo "   - 3 tenants (alpha, beta, gamma)"
    echo "   - 12 usuários (4 por tenant, cada role)"
    echo "   - 36 modelos de ar-condicionado"
    echo "   - 15 fornecedores"
    echo "   - 30 instaladores"
    echo "   - 60 cotações com itens e mensagens"
    echo ""
    echo "🔐 Usuários de teste:"
    echo "   admin@alpha.com / password123 (ADMIN)"
    echo "   sales_manager@alpha.com / password123 (SALES_MANAGER)"
    echo "   attendant@alpha.com / password123 (ATTENDANT)"
    echo "   view_only@alpha.com / password123 (VIEW_ONLY)"
    echo ""
    echo "   Tenants: alpha, beta, gamma"
else
    echo "📊 Dados básicos gerados:"
    echo "   - 10 modelos de ar-condicionado"
    echo "   - 4 fornecedores"
    echo "   - 4 configurações de SLA padrão"
    echo ""
    echo "⚠️  Para gerar dados mock completos, execute:"
    echo "   ./scripts/init-database.sh mock"
fi

echo ""
echo "📋 Funcionalidades Avançadas Disponíveis:"
echo "   ✅ SLA Tracking e Workflow Timeline"
echo "   ✅ Gerenciamento de Anexos (fotos/PDFs)"
echo "   ✅ Motor de Precificação (Econômico/Standard/Premium)"
echo "   ✅ Agendamento de Instalações"
echo "   ✅ Sistema de Notificações Internas"
echo "   ✅ WhatsApp Aprimorado (fila, retry, multi-sessão)"
echo ""
echo "📖 Veja ADVANCED_FEATURES.md para mais detalhes"

echo ""
echo "🚀 Próximos passos:"
echo "   1. Inicie o backend: cd backend && npm run start:dev"
echo "   2. Inicie o frontend: cd frontend && npm start"
echo "   3. Acesse: http://localhost:4200"
