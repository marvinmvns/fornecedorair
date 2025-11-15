# FornecedorAir - Sistema de Cotação de Ar-Condicionado

Sistema completo de gestão de cotações de ar-condicionado para distribuidores, com integração WhatsApp e LLM.

## Arquitetura

- **Backend**: NestJS + TypeScript + PostgreSQL (Clean Architecture)
- **Frontend**: Angular 16+ (Template Bsinx)
- **Integrações**: WhatsApp (whatsapp-web.js) + Ollama LLM
- **Banco de Dados**: PostgreSQL com TypeORM
- **Autenticação**: JWT com RBAC (4 níveis de permissão)
- **Multi-tenant**: Suporte completo para múltiplas empresas
- **Containerização**: Docker + Docker Compose para produção

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
- npm 8+
- Docker e Docker Compose
- Git
- Ollama (opcional, para LLM local)
- Celular com WhatsApp para QR Code

**Verificar dependências:**
```bash
./scripts/check-dependencies.sh
```

## Instalação Rápida

### Opção 1: Script Automatizado (Recomendado)

```bash
# 1. Verificar dependências
./scripts/check-dependencies.sh

# 2. Inicializar banco de dados com dados de desenvolvimento
./scripts/init-database.sh

# OU inicializar com dados mock completos (3 tenants, 60 cotações, etc.)
./scripts/init-database.sh mock

# 3. Iniciar serviços em desenvolvimento
cd backend && npm run start:dev &
cd frontend && npm start &
cd services/whatsapp && npm run dev &
```

### Opção 2: Instalação Manual

#### 1. Banco de Dados

```bash
# Iniciar PostgreSQL com Docker
docker-compose up -d postgres

# Aguardar container ficar pronto
docker ps | grep fornecedorair-db
```

#### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run migration:run
npm run start:dev
```

API disponível em: http://localhost:3000

#### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Interface disponível em: http://localhost:4200

#### 4. Serviço WhatsApp

```bash
cd services/whatsapp
npm install
cp .env.example .env
npm start
```

Na primeira execução, escaneie o QR Code exibido no terminal.

#### 5. Ollama (LLM) - Opcional

```bash
# Instalar Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Baixar modelo
ollama pull llama2

# Iniciar servidor
ollama serve
```

### Opção 3: Deploy com Docker (Produção)

```bash
# Build e iniciar todos os serviços
docker-compose -f docker-compose.prod.yml up -d

# Verificar status
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

Serviços disponíveis:
- Frontend: http://localhost (porta 80)
- Backend API: http://localhost:3000
- WhatsApp Service: http://localhost:3001

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

## Autenticação e Acesso

O sistema possui autenticação JWT com 4 níveis de permissão:

- **ADMIN**: Acesso total, gerenciamento de usuários e configurações
- **SALES_MANAGER**: Gerenciamento de cotações, fornecedores e relatórios
- **ATTENDANT**: Criar e gerenciar cotações, visualizar fornecedores
- **VIEW_ONLY**: Apenas visualização de dados

### Usuários Padrão (Modo Mock)

```bash
# Tenant: alpha
admin@alpha.com / password123 (ADMIN)
sales_manager@alpha.com / password123 (SALES_MANAGER)
attendant@alpha.com / password123 (ATTENDANT)
view_only@alpha.com / password123 (VIEW_ONLY)

# Tenants adicionais: beta, gamma
admin@beta.com / password123
admin@gamma.com / password123
```

Para mais detalhes, consulte [AUTH_GUIDE.md](AUTH_GUIDE.md)

## API Endpoints

### Autenticação

- `POST /api/v1/auth/login` - Login (retorna JWT)
- `POST /api/v1/auth/register` - Registrar novo usuário (ADMIN apenas)
- `GET /api/v1/auth/profile` - Perfil do usuário autenticado
- `POST /api/v1/auth/change-password` - Alterar senha
- `POST /api/v1/auth/reset-password` - Reset de senha

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

**Nota:** Todos os endpoints (exceto login e register) requerem Bearer Token JWT no header `Authorization: Bearer <token>`

## Variáveis de Ambiente

Crie um arquivo `.env` em cada diretório:

### backend/.env

```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=fornecedorair
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# Services
WHATSAPP_SERVICE_URL=http://localhost:3001
OLLAMA_API_URL=http://localhost:11434

# Security
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=7d

# Server
PORT=3000
NODE_ENV=development
```

### services/whatsapp/.env

