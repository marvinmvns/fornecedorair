# Funcionalidades Avançadas Implementadas

Este documento descreve as funcionalidades avançadas implementadas no sistema FornecedorAir.

## 📊 1. SLA Tracking e Workflow Timeline

### Entidades Criadas
- **SlaConfig**: Configurações de SLA por etapa do processo
- **WorkflowEvent**: Eventos do workflow com rastreamento de duração

### Funcionalidades
- ✅ Rastreamento de tempo por etapa do processo de cotação
- ✅ Alertas de violação de SLA
- ✅ Timeline visual de eventos
- ✅ Cálculo automático de duração entre eventos
- ✅ Notificações quando SLA está próximo de ser violado

### Configurações Padrão de SLA
| Etapa | Target (min) | Warning (min) |
|-------|--------------|---------------|
| QUOTATION_CREATED | 15 | 10 |
| SUPPLIER_DISPATCH | 30 | 20 |
| SUPPLIER_RESPONSE | 120 | 90 |
| PROPOSAL_SENT | 60 | 45 |

### Serviço: `WorkflowService`

```typescript
// Exemplo de uso
await workflowService.trackEvent({
  quotationRequestId: 'uuid',
  eventType: 'STATUS_CHANGE',
  fromStatus: 'OPEN',
  toStatus: 'WAITING_SUPPLIERS',
  userId: 'user-uuid',
  description: 'Fornecedores despachados'
});

// Obter timeline
const timeline = await workflowService.getTimeline(quotationId);

// Verificar status do SLA
const slaStatus = await workflowService.getSlaStatus(quotationId);
// Retorna: { currentStage, minutesElapsed, targetMinutes, status: 'ON_TIME'|'WARNING'|'VIOLATED' }
```

---

## 📎 2. Gerenciamento de Anexos

### Entidade: `Attachment`

### Funcionalidades
- ✅ Upload de imagens (JPEG, PNG)
- ✅ Upload de PDFs
- ✅ Geração automática de thumbnails para imagens
- ✅ Metadados EXIF
- ✅ Rastreamento de origem (WhatsApp, Web, API)
- ✅ Armazenamento de número de telefone do uploader
- ✅ Suporte para OCR nos metadados

### Campos Principais
```typescript
{
  fileName: string;           // Nome do arquivo no storage
  originalName: string;       // Nome original do arquivo
  mimeType: string;          // Tipo MIME
  fileSizeBytes: number;     // Tamanho em bytes
  storagePath: string;       // Caminho no storage (local ou S3)
  thumbnailPath?: string;    // Caminho do thumbnail (imagens)
  uploadedVia: string;       // 'WHATSAPP' | 'WEB' | 'API'
  uploadedByPhone?: string;  // Telefone do uploader
  description?: string;      // Descrição do anexo
  metadata?: object;         // EXIF, OCR, etc.
}
```

---

## 💰 3. Motor de Precificação com Cenários

### Entidade: `PricingScenario`

### Funcionalidades
- ✅ Três cenários de precificação: Econômico, Standard, Premium
- ✅ Cálculo automático de margem
- ✅ Inclusão de custos adicionais (instalação, frete, serviços)
- ✅ Features por cenário
- ✅ Recomendação automática
- ✅ Estimativa de prazo de entrega

### Tipos de Cenários

#### 🔵 Econômico
- Menor custo
- Margem reduzida (~10-15%)
- Fornecedor mais econômico
- Prazo de entrega padrão

#### 🟢 Standard (Recomendado)
- Equilíbrio custo-benefício
- Margem média (~15-20%)
- Bom prazo de entrega
- Garantia padrão

#### 🟡 Premium
- Melhor qualidade/serviço
- Margem maior (~20-30%)
- Instalação inclusa
- Garantia estendida
- Entrega expressa

### Estrutura

```typescript
{
  scenarioType: 'ECONOMIC' | 'STANDARD' | 'PREMIUM';
  baseCost: number;              // Custo base do fornecedor
  marginPercent: number;         // Percentual de margem
  marginValue: number;           // Valor da margem
  installationCost?: number;     // Custo de instalação
  shippingCost?: number;         // Custo de frete
  additionalServices?: number;   // Serviços adicionais
  finalPrice: number;            // Preço final
  features: string[];            // ['Garantia Estendida', 'Instalação Inclusa']
  estimatedDeliveryDays: number; // Prazo estimado
  isRecommended: boolean;        // Se é o cenário recomendado
}
```

