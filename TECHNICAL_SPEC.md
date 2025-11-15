# Especificação Técnica - FornecedorAir

## Visão Geral do Sistema

O FornecedorAir é um sistema completo de gestão de cotações de ar-condicionado que integra:
- **Chat automático via WhatsApp** usando LLM (Ollama)
- **Backend RESTful** com Clean Architecture (NestJS + TypeScript)
- **Frontend moderno** em Angular 16
- **Automação de cotações** com fornecedores

## Arquitetura

### Padrões e Princípios

- **Clean Architecture** no backend (Domain → Application → Infrastructure → Interface)
- **MVC** no frontend (Components, Services, Models)
- **SOLID** principles
- **Separation of Concerns**
- **Dependency Injection**

### Tecnologias Principais

#### Backend
- **Framework**: NestJS 10+
- **Linguagem**: TypeScript 5.1+
- **ORM**: TypeORM 0.3+
- **Banco de Dados**: PostgreSQL 14+
- **Validação**: class-validator, class-transformer
- **Documentação**: Swagger/OpenAPI

#### Frontend
- **Framework**: Angular 16+
- **UI**: Bootstrap 5, inspirado em template Bsinx
- **HTTP**: HttpClient (RxJS)
- **Routing**: Angular Router (lazy loading)

#### Integrações
- **WhatsApp**: whatsapp-web.js (sessão local via Puppeteer)
- **LLM**: Ollama (API HTTP, modelo llama2)

## Fluxo Detalhado do Sistema

### 1. Recepção de Mensagem WhatsApp

```
Instalador (WhatsApp)
    ↓
WhatsApp Service (whatsapp-web.js)
    ↓ POST /api/v1/webhooks/whatsapp
Backend (WebhooksController)
    ↓
QuotationsService.handleWhatsappMessage()
    ↓
[Salva ChatMessage com direction=INBOUND]
    ↓
[Busca ou cria Installer]
    ↓
[Recupera histórico de conversas]
    ↓
OllamaAdapter.parseInstallRequest()
    ↓
[LLM extrai dados estruturados]
    ↓
Se confidence < 0.7 ou faltam dados:
    OllamaAdapter.generateFollowUpQuestion()
    → Envia pergunta ao instalador
    → FIM (aguarda resposta)

Se confidence >= 0.7 e dados completos:
    CatalogService.findRecommendedByArea()
    → Cria QuotationRequest
    → Cria QuotationItems
    → Envia confirmação ao instalador
    → Status: OPEN
```

### 2. Atendente Visualiza e Dispara Cotações

```
Atendente (Frontend)
    ↓ GET /api/v1/quotations
[Lista cotações abertas]
    ↓ Seleciona cotação
    ↓ GET /api/v1/quotations/:id
[Carrega detalhes completos]
    ↓ GET /api/v1/suppliers
[Carrega lista de fornecedores]
    ↓ Seleciona fornecedores (checkboxes)
    ↓ Clica "Disparar Cotações"
    ↓ POST /api/v1/quotations/:id/dispatch-suppliers
QuotationsService.dispatchToSuppliers()
    ↓
[Para cada fornecedor selecionado:]
    Cria SupplierQuote (status=PENDING)
    mockSupplierResponse() → simula resposta após 2-5s
    → Atualiza SupplierQuote (status=RECEIVED)
    ↓
[Atualiza QuotationRequest: status=WAITING_SUPPLIERS]
    ↓
[Após todas respostas: status=RECEIVED_SUPPLIERS]
```

### 3. Criação e Envio de Proposta

```
Atendente (Frontend)
    ↓ GET /api/v1/quotations/:id/supplier-quotes
[Carrega comparativo de cotações]
    ↓
[Exibe cards de cada fornecedor com:]
    - Preço total e unitário
    - Prazo de entrega
    - Estoque disponível
    - Condições de pagamento
    - Garantia
    ↓
[Atendente seleciona melhor cotação]
    ↓
[Ajusta margem de lucro (%)]
    ↓
[Sistema calcula:]
    grossCost = supplierQuote.totalPrice
    marginValue = grossCost * (marginPercent / 100)
    finalPrice = grossCost + marginValue
    ↓
OllamaAdapter.generateProposalMessage()
    → Gera mensagem amigável com dados da proposta
    ↓
[Atendente pode editar mensagem]
    ↓ Clica "Enviar Proposta via WhatsApp"
    ↓ POST /api/v1/orders
OrdersService.create()
    → Cria Order
    → Marca SupplierQuote como SELECTED
    ↓ POST /api/v1/orders/:id/send-to-installer
OrdersService.sendToInstaller()
    → WhatsappAdapter.sendMessage()
    → Atualiza Order: status=SENT_TO_INSTALLER
    → Atualiza QuotationRequest: status=PROPOSAL_SENT
    ↓
Instalador recebe proposta no WhatsApp!
```

## Modelo de Dados

### Entidades Principais

#### Installer (Instalador)
- Representa o cliente que solicita cotação
- Identificado por `whatsappNumber` (único)
- Relacionamentos: `1:N` com QuotationRequest

