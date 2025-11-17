#!/bin/bash

echo "🔄 Resetando banco de dados..."

cd backend

# Reverter todas migrations
echo "⬇️  Revertendo migrations..."
npm run migration:revert 2>/dev/null || true

# Executar migrations
echo "⬆️  Executando migrations..."
npm run migration:run

# Popular banco
echo "🌱 Populando banco com dados iniciais..."
npx ts-node src/infrastructure/database/seeds/initial-data.seed.ts

echo ""
echo "✅ Banco resetado com sucesso!"
echo ""
echo "Dados disponíveis:"
echo "  - 10 modelos de ar-condicionado"
echo "  - 4 fornecedores cadastrados"
echo "  - 4 configurações de SLA padrão"
echo ""
echo "📋 Tabelas de Funcionalidades Avançadas:"
echo "  ✅ sla_configs - Configurações de SLA"
echo "  ✅ workflow_events - Eventos do workflow"
echo "  ✅ attachments - Anexos de cotações"
echo "  ✅ pricing_scenarios - Cenários de precificação"
echo "  ✅ installation_schedules - Agendamentos"
echo "  ✅ notifications - Notificações internas"
echo "  ✅ whatsapp_queue - Fila de mensagens"
echo "  ✅ whatsapp_sessions - Sessões WhatsApp"
echo ""
echo "📖 Veja ADVANCED_FEATURES.md para detalhes"