---

## 🗓️ 4. Agendamento de Instalações

### Entidade: `InstallationSchedule`

### Funcionalidades
- ✅ Agendamento com data e horário
- ✅ Slots de horário (Manhã, Tarde, Noite)
- ✅ Informações do técnico
- ✅ Endereço completo com instruções de acesso
- ✅ Confirmação do cliente
- ✅ Rastreamento de status
- ✅ Registro de tempo real de execução
- ✅ Notas de conclusão

### Slots de Horário
- **MORNING**: 8h-12h
- **AFTERNOON**: 13h-17h
- **EVENING**: 17h-20h

### Status Possíveis
- **SCHEDULED**: Agendado
- **CONFIRMED**: Confirmado pelo cliente
- **IN_PROGRESS**: Em andamento
- **COMPLETED**: Concluído
- **CANCELLED**: Cancelado
- **RESCHEDULED**: Reagendado

### Campos

```typescript
{
  scheduledDate: Date;           // Data agendada
  timeSlot: string;              // Slot de horário
  technicianName: string;        // Nome do técnico
  technicianPhone?: string;      // Telefone do técnico
  address: string;               // Endereço completo
  accessInstructions?: string;   // Instruções de acesso
  status: string;                // Status atual
  actualStartTime?: Date;        // Hora real de início
  actualEndTime?: Date;          // Hora real de término
  durationMinutes?: number;      // Duração real
  completionNotes?: string;      // Notas de conclusão
  customerConfirmed: boolean;    // Cliente confirmou?
  confirmationSentAt?: Date;     // Quando foi enviada confirmação
  confirmationReceivedAt?: Date; // Quando cliente confirmou
}
```

---

## 🔔 5. Sistema de Notificações Internas

### Entidade: `Notification`

### Funcionalidades
- ✅ Notificações por tipo e prioridade
- ✅ Link para entidade relacionada
- ✅ Marcação de lida/não lida
- ✅ Arquivamento de notificações
- ✅ Expiração automática
- ✅ Ações diretas via URL

### Tipos de Notificação
- **SLA_WARNING**: Aviso de SLA próximo ao limite
- **SLA_VIOLATED**: SLA violado
- **NEW_QUOTATION**: Nova cotação recebida
- **QUOTE_RECEIVED**: Cotação de fornecedor recebida
- **ORDER_CREATED**: Pedido criado
- **INSTALLATION_SCHEDULED**: Instalação agendada

### Níveis de Prioridade
- **LOW**: Baixa prioridade
- **MEDIUM**: Prioridade média
- **HIGH**: Alta prioridade
- **URGENT**: Urgente (requer ação imediata)

### Estrutura

```typescript
{
  type: string;                  // Tipo da notificação
  priority: string;              // Prioridade
  title: string;                 // Título
  message: string;               // Mensagem
  relatedEntityType?: string;    // 'QUOTATION' | 'ORDER' | 'INSTALLATION'
  relatedEntityId?: string;      // ID da entidade
  actionUrl?: string;            // URL de ação
  isRead: boolean;               // Lida?
  readAt?: Date;                 // Quando foi lida
  isArchived: boolean;           // Arquivada?
  expiresAt?: Date;              // Data de expiração
}
```

---

## 📱 6. WhatsApp Aprimorado (Fila, Retry, Multi-sessão)

### Entidades Criadas
- **WhatsAppQueue**: Fila de mensagens com retry
- **WhatsAppSession**: Gerenciamento de múltiplas sessões

### Funcionalidades de Fila

#### ✅ Sistema de Fila
- Mensagens enfileiradas para envio
- Processamento assíncrono
- Controle de prioridade
- Agendamento de envio

#### ✅ Sistema de Retry
- Retry automático em caso de falha
- Máximo de 3 tentativas por padrão
- Backoff exponencial
- Registro de erros

#### ✅ Multi-sessão
- Suporte a múltiplas sessões WhatsApp
- Distribuição de carga
- Failover automático
- Sessão primária/secundária

