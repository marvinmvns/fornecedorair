#!/bin/bash

# Script para verificar todas as dependências do projeto

echo "🔍 Verificando dependências do FornecedorAir..."
echo "================================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

MISSING_DEPS=0

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check version
check_version() {
    local cmd=$1
    local min_version=$2
    local current_version=$($cmd --version 2>&1 | head -n1 | grep -oE '[0-9]+\.[0-9]+(\.[0-9]+)?' | head -n1)

    if [ -z "$current_version" ]; then
        echo -e "${RED}❌ Não foi possível determinar a versão${NC}"
        return 1
    fi

    echo -e "${GREEN}✅ Instalado (versão $current_version)${NC}"

    # Simple version comparison (good enough for major.minor)
    if [ "$(printf '%s\n' "$min_version" "$current_version" | sort -V | head -n1)" = "$min_version" ]; then
        return 0
    else
        echo -e "${YELLOW}⚠️  Versão recomendada: $min_version ou superior${NC}"
        return 0
    fi
}

echo ""
echo "📦 Verificando ferramentas essenciais:"
echo ""

# Node.js
echo -n "Node.js (recomendado: 18+): "
if command_exists node; then
    check_version node 18.0.0
else
    echo -e "${RED}❌ Não instalado${NC}"
    echo "   Instale em: https://nodejs.org/"
    MISSING_DEPS=$((MISSING_DEPS+1))
fi

# npm
echo -n "npm: "
if command_exists npm; then
    check_version npm 8.0.0
else
    echo -e "${RED}❌ Não instalado${NC}"
    MISSING_DEPS=$((MISSING_DEPS+1))
fi

# Docker
echo -n "Docker: "
if command_exists docker; then
    check_version docker 20.0.0
else
    echo -e "${RED}❌ Não instalado${NC}"
    echo "   Instale em: https://www.docker.com/"
    MISSING_DEPS=$((MISSING_DEPS+1))
fi

# Docker Compose
echo -n "Docker Compose: "
if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Instalado${NC}"
else
    echo -e "${RED}❌ Não instalado${NC}"
    echo "   Geralmente vem com Docker Desktop"
    MISSING_DEPS=$((MISSING_DEPS+1))
fi

# Git
echo -n "Git: "
if command_exists git; then
    check_version git 2.0.0
else
    echo -e "${RED}❌ Não instalado${NC}"
    MISSING_DEPS=$((MISSING_DEPS+1))
fi

echo ""
echo "🔧 Verificando ferramentas opcionais:"
echo ""

# Ollama
echo -n "Ollama (para LLM): "
if command_exists ollama; then
    echo -e "${GREEN}✅ Instalado${NC}"
else
    echo -e "${YELLOW}⚠️  Não instalado (opcional)${NC}"
    echo "   Instale em: https://ollama.com/"
fi

# tmux
echo -n "tmux (para scripts de dev): "
if command_exists tmux; then
    echo -e "${GREEN}✅ Instalado${NC}"
else
    echo -e "${YELLOW}⚠️  Não instalado (opcional)${NC}"
    echo "   Instale: sudo apt-get install tmux (Linux) ou brew install tmux (Mac)"
fi

# jq
echo -n "jq (para scripts de teste): "
if command_exists jq; then
    echo -e "${GREEN}✅ Instalado${NC}"
else
    echo -e "${YELLOW}⚠️  Não instalado (opcional)${NC}"
    echo "   Instale: sudo apt-get install jq (Linux) ou brew install jq (Mac)"
fi

echo ""
echo "📂 Verificando estrutura de diretórios:"
echo ""

# Check if in correct directory
if [ ! -f "package.json" ] && [ ! -d "backend" ]; then
    echo -e "${RED}❌ Execute este script a partir da raiz do projeto${NC}"
    exit 1
fi

# Check backend
if [ -d "backend" ]; then
    echo -e "backend/ ${GREEN}✅${NC}"

    # Check backend dependencies
    if [ -f "backend/package.json" ] && [ -d "backend/node_modules" ]; then
        echo -e "  node_modules ${GREEN}✅ Instalado${NC}"
    else
        echo -e "  node_modules ${YELLOW}⚠️  Execute: cd backend && npm install${NC}"
    fi