```bash
PORT=3001
BACKEND_WEBHOOK_URL=http://localhost:3000/api/v1/webhooks/whatsapp
NODE_ENV=development
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

### Backend
- **Framework**: NestJS 10+
- **ORM**: TypeORM
- **Database**: PostgreSQL 14+
- **Authentication**: Passport.js + JWT
- **Validation**: class-validator, class-transformer
- **Security**: bcrypt, helmet

### Frontend
- **Framework**: Angular 16+
- **State Management**: RxJS
- **UI**: Bootstrap 5 (Bsinx template)
- **HTTP**: HttpClient com interceptors
- **Routing**: Angular Router com guards

### Services
- **WhatsApp**: whatsapp-web.js + Puppeteer
- **LLM**: Ollama (llama2, mistral, ou outros)

### DevOps
- **Containerização**: Docker, Docker Compose
- **CI/CD**: Scripts automatizados
- **Web Server**: Nginx (para frontend em produção)

## Recursos Principais

### v1.0.0 - Funcionalidades Base
- ✅ Chat automático com LLM (sem interação manual)
- ✅ Integração WhatsApp bidirecional
- ✅ Gestão de catálogo de produtos
- ✅ Comparativo de cotações de múltiplos fornecedores
- ✅ Cálculo automático de margem de lucro
- ✅ Dashboard com KPIs e métricas
- ✅ APIs Mock para simulação de fornecedores
- ✅ Clean Architecture no backend
- ✅ UI moderna baseada em template profissional

### v1.1.0 - Segurança e Multi-tenant
- ✅ Autenticação JWT com Passport.js
- ✅ RBAC com 4 níveis de permissão (ADMIN, SALES_MANAGER, ATTENDANT, VIEW_ONLY)
- ✅ Suporte multi-tenant com isolamento de dados
- ✅ Gerador de dados mock completo (3 tenants, 60 cotações)
- ✅ Docker images para produção (backend, frontend, whatsapp)
- ✅ Scripts de verificação e inicialização automatizados

### v2.0.0 - Recursos Avançados (Em Desenvolvimento)
- 🚧 SLA tracking e workflow timeline
- 🚧 Gerenciamento de anexos (fotos/PDFs via WhatsApp)
- 🚧 Motor de precificação com cenários (Econômico/Standard/Premium)
- 🚧 Agendamento de instalações
- 🚧 Sistema de notificações internas
- 🚧 Analytics e dashboards comerciais
- 🚧 WhatsApp aprimorado (fila, retry, multi-sessão)

Consulte [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) para roadmap completo.

## Scripts Utilitários

O projeto inclui vários scripts para facilitar o desenvolvimento:

```bash
# Verificar todas as dependências do sistema
./scripts/check-dependencies.sh

# Inicializar banco com dados básicos
./scripts/init-database.sh

# Inicializar banco com dados mock completos
./scripts/init-database.sh mock
```

## Documentação Adicional

- [QUICK_START.md](QUICK_START.md) - Guia rápido de início
- [AUTH_GUIDE.md](AUTH_GUIDE.md) - Documentação completa de autenticação
- [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) - Status de implementação e roadmap
- [TECHNICAL_SPEC.md](TECHNICAL_SPEC.md) - Especificação técnica detalhada
- [EXAMPLES.md](EXAMPLES.md) - Exemplos de uso da API
- [CHANGELOG.md](CHANGELOG.md) - Histórico de mudanças

## Estrutura de Dados Mock

Ao usar `./scripts/init-database.sh mock`, o sistema gera:

- **3 tenants** (alpha, beta, gamma)
- **12 usuários** (4 roles por tenant)
- **36 modelos** de ar-condicionado (12 por tenant)
- **15 fornecedores** (5 por tenant)
- **30 instaladores** (10 por tenant)
- **60 cotações** com itens, quotes e mensagens (20 por tenant)

Dados de teste:
- Email padrão: `{role}@{tenant}.com`
- Senha padrão: `password123`
- Tenants: `alpha`, `beta`, `gamma`

## Troubleshooting

### Erro de autenticação
```bash
# Verifique se o JWT_SECRET está configurado
cat backend/.env | grep JWT_SECRET

# Teste o endpoint de login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alpha.com","password":"password123"}'
```

### Banco de dados não conecta
```bash
# Verifique se o PostgreSQL está rodando
docker ps | grep fornecedorair-db

# Reinicie o container
docker-compose restart postgres

# Verifique os logs
docker-compose logs postgres
```

### WhatsApp desconectado
```bash
# Limpe a sessão e reconecte
cd services/whatsapp
rm -rf .wwebjs_auth .wwebjs_cache
npm run dev
# Escaneie o QR Code novamente
```

## Licença

MIT
