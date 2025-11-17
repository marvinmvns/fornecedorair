#!/bin/bash

API_URL="http://localhost:3010/api/v1"

echo "🧪 Testando API FornecedorAir..."
echo ""

# Testar se API está online
echo "1️⃣  Verificando se API está online..."
if curl -s -o /dev/null -w "%{http_code}" $API_URL/catalog/air-conditioners | grep -q "200"; then
    echo "   ✅ API está online!"
else
    echo "   ❌ API não está respondendo. Certifique-se que o backend está rodando."
    exit 1
fi

# Listar modelos de AC
echo ""
echo "2️⃣  Listando modelos de ar-condicionado..."
MODELS=$(curl -s $API_URL/catalog/air-conditioners)
MODEL_COUNT=$(echo $MODELS | jq '. | length')
echo "   ✅ $MODEL_COUNT modelos encontrados"

# Listar fornecedores
echo ""
echo "3️⃣  Listando fornecedores..."
SUPPLIERS=$(curl -s $API_URL/suppliers)
SUPPLIER_COUNT=$(echo $SUPPLIERS | jq '. | length')
echo "   ✅ $SUPPLIER_COUNT fornecedores encontrados"

# Criar cotação de teste
echo ""
echo "4️⃣  Criando cotação de teste..."
QUOTATION=$(curl -s -X POST $API_URL/quotations \
  -H "Content-Type: application/json" \
  -d '{
    "originChannel": "API",
    "installerPhone": "5511999887766",
    "description": "Teste automático via script",
    "environmentAreaM2": 25,
    "locationCity": "São Paulo",
    "locationState": "SP",
    "voltagePreference": "220V",
    "productTypePreference": "split"
  }')

QUOTATION_ID=$(echo $QUOTATION | jq -r '.id')

if [ "$QUOTATION_ID" != "null" ] && [ -n "$QUOTATION_ID" ]; then
    echo "   ✅ Cotação criada: $QUOTATION_ID"

    # Buscar detalhes
    echo ""
    echo "5️⃣  Buscando detalhes da cotação..."
    DETAILS=$(curl -s $API_URL/quotations/$QUOTATION_ID)
    STATUS=$(echo $DETAILS | jq -r '.status')
    ITEMS=$(echo $DETAILS | jq -r '.items | length')
    echo "   ✅ Status: $STATUS"
    echo "   ✅ Produtos sugeridos: $ITEMS"

    # Disparar para fornecedores
    echo ""
    echo "6️⃣  Disparando cotação para fornecedores..."
    SUPPLIER_IDS=$(echo $SUPPLIERS | jq -r '.[0:2] | map(.id) | @json')

    DISPATCH=$(curl -s -X POST $API_URL/quotations/$QUOTATION_ID/dispatch-suppliers \
      -H "Content-Type: application/json" \
      -d "{\"supplierIds\": $SUPPLIER_IDS}")

    echo "   ✅ Cotação disparada!"

    # Aguardar respostas (mock demora 2-5s)
    echo ""
    echo "7️⃣  Aguardando respostas dos fornecedores (5 segundos)..."
    sleep 5

    # Buscar cotações dos fornecedores
    QUOTES=$(curl -s $API_URL/quotations/$QUOTATION_ID/supplier-quotes)
    QUOTE_COUNT=$(echo $QUOTES | jq '. | length')
    echo "   ✅ $QUOTE_COUNT cotações recebidas"

    # Exibir resumo
    echo ""
    echo "📊 Resumo das cotações:"
    echo "$QUOTES" | jq -r '.[] | "   • \(.supplier.name): R$ \(.totalPrice) (\(.leadTimeDays) dias)"'

else
    echo "   ❌ Erro ao criar cotação"
fi

echo ""
echo "✅ Teste completo!"
echo ""
echo "Acesse o frontend para ver a cotação: http://localhost:4200/quotations/$QUOTATION_ID"
