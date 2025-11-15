# FornecedorAir - Sistema de Cotação de Ar-Condicionado

Sistema completo de gestão de cotações de ar-condicionado para distribuidores, com integração WhatsApp e LLM.

## Arquitetura

- **Backend**: NestJS + TypeScript + PostgreSQL (Clean Architecture)
- **Frontend**: Angular 16+ (Template Bsinx)
- **Integrações**: WhatsApp (whatsapp-web.js) + Ollama LLM
- **Banco de Dados**: PostgreSQL com TypeORM

## Estrutura do Projeto

```
fornecedorair/
├── backend/               # API REST + Business Logic
│   ├── src/
│   │   ├── domain/       # Entidades e interfaces
│   │   ├── application/  # Use Cases
│   │   ├── infrastructure/ # Repositórios e Adapters
│   │   └── interface/    # Controllers e DTOs
│   └── migrations/       # Database migrations
├── frontend/             # Angular Dashboard
│   └── src/
│       ├── app/
│       │   ├── modules/  # Feature modules
│       │   └── shared/   # Componentes compartilhados
│       └── assets/       # Template Bsinx assets
├── services/
│   ├── whatsapp/        # Serviço WhatsApp (whatsapp-web.js)
│   └── llm/             # Adapter Ollama
└── docker/              # Docker configurations
```

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Ollama (para LLM local)
- Celular com WhatsApp para QR Code

## Instalação

### 1. Banco de Dados

```bash
# Iniciar PostgreSQL com Docker
docker-compose up -d postgres

# Ou configurar localmente
createdb fornecedorair
```

### 2. Backend

```bash
cd backend
npm install
npm run migration:run
npm run start:dev
```

API disponível em: http://localhost:3000

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Interface disponível em: http://localhost:4200

### 4. Serviço WhatsApp

```bash
cd services/whatsapp
npm install
npm start
```

Na primeira execução, escaneie o QR Code exibido no terminal.

### 5. Ollama (LLM)

```bash
# Instalar Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Baixar modelo
ollama pull llama2

# Iniciar servidor
ollama serve
```

## Fluxos Principais

### 1. Cotação via WhatsApp (Automática com LLM)

1. Instalador envia mensagem no WhatsApp
2. Sistema processa com LLM (Ollama) automaticamente
3. LLM extrai dados estruturados e cria cotação
4. Sistema pergunta e confirma informações via chat
5. Atendente visualiza pedido no portal
6. Atendente dispara cotações aos fornecedores
7. Sistema consolida respostas
8. LLM formula proposta personalizada
9. Sistema envia proposta ao instalador via WhatsApp

### 2. Cotação via API

1. Sistema parceiro envia POST /api/v1/quotations
2. Sistema cria pedido automaticamente
3. Fluxo segue igual ao WhatsApp

### 3. Gestão no Portal

1. Dashboard com KPIs e pedidos recentes
2. Visualização de pedidos por status
3. Comparativo de cotações de fornecedores
4. Configuração de margem de lucro
5. Envio de propostas personalizadas

## API Endpoints

### Cotações

- `POST /api/v1/quotations` - Criar cotação
- `GET /api/v1/quotations` - Listar cotações
- `GET /api/v1/quotations/:id` - Detalhe da cotação
- `POST /api/v1/quotations/:id/dispatch-suppliers` - Disparar para fornecedores
- `GET /api/v1/quotations/:id/supplier-quotes` - Cotações dos fornecedores

### Catálogo

- `GET /api/v1/catalog/air-conditioners` - Listar modelos
- `POST /api/v1/catalog/air-conditioners` - Criar modelo
- `PUT /api/v1/catalog/air-conditioners/:id` - Atualizar modelo

### Fornecedores

- `GET /api/v1/suppliers` - Listar fornecedores
- `POST /api/v1/suppliers` - Criar fornecedor

### WhatsApp

- `POST /api/v1/whatsapp/send` - Enviar mensagem
- `POST /api/v1/webhooks/whatsapp` - Receber mensagens

### LLM

- `POST /api/v1/internal/llm/parse-install-request` - Processar conversa

## Variáveis de Ambiente

Crie um arquivo `.env` em cada diretório:

### backend/.env

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=fornecedorair
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

WHATSAPP_SERVICE_URL=http://localhost:3001
OLLAMA_API_URL=http://localhost:11434

JWT_SECRET=your-secret-key
PORT=3000
```

### services/whatsapp/.env

```
PORT=3001
WEBHOOK_URL=http://localhost:3000/api/v1/webhooks/whatsapp
```

### frontend/src/environments/environment.ts

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1'
};
```

## Desenvolvimento

### Executar testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Migrations

```bash
cd backend

# Criar migration
npm run migration:create -- -n MigrationName

# Executar migrations
npm run migration:run

# Reverter migration
npm run migration:revert
```

## Tecnologias

- **Backend**: NestJS, TypeORM, PostgreSQL, class-validator
- **Frontend**: Angular 16, RxJS, Bootstrap 5 (Bsinx template)
- **WhatsApp**: whatsapp-web.js
- **LLM**: Ollama (llama2 ou similar)
- **Containerização**: Docker, docker-compose

## Recursos Principais

- ✅ Chat automático com LLM (sem interação manual)
- ✅ Integração WhatsApp bidirecional
- ✅ Gestão de catálogo de produtos
- ✅ Comparativo de cotações de múltiplos fornecedores
- ✅ Cálculo automático de margem de lucro
- ✅ Dashboard com KPIs e métricas
- ✅ APIs Mock para simulação de fornecedores
- ✅ Clean Architecture no backend
- ✅ UI moderna baseada em template profissional

## Licença

MIT