#### QuotationRequest (Pedido de Cotação)
- Núcleo do sistema
- Contém dados estruturados extraídos pelo LLM
- Estados: OPEN → WAITING_SUPPLIERS → RECEIVED_SUPPLIERS → PROPOSAL_SENT → CLOSED
- Relacionamentos:
  - `N:1` com Installer
  - `1:N` com QuotationItem
  - `1:N` com SupplierQuote
  - `1:N` com Order

#### QuotationItem
- Itens de produto dentro de uma cotação
- Relacionamentos:
  - `N:1` com QuotationRequest
  - `N:1` com AirConditionerModel

#### AirConditionerModel (Modelo de AC)
- Catálogo de produtos disponíveis
- Campos técnicos: BTU, tipo, voltagem, eficiência energética, etc.
- Usado para recomendações automáticas por área

#### Supplier (Fornecedor)
- Fornecedores que respondem cotações
- Podem ter integração via WhatsApp ou API
- Relacionamentos: `1:N` com SupplierQuote

#### SupplierQuote (Cotação do Fornecedor)
- Resposta de um fornecedor para uma cotação
- Contém: preço, prazo, estoque, condições
- Estados: PENDING → RECEIVED / IGNORED / SELECTED / REJECTED
- Relacionamentos:
  - `N:1` com QuotationRequest
  - `N:1` com Supplier

#### Order (Pedido Consolidado)
- Proposta final ao instalador
- Calcula margem de lucro
- Contém mensagem personalizada
- Estados: DRAFT → SENT_TO_INSTALLER → APPROVED → CANCELLED

#### ChatMessage (Mensagem)
- Log de todas mensagens (WhatsApp/API)
- Usado para histórico e contexto do LLM
- Direções: INBOUND / OUTBOUND
- Roles: INSTALLER / SUPPLIER / ATTENDANT / SYSTEM / LLM

## Integração LLM (Ollama)

### Funções do LLM

1. **parseInstallRequest()**: Extrai dados estruturados de mensagens
2. **generateFollowUpQuestion()**: Gera perguntas para completar informações
3. **generateProposalMessage()**: Cria mensagem de proposta personalizada

### Formato de Prompt (Exemplo)

```javascript
const prompt = `Você é um assistente especializado em ar-condicionado.

Conversa:
${messages.join('\n')}

Extraia as informações e retorne JSON:
{
  "environmentType": "residencial|comercial|industrial",
  "environmentAreaM2": número,
  "locationCity": "cidade",
  "locationState": "UF",
  "voltagePreference": "110V|220V",
  "productTypePreference": "split|janela|cassete",
  "brandPreference": "marca ou null",
  "maxBudget": número ou null,
  "deadlineDays": número ou null,
  "description": "resumo",
  "confidence": 0.0 a 1.0
}
`;
```

### Fallback

Se Ollama não estiver disponível ou falhar:
- `fallbackParser()`: Regex simples para extrair dados básicos
- `fallbackProposalTemplate()`: Template estático de proposta
- `fallbackFollowUpQuestion()`: Perguntas pré-definidas

## API Endpoints Principais

### Cotações

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/quotations` | Listar cotações (com filtros) |
| GET | `/api/v1/quotations/:id` | Detalhe de uma cotação |
| POST | `/api/v1/quotations` | Criar cotação (via API) |
| POST | `/api/v1/quotations/:id/dispatch-suppliers` | Disparar para fornecedores |
| GET | `/api/v1/quotations/:id/supplier-quotes` | Cotações dos fornecedores |
| GET | `/api/v1/quotations/:id/chat-history` | Histórico de conversa |

### Catálogo

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/catalog/air-conditioners` | Listar modelos |
| GET | `/api/v1/catalog/air-conditioners/:id` | Detalhe de modelo |
| POST | `/api/v1/catalog/air-conditioners` | Criar modelo |
| PUT | `/api/v1/catalog/air-conditioners/:id` | Atualizar modelo |
| DELETE | `/api/v1/catalog/air-conditioners/:id` | Desativar modelo |

### Fornecedores

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/suppliers` | Listar fornecedores |
| GET | `/api/v1/suppliers/:id` | Detalhe de fornecedor |
| POST | `/api/v1/suppliers` | Criar fornecedor |
| PUT | `/api/v1/suppliers/:id` | Atualizar fornecedor |

### Pedidos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/orders` | Criar pedido |
| POST | `/api/v1/orders/:id/send-to-installer` | Enviar proposta |
| PUT | `/api/v1/orders/:id/status` | Atualizar status |

### Webhooks

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/webhooks/whatsapp` | Receber mensagens WhatsApp |

## Frontend - Estrutura de Módulos

```
frontend/src/app/
├── core/
│   └── services/
│       └── api.service.ts          # Serviço HTTP centralizado
├── shared/
│   └── components/
│       ├── sidebar/                # Menu lateral
│       └── header/                 # Cabeçalho
└── modules/
    ├── dashboard/                  # Dashboard com KPIs
    │   └── dashboard.component.ts
    ├── quotations/                 # Módulo de cotações
    │   ├── quotations-list.component.ts
    │   └── quotation-detail.component.ts  # ⭐ Tela principal
    ├── catalog/                    # Catálogo de produtos
    │   └── catalog-list.component.ts
    └── suppliers/                  # Fornecedores
        └── suppliers-list.component.ts
