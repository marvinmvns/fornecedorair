# Dados Faltantes na API - Dashboard

Este arquivo lista todos os dados que precisam ser implementados na API para que o dashboard funcione completamente com dados reais.

## 📊 Dashboard - Endpoints Necessários

### 1. **Estatísticas Gerais** (Small Boxes)
**Endpoint:** `GET /api/v1/dashboard/stats`

**Resposta esperada:**
```json
{
  "open": 13,
  "waiting": 14,
  "completed": 15,
  "total": 60
}
```

**Campos:**
- `open` (number): Total de cotações em status OPEN
- `waiting` (number): Total de cotações em status WAITING_SUPPLIERS
- `completed` (number): Total de cotações em status PROPOSAL_SENT
- `total` (number): Total de cotações do mês atual

---

### 2. **Info Boxes**
**Endpoint:** `GET /api/v1/dashboard/info-boxes`

**Resposta esperada:**
```json
{
  "whatsappMessages": 1410,
  "activeSup pliers": 24,
  "installers": 156,
  "products": 89
}
```

**Campos:**
- `whatsappMessages` (number): Total de mensagens WhatsApp do mês
- `activeSuppliers` (number): Total de fornecedores ativos
- `installers` (number): Total de instaladores cadastrados
- `products` (number): Total de produtos no catálogo

---

### 3. **Gráfico de Linha - Cotações por Período**
**Endpoint:** `GET /api/v1/dashboard/quotations-timeline?period=monthly&months=7`

**Resposta esperada:**
```json
{
  "labels": ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho"],
  "data": [65, 59, 80, 81, 56, 55, 40]
}
```

**Query Parameters:**
- `period` (string): "daily", "weekly", "monthly", "yearly"
- `months` (number): Quantidade de meses (default: 7)

**Campos:**
- `labels` (string[]): Labels dos períodos
- `data` (number[]): Quantidade de cotações por período

---

### 4. **Gráfico de Pizza - Distribuição por Status**
**Endpoint:** `GET /api/v1/dashboard/quotations-by-status`

**Resposta esperada:**
```json
{
  "labels": ["Aberto", "Aguardando", "Recebido", "Enviado", "Fechado"],
  "data": [30, 25, 15, 20, 10],
  "backgroundColor": [
    "rgba(23, 162, 184, 0.8)",
    "rgba(255, 193, 7, 0.8)",
    "rgba(40, 167, 69, 0.8)",
    "rgba(0, 123, 255, 0.8)",
    "rgba(108, 117, 125, 0.8)"
  ]
}
```

**Campos:**
- `labels` (string[]): Labels dos status
- `data` (number[]): Quantidade de cotações por status
- `backgroundColor` (string[]): Cores para cada status (opcional - frontend pode definir)

**Mapeamento de Status:**
- Aberto = OPEN
- Aguardando = WAITING_SUPPLIERS
- Recebido = RECEIVED_SUPPLIERS
- Enviado = PROPOSAL_SENT
- Fechado = CLOSED

---

### 5. **Últimas Cotações** (Já existe)
**Endpoint:** `GET /api/v1/quotations?limit=10&sort=createdAt:desc`

✅ **Status:** Implementado

---

## 🎯 Prioridade de Implementação

### Alta Prioridade
1. ✅ `GET /api/v1/quotations` - Últimas cotações (já existe)
2. ✅ `GET /api/v1/dashboard/stats` - Estatísticas gerais
3. ✅ `GET /api/v1/dashboard/quotations-by-status` - Distribuição por status

### Média Prioridade
4. ✅ `GET /api/v1/dashboard/quotations-timeline` - Gráfico de linha
5. ✅ `GET /api/v1/dashboard/info-boxes` - Info boxes

---

## 📝 Notas de Implementação

### Backend (NestJS)

**1. Criar DashboardController:**
```bash
cd backend
nest g controller interface/controllers/dashboard
```

**2. Criar DashboardService:**
```bash
nest g service application/services/dashboard
```

**3. Implementar métodos:**
- `getStats()` - Estatísticas gerais
- `getInfoBoxes()` - Dados dos info boxes
- `getQuotationsTimeline(period, months)` - Dados do gráfico de linha
- `getQuotationsByStatus()` - Dados do gráfico de pizza

**4. Adicionar queries TypeORM:**
```typescript
// Exemplo: Contar cotações por status
const stats = await this.quotationRepository
  .createQueryBuilder('quotation')
  .select('quotation.status', 'status')
  .addSelect('COUNT(*)', 'count')
  .where('quotation.tenantId = :tenantId', { tenantId })
  .andWhere('EXTRACT(MONTH FROM quotation.createdAt) = :month', {
    month: new Date().getMonth() + 1
  })
  .groupBy('quotation.status')
  .getRawMany();
```

---

## 🔄 Alternativas Temporárias

Enquanto os endpoints não estão implementados, o frontend está usando:
- **Dados mock** para os gráficos (valores fixos)
- **Cálculos locais** para estatísticas (filtrar array de cotações)
- **Atualização do gráfico de pizza** com dados reais das cotações existentes

---

## ✅ Checklist de Implementação

- [x] Criar DashboardController
- [x] Criar DashboardService
- [x] Implementar GET /api/v1/dashboard/stats
- [x] Implementar GET /api/v1/dashboard/info-boxes
- [x] Implementar GET /api/v1/dashboard/quotations-timeline
- [x] Implementar GET /api/v1/dashboard/quotations-by-status
- [x] Adicionar guards e roles necessários
- [x] Testar endpoints com Postman/Insomnia
- [x] Atualizar frontend para consumir os novos endpoints
- [x] Remover dados mock do frontend

---

## 📚 Referências

- Dashboard Component: `frontend/src/app/modules/dashboard/dashboard.component.ts`
- API Service: `frontend/src/app/core/services/api.service.ts`
- Backend Controllers: `backend/src/interface/controllers/`
- Backend Services: `backend/src/application/services/`

---

**Data de Criação:** 2025-11-17
**Última Atualização:** 2025-11-17
