#!/bin/bash

echo "🚀 FornecedorAir - Setup Script"
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}1. Setting up PostgreSQL with Docker...${NC}"
docker-compose up -d postgres
sleep 5

echo -e "${YELLOW}2. Installing backend dependencies...${NC}"
cd backend
npm install

echo -e "${YELLOW}3. Creating .env file...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ .env created${NC}"
else
    echo -e "${YELLOW}⚠️  .env already exists${NC}"
fi

echo -e "${YELLOW}4. Running database migrations...${NC}"
npm run migration:run || true

echo -e "${YELLOW}5. Seeding database...${NC}"
npx ts-node src/infrastructure/database/seeds/initial-data.seed.ts

cd ..

echo -e "${YELLOW}6. Installing WhatsApp service dependencies...${NC}"
cd services/whatsapp
npm install

echo -e "${YELLOW}7. Creating WhatsApp .env file...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ .env created${NC}"
else
    echo -e "${YELLOW}⚠️  .env already exists${NC}"
fi

cd ../..

echo -e "${YELLOW}8. Installing frontend dependencies...${NC}"
cd frontend
npm install

cd ..

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ Setup completed!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "To start the application:"
echo "  1. Terminal 1: cd backend && npm run start:dev"
echo "  2. Terminal 2: cd services/whatsapp && npm run dev"
echo "  3. Terminal 3: cd frontend && npm start"
echo "  4. Terminal 4: ollama serve (if not running)"
echo ""
echo "Access the application at:"
echo "  - Frontend: http://localhost:4200"
echo "  - Backend API: http://localhost:3010/api/v1"
echo "  - API Docs: http://localhost:3010/api/docs"