```

### Tela de Detalhe de Cotação (quotation-detail)

Componentes principais:
1. **Card Cliente**: Dados do instalador
2. **Card Solicitação**: Dados estruturados (área, voltagem, etc.)
3. **Tabela Produtos**: Modelos recomendados
4. **Seleção Fornecedores**: Checkboxes + botão "Disparar"
5. **Comparativo de Cotações**: Cards clicáveis de cada fornecedor
6. **Proposta ao Instalador**:
   - Input de margem (%)
   - Cálculo automático de valores
   - Textarea editável da mensagem
   - Botão de envio

## Mock de APIs Externas

### Mock de Resposta de Fornecedor

Implementado em `QuotationsService.mockSupplierResponse()`:

```typescript
private async mockSupplierResponse(quoteId: string): Promise<void> {
  setTimeout(async () => {
    const quote = await this.supplierQuoteRepo.findOne({ where: { id: quoteId } });

    // Preço com variação aleatória (85% a 115%)
    const variation = 0.85 + Math.random() * 0.3;
    quote.unitPrice = baseCost * variation;

    // Prazo aleatório (5-15 dias)
    quote.leadTimeDays = 5 + Math.floor(Math.random() * 10);

    // Estoque (70% de chance de ter)
    quote.stockAvailable = Math.random() > 0.3;

    quote.status = SupplierQuoteStatus.RECEIVED;
    await this.supplierQuoteRepo.save(quote);
  }, 2000 + Math.random() * 3000); // 2-5 segundos
}
```

## Segurança

### Implementado
- CORS habilitado para frontend
- Validação de DTOs (class-validator)
- Sanitização de inputs
- Environment variables para secrets

### A Implementar (Produção)
- [ ] Autenticação JWT
- [ ] Rate limiting
- [ ] HTTPS obrigatório
- [ ] Criptografia de dados sensíveis
- [ ] Logs de auditoria
- [ ] RBAC (Role-Based Access Control)

## Performance

### Otimizações Implementadas
- Lazy loading nos módulos Angular
- Eager loading controlado no TypeORM
- Mock assíncrono para simular fornecedores
- Cache de sessão do WhatsApp

### Melhorias Futuras
- [ ] Cache Redis para cotações
- [ ] Queue (Bull) para processamento assíncrono
- [ ] Paginação em todas listagens
- [ ] Compressão de responses (gzip)

## Observabilidade

### Logs
- Console logs estruturados
- Níveis: LOG, ERROR, WARN, DEBUG
- Context em cada logger

### Melhorias Futuras
- [ ] Winston/Pino para logs estruturados
- [ ] Sentry para error tracking
- [ ] Prometheus + Grafana para métricas
- [ ] Healthchecks

## Deployment

### Docker
Arquivo `docker-compose.yml` inclui:
- PostgreSQL 14
- pgAdmin 4

### Variáveis de Ambiente

#### Backend (.env)
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=fornecedorair
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
WHATSAPP_SERVICE_URL=http://localhost:3001
OLLAMA_API_URL=http://localhost:11434
JWT_SECRET=change-in-production
PORT=3000
DEFAULT_MARGIN_PERCENT=15
```

#### WhatsApp Service (.env)
```
PORT=3001
BACKEND_WEBHOOK_URL=http://localhost:3000/api/v1/webhooks/whatsapp
```

## Testes

### Estrutura Recomendada

```
backend/src/
├── domain/
│   └── entities/
│       └── quotation-request.entity.spec.ts
├── application/
│   └── services/
│       └── quotations.service.spec.ts
└── interface/
    └── controllers/
        └── quotations.controller.spec.ts
```

### Comandos
```bash
# Backend
npm test               # Unit tests
npm run test:cov      # Coverage
npm run test:e2e      # E2E tests

# Frontend
npm test              # Unit tests
npm run test:headless # CI mode
```

## Roadmap

### Próximas Features
- [ ] Autenticação de usuários
- [ ] Múltiplas sessões WhatsApp
- [ ] Integração real com APIs de fornecedores
- [ ] Dashboard com gráficos (Chart.js)
- [ ] Relatórios PDF
- [ ] Notificações push
- [ ] Histórico de preços
- [ ] Sistema de aprovação de propostas
- [ ] Multi-tenancy

### Melhorias Técnicas
- [ ] Testes automatizados (>80% coverage)
- [ ] CI/CD pipeline
- [ ] Monitoramento APM
- [ ] Backup automático
- [ ] Disaster recovery
- [ ] Documentação de API completa
- [ ] Postman collection

---

**Versão**: 1.0.0
**Última atualização**: 2024
**Licença**: MIT