else
    echo -e "backend/ ${RED}❌ Não encontrado${NC}"
    MISSING_DEPS=$((MISSING_DEPS+1))
fi

# Check frontend
if [ -d "frontend" ]; then
    echo -e "frontend/ ${GREEN}✅${NC}"

    # Check frontend dependencies
    if [ -f "frontend/package.json" ] && [ -d "frontend/node_modules" ]; then
        echo -e "  node_modules ${GREEN}✅ Instalado${NC}"
    else
        echo -e "  node_modules ${YELLOW}⚠️  Execute: cd frontend && npm install${NC}"
    fi
else
    echo -e "frontend/ ${RED}❌ Não encontrado${NC}"
    MISSING_DEPS=$((MISSING_DEPS+1))
fi

# Check WhatsApp service
if [ -d "services/whatsapp" ]; then
    echo -e "services/whatsapp/ ${GREEN}✅${NC}"

    # Check service dependencies
    if [ -f "services/whatsapp/package.json" ] && [ -d "services/whatsapp/node_modules" ]; then
        echo -e "  node_modules ${GREEN}✅ Instalado${NC}"
    else
        echo -e "  node_modules ${YELLOW}⚠️  Execute: cd services/whatsapp && npm install${NC}"
    fi
else
    echo -e "services/whatsapp/ ${RED}❌ Não encontrado${NC}"
    MISSING_DEPS=$((MISSING_DEPS+1))
fi

echo ""
echo "🐳 Verificando containers Docker:"
echo ""

if command_exists docker; then
    # Check if Docker daemon is running
    if docker ps >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Docker daemon está rodando${NC}"

        # Check PostgreSQL container
        if docker ps | grep -q fornecedorair-db; then
            echo -e "PostgreSQL: ${GREEN}✅ Rodando${NC}"
        elif docker ps -a | grep -q fornecedorair-db; then
            echo -e "PostgreSQL: ${YELLOW}⚠️  Parado (Execute: docker-compose up -d postgres)${NC}"
        else
            echo -e "PostgreSQL: ${YELLOW}⚠️  Não criado (Execute: docker-compose up -d postgres)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Docker daemon não está rodando${NC}"
        echo "   Inicie o Docker Desktop ou execute: sudo systemctl start docker"
    fi
fi

echo ""
echo "🌍 Verificando variáveis de ambiente:"
echo ""

# Check .env files
if [ -f "backend/.env" ]; then
    echo -e "backend/.env ${GREEN}✅ Existe${NC}"
else
    echo -e "backend/.env ${YELLOW}⚠️  Crie a partir de .env.example${NC}"
    if [ -f "backend/.env.example" ]; then
        echo "   Execute: cp backend/.env.example backend/.env"
    fi
fi

if [ -f "services/whatsapp/.env" ]; then
    echo -e "services/whatsapp/.env ${GREEN}✅ Existe${NC}"
else
    echo -e "services/whatsapp/.env ${YELLOW}⚠️  Crie a partir de .env.example${NC}"
    if [ -f "services/whatsapp/.env.example" ]; then
        echo "   Execute: cp services/whatsapp/.env.example services/whatsapp/.env"
    fi
fi

echo ""
echo "================================================"

if [ $MISSING_DEPS -eq 0 ]; then
    echo -e "${GREEN}✅ Todas as dependências essenciais estão instaladas!${NC}"
    echo ""
    echo "Próximos passos:"
    echo "  1. Configure os arquivos .env (se necessário)"
    echo "  2. Execute: ./scripts/setup.sh (setup completo)"
    echo "  3. Ou execute: make dev (iniciar em modo desenvolvimento)"
else
    echo -e "${RED}❌ Faltam $MISSING_DEPS dependências essenciais${NC}"
    echo ""
    echo "Instale as dependências faltantes e execute este script novamente."
    exit 1
fi
