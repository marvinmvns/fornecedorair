# 📝 Exemplos de Uso - FornecedorAir

Este documento contém exemplos práticos de como usar o sistema.

## 🤖 Exemplos de Conversas com LLM via WhatsApp

### Exemplo 1: Cotação Residencial Simples

**Instalador:**
```
Olá! Preciso de um ar-condicionado para meu quarto de 15m²
```

**Sistema (LLM):**
```
Olá! Posso te ajudar com isso!

Para fazer a melhor cotação, preciso de mais algumas informações:

Qual a voltagem da sua instalação? (110V ou 220V)
```

**Instalador:**
```
É 220V
```

**Sistema (LLM):**
```
Perfeito! E em qual cidade você está localizado?
```

**Instalador:**
```
São Paulo, SP
```

**Sistema:**
```
✅ Perfeito! Recebi sua solicitação de cotação.

📋 Resumo:
• Ambiente: 15m²
• Localização: São Paulo/SP
• Voltagem: 220V

Estou processando e em breve você receberá as melhores opções! 🎯
```

---

### Exemplo 2: Cotação Comercial Completa

**Instalador:**
```
Preciso de 3 aparelhos de 18.000 BTUs para um salão comercial de 60m²
em Campinas, SP. Voltagem 220V trifásico. Prefiro marcas Daikin ou LG.
Orçamento máximo de R$ 15.000. Preciso para daqui a 15 dias.
```

**Sistema:**
```
✅ Perfeito! Recebi sua solicitação de cotação.

📋 Resumo:
• Ambiente: 60m²
• Localização: Campinas/SP
• Voltagem: 220V Trifásico
• Marca preferida: Daikin ou LG
• Orçamento: R$ 15.000
• Prazo: 15 dias

Estou processando e em breve você receberá as melhores opções! 🎯
```

---

### Exemplo 3: Proposta Enviada ao Instalador

**Sistema:**
```
Olá João! 👋

Tenho uma excelente proposta para você:

🔹 *Daikin Advance Inverter 18.000 BTU*
🔹 Capacidade: *18000 BTU*
🔹 Tipo: *split*
🔹 Classe energética: *A*

💰 *Preço: R$ 4.875.00*
🚚 *Prazo de entrega: 7 dias úteis*
🛡️ *Garantia: 12 meses*
💳 *Condições: À vista com 5% desconto*

Esta é uma excelente opção que atende suas necessidades perfeitamente!

Gostaria de prosseguir com esta proposta?
```

---

## 🔌 Exemplos de Chamadas de API

### Criar Cotação via API (Sistema Parceiro)

```bash
curl -X POST http://localhost:3000/api/v1/quotations \
  -H "Content-Type: application/json" \
  -d '{
    "originChannel": "API",
    "installerPhone": "5511999887766",
    "description": "Cliente precisa de AC para escritório",
    "environmentType": "comercial",
    "environmentAreaM2": 40,
    "locationCity": "São Paulo",
    "locationState": "SP",
    "voltagePreference": "220V",
    "productTypePreference": "split",
    "brandPreference": "Daikin",
    "maxBudget": 8000,
    "deadlineDays": 10
  }'
```

**Resposta:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "originChannel": "API",
  "installerId": "...",
  "status": "OPEN",
  "environmentAreaM2": 40,
  "locationCity": "São Paulo",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

### Listar Cotações

```bash
# Todas as cotações
curl http://localhost:3000/api/v1/quotations

# Filtrar por status
curl http://localhost:3000/api/v1/quotations?status=OPEN

# Filtrar por canal
curl http://localhost:3000/api/v1/quotations?channel=WHATSAPP
```

---

### Buscar Detalhes de uma Cotação

```bash
curl http://localhost:3000/api/v1/quotations/550e8400-e29b-41d4-a716-446655440000
```

**Resposta:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "originChannel": "WHATSAPP",
  "status": "OPEN",
  "description": "Preciso de AC para sala 20m²",
  "environmentAreaM2": 20,
  "locationCity": "São Paulo",
  "locationState": "SP",
  "voltagePreference": "220V",
  "installer": {
    "id": "...",
    "name": "João Silva",
    "whatsappNumber": "5511999887766"
  },
  "items": [
    {
      "id": "...",
      "quantity": 1,
      "airConditionerModel": {
        "id": "...",
        "brand": "LG",
        "modelName": "Dual Inverter 12.000 BTU",
        "btuCapacity": 12000,
        "type": "split",
        "baseCost": 2100,
        "suggestedRetailPrice": 2700
      }
    }
  ],
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

