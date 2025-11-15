# 🚀 Guia de Início Rápido - FornecedorAir

Este guia vai te ajudar a rodar o sistema completo em minutos.

## Pré-requisitos

Certifique-se de ter instalado:

- **Node.js 18+** ([Download](https://nodejs.org/))
- **Docker** ([Download](https://www.docker.com/))
- **Ollama** (opcional, para LLM): `curl -fsSL https://ollama.com/install.sh | sh`

## Setup Automático (Recomendado)

```bash
# 1. Clone o repositório (se ainda não fez)
cd fornecedorair

# 2. Execute o script de setup
chmod +x scripts/setup.sh
./scripts/setup.sh
```

Este script vai:
- ✅ Iniciar PostgreSQL com Docker
- ✅ Instalar dependências do backend, frontend e WhatsApp service
- ✅ Criar arquivos .env
- ✅ Executar migrations do banco
- ✅ Popular o banco com dados iniciais (catálogo + fornecedores)

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
- **Navegação**:
  - Dashboard: Visão geral e KPIs
  - Cotações: Lista e detalhes de cotações
  - Catálogo: Modelos de ar-condicionado disponíveis
  - Fornecedores: Lista de fornecedores cadastrados

### Backend API
- **URL**: http://localhost:3000/api/v1
- **Documentação Swagger**: http://localhost:3000/api/docs

### Banco de Dados (pgAdmin)
- **URL**: http://localhost:5050
- **Email**: admin@fornecedorair.com
- **Senha**: admin

## Testar o Fluxo Completo

### 1. Conectar WhatsApp (Primeira vez)

```bash
# No terminal do WhatsApp service, você verá um QR Code
# Escaneie com seu WhatsApp (WhatsApp > Configurações > Aparelhos conectados)
```

### 2. Enviar mensagem de teste

Envie uma mensagem para o número conectado do WhatsApp:

```
Preciso de 2 aparelhos de ar-condicionado de 18.000 BTUs
para um salão comercial de 40m² em São Paulo, SP.
Voltagem 220V. Pode ser da marca Daikin ou LG.
```

### 3. Acompanhar no Portal

1. Acesse http://localhost:4200
2. Vá em **Cotações**
3. Você verá a nova cotação criada automaticamente pelo LLM
4. Clique em **Detalhes**
5. Selecione fornecedores e clique em **Disparar Cotações**
6. Aguarde alguns segundos (mock irá responder automaticamente)
7. Veja o **Comparativo de Cotações**
8. Selecione a melhor cotação
9. Ajuste a margem de lucro
10. Edite a mensagem da proposta
11. Clique em **Enviar Proposta via WhatsApp**

### 4. Verificar mensagem no WhatsApp

O instalador receberá a proposta formatada no WhatsApp!

## Dados Pré-Cadastrados

O sistema já vem com:

### Catálogo de Ar-Condicionado (10 modelos)
- Daikin Advance Inverter 9K, 24K
- LG Dual Inverter 9K
- Samsung WindFree 12K
- Midea Eco 12K
- Fujitsu Premium 18K
- Elgin Eco Power 18K
- Consul Janela 7.5K
- Springer Janela 10K
- LG Cassete 24K

### Fornecedores (4 fornecedores)
- Distribuidora Clima Frio Ltda
- MegaAr Distribuidora
- TechClima Supply
- Ar Express HVAC

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

# Popular banco com dados
npx ts-node src/infrastructure/database/seeds/initial-data.seed.ts
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

### Erro ao conectar no PostgreSQL

```bash
# Verifique se o container está rodando
docker ps

# Reinicie o PostgreSQL
docker-compose restart postgres
```

### WhatsApp não conecta

```bash
# Limpe a sessão e tente novamente
cd services/whatsapp
rm -rf .wwebjs_auth .wwebjs_cache
npm run dev
```

### Frontend não carrega dados

```bash
# Verifique se o backend está rodando
curl http://localhost:3000/api/v1/catalog/air-conditioners

# Verifique o console do navegador (F12)
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

## Próximos Passos

- 📚 Leia o [README.md](README.md) completo
- 🔧 Customize o template da proposta em `backend/src/infrastructure/adapters/ollama.adapter.ts`
- 🎨 Ajuste as cores e tema do frontend em `frontend/src/styles.scss`
- 📊 Adicione mais modelos de ar-condicionado no catálogo
- 🏢 Cadastre fornecedores reais

## Suporte

Para problemas ou dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação da API em http://localhost:3000/api/docs
- Verifique os logs nos terminais de cada serviço

---

**Pronto!** Você já tem um sistema completo de cotação de ar-condicionado com IA e WhatsApp funcionando! 🎉
