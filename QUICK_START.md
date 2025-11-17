# 🚀 Guia de Início Rápido - FornecedorAir

Este guia vai te ajudar a rodar o sistema completo em minutos.

## Pré-requisitos

Certifique-se de ter instalado:

- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm 8+**
- **Docker e Docker Compose** ([Download](https://www.docker.com/))
- **Git**
- **Ollama** (opcional, para LLM): `curl -fsSL https://ollama.com/install.sh | sh`

### Verificar Dependências

Antes de começar, execute o script de verificação:

```bash
chmod +x scripts/check-dependencies.sh
./scripts/check-dependencies.sh
```

Este script verifica:
- ✅ Node.js, npm, Docker, Git
- ✅ Estrutura de diretórios
- ✅ Containers Docker
- ✅ Arquivos .env
- ✅ node_modules instalados

## Setup Rápido (Recomendado)

### Opção 1: Usando Scripts Automatizados

```bash
# 1. Verificar dependências
./scripts/check-dependencies.sh

# 2. Inicializar banco de dados com dados mock completos
chmod +x scripts/init-database.sh
./scripts/init-database.sh mock

# Este script vai:
# ✅ Iniciar PostgreSQL com Docker
# ✅ Instalar dependências do backend
# ✅ Criar arquivo .env
# ✅ Executar migrations do banco
# ✅ Popular com dados completos (3 tenants, 60 cotações, 30 instaladores)
# ✅ Criar tabelas de funcionalidades avançadas (SLA, anexos, precificação, etc.)
```

**Dados gerados no modo mock:**
- 3 tenants (alpha, beta, gamma)
- 12 usuários (4 roles por tenant)
- 36 modelos de ar-condicionado
- 15 fornecedores
- 30 instaladores
- 60 cotações com itens e mensagens

### Opção 2: Setup Básico (Apenas Dados Essenciais)

```bash
# Inicializar com dados mínimos
./scripts/init-database.sh

# Isso cria apenas:
# - 10 modelos de ar-condicionado
# - 4 fornecedores
# - 4 configurações de SLA padrão
# - Tabelas de funcionalidades avançadas
```

## Iniciar a Aplicação

### Opção 1: Terminais Separados (Recomendado para desenvolvimento)

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Serviço WhatsApp
cd services/whatsapp
npm run dev

# Terminal 3 - Frontend
cd frontend
npm start

# Terminal 4 - Ollama (opcional)
ollama serve
ollama pull llama2
```

### Opção 2: Usando tmux/screen (Linux/Mac)

```bash
# Criar sessões separadas
tmux new -s backend -d "cd backend && npm run start:dev"
tmux new -s whatsapp -d "cd services/whatsapp && npm run dev"
tmux new -s frontend -d "cd frontend && npm start"

# Ver logs de uma sessão
tmux attach -t backend
# Pressione Ctrl+B, depois D para desconectar
```

## Acessar o Sistema

Após iniciar todos os serviços:

### Frontend (Interface Web)
- **URL**: http://localhost:4200
- **Login**: Use as credenciais abaixo
- **Navegação**:
  - Dashboard: Visão geral e KPIs
  - Cotações: Lista e detalhes de cotações
  - Catálogo: Modelos de ar-condicionado disponíveis
  - Fornecedores: Lista de fornecedores cadastrados

### Credenciais de Acesso (Modo Mock)

```bash
# Tenant Alpha
Email: admin@alpha.com
Senha: password123
Role: ADMIN (acesso total)

Email: sales_manager@alpha.com
Senha: password123
Role: SALES_MANAGER (gerenciar cotações e fornecedores)

Email: attendant@alpha.com
Senha: password123
Role: ATTENDANT (criar e gerenciar cotações)

Email: view_only@alpha.com
Senha: password123
Role: VIEW_ONLY (apenas visualizar)

# Tenants Beta e Gamma
admin@beta.com / password123
admin@gamma.com / password123
```

### Backend API
- **URL**: http://localhost:3010/api/v1
- **Documentação Swagger**: http://localhost:3010/api/docs
- **Autenticação**: Todos os endpoints (exceto /auth/login) requerem JWT Bearer Token

### Banco de Dados (pgAdmin)
- **URL**: http://localhost:5050
- **Email**: admin@fornecedorair.com
- **Senha**: admin

## Testar o Fluxo Completo

### 1. Fazer Login na Aplicação

```bash
# 1. Acesse http://localhost:4200
# 2. Faça login com uma das credenciais acima
# 3. Você será redirecionado para o Dashboard
```

**Teste da API (curl):**
```bash
# Fazer login e obter token
curl -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alpha.com","password":"password123"}'

# Resposta:
# {
#   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {...}
# }

# Usar o token em requisições
TOKEN="seu-token-aqui"
curl -X GET http://localhost:3010/api/v1/quotations \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Conectar WhatsApp (Primeira vez)

```bash
# No terminal do WhatsApp service, você verá um QR Code
# Escaneie com seu WhatsApp (WhatsApp > Configurações > Aparelhos conectados)
```

### 3. Enviar mensagem de teste

Envie uma mensagem para o número conectado do WhatsApp:

```
Preciso de 2 aparelhos de ar-condicionado de 18.000 BTUs
para um salão comercial de 40m² em São Paulo, SP.
Voltagem 220V. Pode ser da marca Daikin ou LG.
```

### 4. Acompanhar no Portal

1. Acesse http://localhost:4200
2. Faça login (admin@alpha.com / password123)
3. Vá em **Cotações**
4. Você verá a nova cotação criada automaticamente pelo LLM
5. Clique em **Detalhes**
6. Selecione fornecedores e clique em **Disparar Cotações**
7. Aguarde alguns segundos (mock irá responder automaticamente)
8. Veja o **Comparativo de Cotações**
9. Selecione a melhor cotação
10. Ajuste a margem de lucro
11. Edite a mensagem da proposta
12. Clique em **Enviar Proposta via WhatsApp**

### 5. Verificar mensagem no WhatsApp

O instalador receberá a proposta formatada no WhatsApp!

## Dados Pré-Cadastrados

### Modo Development (./scripts/init-database.sh)

**Catálogo de Ar-Condicionado (10 modelos):**
- Daikin Advance Inverter 9K, 24K
- LG Dual Inverter 9K
- Samsung WindFree 12K
- Midea Eco 12K
- Fujitsu Premium 18K
- Elgin Eco Power 18K
- Consul Janela 7.5K
- Springer Janela 10K
- LG Cassete 24K

**Fornecedores (4 fornecedores):**
- Distribuidora Clima Frio Ltda
- MegaAr Distribuidora
- TechClima Supply
- Ar Express HVAC

### Modo Mock (./scripts/init-database.sh mock)

**Tenants (3):**
- Alpha (slug: alpha)
- Beta (slug: beta)
- Gamma (slug: gamma)

**Usuários (12 - 4 por tenant):**
- Cada tenant tem: ADMIN, SALES_MANAGER, ATTENDANT, VIEW_ONLY
- Padrão de email: `{role}@{tenant}.com`
- Senha: `password123`

**Modelos (36 - 12 por tenant):**
- Daikin, LG, Samsung, Midea, Fujitsu, Elgin, Consul, Springer

**Fornecedores (15 - 5 por tenant):**
- 5 distribuidoras diferentes por tenant

**Instaladores (30 - 10 por tenant):**
- Distribuídos em 6 cidades diferentes
- Com números de WhatsApp simulados

**Cotações (60 - 20 por tenant):**
- Status variados (pending, quoted, approved, etc.)
- Com itens, quotes de fornecedores e mensagens de chat
- Histórico realista de conversação

## Estrutura de Diretórios

```
fornecedorair/
├── backend/              # API NestJS
│   ├── src/
│   │   ├── domain/      # Entidades e interfaces
│   │   ├── application/ # Use Cases e Services
│   │   ├── infrastructure/ # Repositórios e Adapters
│   │   └── interface/   # Controllers e DTOs
│   └── migrations/      # Migrations do banco
├── frontend/            # Angular 16
│   └── src/app/
│       ├── modules/     # Features (dashboard, quotations, etc)
│       └── core/        # Services globais
├── services/
│   └── whatsapp/       # Serviço WhatsApp (whatsapp-web.js)
└── docker-compose.yml  # PostgreSQL + pgAdmin
```

## Comandos Úteis

### Backend

```bash
cd backend

# Desenvolvimento
npm run start:dev

# Criar migration
npm run migration:create -- -n MigrationName

# Rodar migrations
npm run migration:run

# Popular banco com dados básicos
npx ts-node src/infrastructure/database/seeds/initial-data.seed.ts

# Popular banco com dados mock completos
npx ts-node src/infrastructure/database/seeds/mock-data-generator.ts
```

### Scripts Utilitários

```bash
# Verificar todas as dependências
./scripts/check-dependencies.sh

# Resetar e popular banco (modo desenvolvimento)
./scripts/init-database.sh

# Resetar e popular banco (modo mock completo)
./scripts/init-database.sh mock
```

### Frontend

```bash
cd frontend

# Desenvolvimento
npm start

# Build de produção
npm run build
```

### WhatsApp Service

```bash
cd services/whatsapp

# Desenvolvimento
npm run dev

# Limpar sessão (se precisar reconectar)
rm -rf .wwebjs_auth
```

### Docker

```bash
# Iniciar apenas PostgreSQL
docker-compose up -d postgres

# Ver logs
docker-compose logs -f postgres

# Parar tudo
docker-compose down
```

## Troubleshooting

### Erro de autenticação / Token inválido

```bash
# Verifique se o JWT_SECRET está configurado
cat backend/.env | grep JWT_SECRET

# Faça login novamente para obter novo token
curl -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alpha.com","password":"password123"}'
```

### Erro ao conectar no PostgreSQL

```bash
# Verifique se o container está rodando
docker ps | grep fornecedorair-db

# Reinicie o PostgreSQL
docker-compose restart postgres

# Verifique os logs
docker-compose logs postgres
```

### WhatsApp não conecta

```bash
# Limpe a sessão e tente novamente
cd services/whatsapp
rm -rf .wwebjs_auth .wwebjs_cache
npm run dev
# Escaneie o QR Code novamente
```

### Frontend não carrega dados

```bash
# Verifique se o backend está rodando
curl http://localhost:3010/api/v1/catalog/air-conditioners

# Você deve receber erro 401 (Unauthorized) se não estiver autenticado
# Isso é esperado! Faça login primeiro

# Verifique o console do navegador (F12) para erros de CORS ou autenticação
```

### Banco de dados vazio / Sem dados

```bash
# Execute o script de inicialização novamente
./scripts/init-database.sh mock

# Ou popule manualmente
cd backend
npx ts-node src/infrastructure/database/seeds/mock-data-generator.ts
```

### Ollama não responde

```bash
# Verifique se o Ollama está rodando
curl http://localhost:11434/api/version

# Inicie o Ollama
ollama serve

# Baixe o modelo (se necessário)
ollama pull llama2
```

### Dependências faltando

```bash
# Execute o script de verificação
./scripts/check-dependencies.sh

# Instale as dependências indicadas
```

## Deploy em Produção

### Usando Docker Compose

```bash
# 1. Configure as variáveis de ambiente
cp backend/.env.example backend/.env
cp services/whatsapp/.env.example services/whatsapp/.env

# IMPORTANTE: Altere o JWT_SECRET em backend/.env para produção!

# 2. Build e iniciar todos os serviços
docker-compose -f docker-compose.prod.yml up -d

# 3. Verificar status
docker-compose -f docker-compose.prod.yml ps

# 4. Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# 5. Parar todos os serviços
docker-compose -f docker-compose.prod.yml down
```

Serviços em produção:
- Frontend: http://localhost (porta 80)
- Backend API: http://localhost:3010
- WhatsApp: http://localhost:3001
- PostgreSQL: porta 5432 (apenas rede interna)

## Próximos Passos

- 📚 Leia o [README.md](README.md) completo
- 🚀 Explore as [Funcionalidades Avançadas](ADVANCED_FEATURES.md) (SLA, Anexos, Precificação, etc.)
- 🔐 Consulte o [AUTH_GUIDE.md](AUTH_GUIDE.md) para detalhes de autenticação
- 📋 Veja o [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) para roadmap
- 🔧 Customize o template da proposta em `backend/src/infrastructure/adapters/ollama.adapter.ts`
- 🎨 Ajuste as cores e tema do frontend em `frontend/src/styles.scss`
- 📊 Adicione mais modelos de ar-condicionado no catálogo
- 🏢 Cadastre fornecedores reais
- 👥 Crie usuários adicionais via API `/api/v1/auth/register`

## Suporte

Para problemas ou dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação da API em http://localhost:3010/api/docs
- Verifique os logs nos terminais de cada serviço

---

**Pronto!** Você já tem um sistema completo de cotação de ar-condicionado com IA e WhatsApp funcionando! 🎉