### Disparar Cotação para Fornecedores

```bash
curl -X POST http://localhost:3000/api/v1/quotations/550e8400-e29b-41d4-a716-446655440000/dispatch-suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "supplierIds": [
      "supplier-id-1",
      "supplier-id-2",
      "supplier-id-3"
    ]
  }'
```

---

### Buscar Cotações dos Fornecedores

```bash
curl http://localhost:3000/api/v1/quotations/550e8400-e29b-41d4-a716-446655440000/supplier-quotes
```

**Resposta:**
```json
[
  {
    "id": "quote-1",
    "quotationRequestId": "550e8400-e29b-41d4-a716-446655440000",
    "supplierId": "supplier-id-1",
    "supplier": {
      "id": "supplier-id-1",
      "name": "Distribuidora Clima Frio Ltda"
    },
    "totalPrice": 2380.50,
    "unitPrice": 2380.50,
    "leadTimeDays": 7,
    "stockAvailable": true,
    "paymentConditions": "À vista com 5% desconto",
    "warrantyMonths": 12,
    "status": "RECEIVED",
    "createdAt": "2024-01-15T10:35:00.000Z"
  },
  {
    "id": "quote-2",
    "quotationRequestId": "550e8400-e29b-41d4-a716-446655440000",
    "supplierId": "supplier-id-2",
    "supplier": {
      "id": "supplier-id-2",
      "name": "MegaAr Distribuidora"
    },
    "totalPrice": 2540.00,
    "unitPrice": 2540.00,
    "leadTimeDays": 5,
    "stockAvailable": true,
    "paymentConditions": "30/60 dias",
    "warrantyMonths": 12,
    "status": "RECEIVED",
    "createdAt": "2024-01-15T10:35:05.000Z"
  }
]
```

---

### Criar Pedido e Enviar Proposta

```bash
# 1. Criar pedido
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "quotationRequestId": "550e8400-e29b-41d4-a716-446655440000",
    "selectedSupplierQuoteId": "quote-1",
    "marginPercent": 15,
    "customMessage": "Olá! Tenho a melhor proposta para você..."
  }'

# Resposta com ID do pedido
# {"id": "order-123", ...}

# 2. Enviar proposta ao instalador
curl -X POST http://localhost:3000/api/v1/orders/order-123/send-to-installer
```

---

## 📱 Exemplos de Uso do Frontend

### Dashboard

Ao acessar http://localhost:4200, você verá:

- **KPI Cards** com números de:
  - Cotações abertas
  - Aguardando fornecedores
  - Propostas enviadas
  - Total do mês

- **Tabela de últimas cotações** com:
  - Informações do cliente
  - Status colorido
  - Botão "Ver detalhes"

---

### Fluxo Completo no Portal

1. **Acesse Cotações** → Veja lista de todas cotações

2. **Clique em "Detalhes"** de uma cotação aberta

3. **Visualize:**
   - Dados do cliente (nome, WhatsApp, cidade)
   - Dados da solicitação (área, voltagem, preferências)
   - Produtos sugeridos automaticamente
   - Histórico de conversa com LLM

4. **Selecione fornecedores** (checkboxes)

5. **Clique "Disparar Cotações"**

6. **Aguarde 2-5 segundos** (mock responde automaticamente)

7. **Visualize comparativo** em cards:
   - Preços
   - Prazos
   - Estoque
   - Condições

8. **Clique em um card** para selecionar a melhor cotação

9. **Ajuste a margem de lucro** (%)
   - Veja cálculo automático:
     - Custo fornecedor
     - Margem em R$
     - Preço final

10. **Edite a mensagem** da proposta (pré-preenchida pelo LLM)

11. **Clique "Enviar Proposta via WhatsApp"**

12. **Instalador recebe no WhatsApp!**

---

## 🎨 Customizações Comuns

### Alterar Margem Padrão

Edite `backend/.env`:
```
DEFAULT_MARGIN_PERCENT=20
```

### Customizar Template de Proposta

Edite `backend/src/infrastructure/adapters/ollama.adapter.ts`:

```typescript
private fallbackProposalTemplate(data: any): string {
  return `🎯 *PROPOSTA EXCLUSIVA* 🎯