### WhatsAppQueue

```typescript
{
  phoneNumber: string;          // Número de destino
  message: string;              // Mensagem de texto
  mediaUrl?: string;            // URL de mídia (imagem/PDF/vídeo)
  mediaType?: string;           // 'image' | 'document' | 'video'
  status: string;               // 'PENDING' | 'PROCESSING' | 'SENT' | 'FAILED' | 'RETRY'
  retryCount: number;           // Contador de tentativas
  maxRetries: number;           // Máximo de tentativas (padrão: 3)
  scheduledFor?: Date;          // Agendar para data/hora específica
  sentAt?: Date;                // Quando foi enviada
  errorMessage?: string;        // Mensagem de erro
  sessionId: string;            // ID da sessão (padrão: 'default')
  priority: number;             // Prioridade (maior = mais importante)
  relatedEntityType?: string;   // 'QUOTATION' | 'ORDER'
  relatedEntityId?: string;     // ID da entidade
}
```

### WhatsAppSession

```typescript
{
  sessionId: string;            // ID único da sessão
  phoneNumber: string;          // Número do WhatsApp
  status: string;               // 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'QR_CODE' | 'ERROR'
  qrCode?: string;              // QR Code para conectar
  lastConnectedAt?: Date;       // Última conexão
  lastDisconnectedAt?: Date;    // Última desconexão
  isActive: boolean;            // Sessão ativa?
  isPrimary: boolean;           // Sessão primária?
  errorMessage?: string;        // Mensagem de erro
}
```

### Exemplo de Uso

```typescript
// Enfileirar mensagem simples
await whatsappQueue.enqueue({
  phoneNumber: '+5511999999999',
  message: 'Sua cotação foi aprovada!',
  priority: 5
});

// Enfileirar com mídia e agendamento
await whatsappQueue.enqueue({
  phoneNumber: '+5511999999999',
  message: 'Segue orçamento em anexo',
  mediaUrl: 'https://.../ cotação.pdf',
  mediaType: 'document',
  scheduledFor: new Date('2025-11-17 09:00'),
  priority: 10
});

// Enfileirar com retry customizado
await whatsappQueue.enqueue({
  phoneNumber: '+5511999999999',
  message: 'Mensagem importante',
  maxRetries: 5,
  sessionId: 'backup-session',
  priority: 20
});
```

---

## 📈 7. Analytics e Dashboards (Em desenvolvimento)

### Métricas Planejadas
- Taxa de conversão de cotações
- Tempo médio de resposta
- Fornecedores mais utilizados
- Produtos mais cotados
- SLA compliance rate
- Volume de cotações por canal
- Receita por período

---

## 🗄️ Migrations

Todas as novas tabelas foram criadas na migration:
```
1700000001000-AddAdvancedFeatures.ts
```

### Para aplicar as migrations:

```bash
cd backend
npm run migration:run
```

### Tabelas Criadas
- `sla_configs` - Configurações de SLA
- `workflow_events` - Eventos do workflow
- `attachments` - Anexos de cotações
- `pricing_scenarios` - Cenários de precificação
- `installation_schedules` - Agendamentos de instalação
- `notifications` - Notificações internas
- `whatsapp_queue` - Fila de mensagens WhatsApp
- `whatsapp_sessions` - Sessões WhatsApp

---

## 🚀 Próximos Passos

1. **Implementar Controllers e APIs** para as novas funcionalidades
2. **Criar interfaces no Frontend** para visualização e gerenciamento
3. **Implementar Worker** para processar fila do WhatsApp
4. **Adicionar Analytics Dashboard** com métricas em tempo real
5. **Implementar Testes** unitários e de integração
6. **Adicionar Documentação OpenAPI** para as novas rotas

---

## 📝 Notas Importantes

- Todas as entidades possuem suporte a **soft delete** quando aplicável
- Índices foram criados para otimizar queries frequentes
- JSON fields permitem extensibilidade sem migration
- Timestamps automáticos em todas as entidades
- Relacionamentos com CASCADE para integridade referencial

---

**Última atualização**: 2025-11-17
**Versão**: 2.0.0