Olá! Temos uma oferta especial:

✅ ${data.productName}
✅ ${data.btu} BTU
✅ R$ ${data.price.toFixed(2)}
✅ Entrega: ${data.leadTime} dias
✅ Garantia: ${data.warranty} meses

🔥 OFERTA VÁLIDA POR 48H!

Aproveite agora!`;
}
```

### Adicionar Novo Modelo de AC

Via API:
```bash
curl -X POST http://localhost:3000/api/v1/catalog/air-conditioners \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "GREE-SPLIT-12K-ECO",
    "brand": "Gree",
    "modelName": "Eco Garden 12.000 BTU",
    "btuCapacity": 12000,
    "type": "split",
    "inverter": true,
    "voltage": "220V",
    "energyEfficiencyClass": "A",
    "noiseLevelDb": 24,
    "wifiEnabled": true,
    "recommendedAreaM2": 18,
    "baseCost": 1950,
    "suggestedRetailPrice": 2600,
    "features": "[\"Wi-Fi\",\"Inverter\",\"Filtro bactericida\"]"
  }'
```

### Adicionar Novo Fornecedor

Via API:
```bash
curl -X POST http://localhost:3000/api/v1/suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AirTech Distribuidora",
    "whatsappNumber": "5511988776655",
    "averageLeadTimeDays": 5
  }'
```

---

## 🧪 Testando o Sistema

### Teste Manual Completo

1. **Inicie todos os serviços** (backend, frontend, WhatsApp)

2. **Envie mensagem WhatsApp** para o número conectado:
   ```
   Oi, preciso de ar-condicionado para sala de 25m² em Belo Horizonte
   ```

3. **Responda as perguntas** do LLM (voltagem, etc.)

4. **Acesse o portal** → Cotações

5. **Veja a cotação criada automaticamente**

6. **Complete o fluxo** até enviar proposta

7. **Verifique WhatsApp** - proposta chegou!

### Teste Via API

Execute o script:
```bash
# Criar cotação
QUOTATION_ID=$(curl -X POST http://localhost:3000/api/v1/quotations \
  -H "Content-Type: application/json" \
  -d '{
    "originChannel": "API",
    "installerPhone": "5511999887766",
    "description": "Teste via API",
    "environmentAreaM2": 30,
    "locationCity": "São Paulo",
    "locationState": "SP",
    "voltagePreference": "220V"
  }' | jq -r '.id')

echo "Cotação criada: $QUOTATION_ID"

# Buscar detalhes
curl http://localhost:3000/api/v1/quotations/$QUOTATION_ID | jq
```

---

## 💡 Dicas e Truques

### Resetar Banco de Dados

```bash
cd backend
npm run migration:revert
npm run migration:run
npx ts-node src/infrastructure/database/seeds/initial-data.seed.ts
```

### Limpar Sessão WhatsApp

```bash
cd services/whatsapp
rm -rf .wwebjs_auth .wwebjs_cache
npm run dev
# Escaneie QR Code novamente
```

### Ver Logs Detalhados

```bash
# Backend
cd backend
NODE_ENV=development npm run start:dev

# WhatsApp
cd services/whatsapp
DEBUG=* npm run dev
```

### Testar LLM Ollama

```bash
curl http://localhost:11434/api/generate \
  -d '{
    "model": "llama2",
    "prompt": "Extraia dados estruturados: Preciso de AC 12000 BTU para 20m² em SP",
    "stream": false
  }'
```

---

## 🚨 Troubleshooting

### Erro: "Cannot connect to PostgreSQL"

```bash
docker-compose restart postgres
# Aguarde 10 segundos
cd backend && npm run migration:run
```

### Erro: "WhatsApp not connected"

```bash
# Limpe e reconecte
cd services/whatsapp
rm -rf .wwebjs_auth
npm run dev
# Escaneie QR Code
```

### Erro: "Ollama not responding"

```bash
# Verifique se está rodando
curl http://localhost:11434/api/version

# Se não, inicie
ollama serve

# Em outro terminal
ollama pull llama2
```

### Frontend não carrega dados

1. Verifique console do navegador (F12)
2. Verifique se backend está rodando: `curl http://localhost:3000/api/v1/catalog/air-conditioners`
3. Verifique CORS no backend (`app.enableCors()`)

---

**Pronto para usar!** Com estes exemplos você pode explorar todas as funcionalidades do sistema. 🚀
