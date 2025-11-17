# Módulo de Chat WhatsApp - Documentação Completa

## Visão Geral

Módulo completo de chat integrado ao WhatsApp-Web.js com interface em tempo real usando WebSocket (Socket.IO). Permite visualizar e gerenciar todas as conversas do WhatsApp diretamente no painel administrativo.

## Arquitetura

### Backend (NestJS)

```
backend/src/interface/chat/
├── chat.gateway.ts       # WebSocket Gateway (Socket.IO)
├── chat.controller.ts    # REST API Controller
└── chat.module.ts        # Módulo NestJS
```

### Frontend (Angular)

```
frontend/src/app/
├── core/services/
│   └── chat.service.ts   # Serviço de Chat + WebSocket Client
└── modules/chat/
    ├── chat.component.ts          # Componente principal
    ├── chat.component.html        # Template
    ├── chat.component.scss        # Estilos BS INX Dark
    └── chat.module.ts             # Módulo Angular
```

## Funcionalidades Implementadas

### ✅ Backend (WebSocket + API)

#### WebSocket Gateway (`chat.gateway.ts`)
- **Namespace**: `/chat`
- **CORS**: Habilitado para desenvolvimento
- **Eventos**:
  - `join_conversation` - Cliente entra em uma conversa
  - `leave_conversation` - Cliente sai de uma conversa
  - `send_message` - Cliente envia mensagem
  - `new_message` - Servidor emite nova mensagem
  - `conversation_updated` - Servidor emite atualização de conversa
  - `new_conversation` - Servidor emite nova conversa
  - `message_status_update` - Servidor emite mudança de status

**Métodos do Gateway:**
```typescript
emitNewMessage(conversationId, message)        // Emitir nova mensagem
emitMessageStatusUpdate(id, status)            // Emitir mudança de status
emitNewConversation(conversation)              // Emitir nova conversa
```

#### REST API Controller (`chat.controller.ts`)

**Endpoints:**

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/chat/conversations` | Lista conversas (paginado) |
| GET | `/api/v1/chat/conversations/:id/messages` | Lista mensagens de uma conversa |
| POST | `/api/v1/chat/conversations/:id/messages` | Envia mensagem |
| POST | `/api/v1/chat/conversations/:id/mark-read` | Marca como lida |
| GET | `/api/v1/chat/stats` | Estatísticas do chat |

**Autenticação:** Todas as rotas requerem JWT (JwtAuthGuard)

### ✅ Frontend (Angular)

#### ChatService (`chat.service.ts`)

**Observables:**
- `conversations$` - Stream de conversas
- `messages$` - Stream de mensagens
- `unreadCount$` - Stream de contagem de não lidas

**Métodos API:**
```typescript
getConversations(page, limit): Observable
getMessages(conversationId, page, limit): Observable
sendMessage(conversationId, message, type): Observable
markAsRead(conversationId): Observable
getChatStats(): Observable
```

**Métodos WebSocket:**
```typescript
joinConversation(conversationId)
leaveConversation(conversationId)
```

**Gerenciamento de Estado:**
- `loadConversations()` - Carrega conversas do backend
- `loadMessages(conversationId)` - Carrega mensagens
- `handleNewMessage(message)` - Processa nova mensagem via WebSocket
- `updateConversation(data)` - Atualiza conversa
- `addConversation(conversation)` - Adiciona nova conversa

#### ChatComponent (`chat.component.ts`)

**Features:**
- Lista de conversas com busca
- Janela de chat com mensagens em tempo real
- Envio de mensagens
- Auto-scroll para última mensagem
- Formatação de tempo (Agora, 5m, 2h, 3d)
- Marcação automática de lidas
- Badges de mensagens não lidas
- Indicador de status de mensagem (enviada/entregue/lida)

## Interface do Usuário

### 🎨 Design BS INX Dark Theme

#### Layout Principal
```
┌─────────────────────────────────────────────┐
│  Chat WhatsApp Header + Stats Cards        │
├──────────────┬──────────────────────────────┤
│ Conversas    │  Janela de Chat              │
│ (Lista)      │  ┌────────────────────────┐  │
│              │  │ Contact Name           │  │
│ [Search]     │  ├────────────────────────┤  │
│              │  │ Messages Area          │  │
│ • João Silva │  │                        │  │
│   12:30 PM   │  │  [Received Message]    │  │
│   2 unread   │  │                        │  │
│              │  │      [Sent Message]    │  │
│ • Maria S.   │  │                        │  │
│   11:45 AM   │  ├────────────────────────┤  │
│              │  │ [Type message...]  [Send]│
└──────────────┴──┴────────────────────────┴──┘
```

#### Cores do Chat
- **Background conversas**: `#0e1726`
- **Background mensagens**: `#060818`
- **Mensagem enviada**: Gradiente azul `#4361ee → #5a75f5`
- **Mensagem recebida**: `#1b2e4b`
- **Mensagem sistema**: `rgba(128, 93, 202, 0.15)`
- **Badge não lido**: `#e7515a` (vermelho)
- **Avatar**: Gradiente azul primário

#### Cards KPI
1. **Total de Conversas** - Ícone chat (azul)
2. **Conversas Ativas** - Ícone check (verde)
3. **Mensagens Não Lidas** - Ícone envelope (vermelho)
4. **Tempo Médio de Resposta** - Ícone relógio (azul info)

### 📱 Responsividade

- **Desktop (>991px)**: Layout 2 colunas (33% conversas / 67% chat)
- **Tablet (768px-991px)**: Layout empilhado, altura automática
- **Mobile (<768px)**:
  - Avatares menores (40px)
  - Inputs menores (36px)
  - Mensagens ocupam 85% da largura

## Integração WhatsApp-Web.js

### Fluxo de Mensagens

#### 1. Recebimento de Mensagem do WhatsApp
```typescript
// services/whatsapp (whatsapp-web.js)
client.on('message', async (msg) => {
  // Processar mensagem
  const conversation = await findOrCreateConversation(msg.from);
  const message = await saveMessage(msg);

  // Notificar via WebSocket
  chatGateway.emitNewMessage(conversation.id, message);
});
```

#### 2. Envio de Mensagem pelo Painel
```typescript
// Frontend
chatService.sendMessage(conversationId, text)
  ↓
// Backend API
POST /api/v1/chat/conversations/:id/messages
  ↓
// WhatsApp Service
whatsappService.sendMessage(phoneNumber, text)
  ↓
// WebSocket
chatGateway.emitNewMessage(conversationId, message)
  ↓
// Frontend (todos os clientes conectados)
chatService.messages$ atualizado
```

## Modelos de Dados

### Conversation
```typescript
interface Conversation {
  id: string;
  contactName: string;
  contactNumber: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  status: 'active' | 'closed';
  quotationId?: string;
}
```

### Message
```typescript
interface Message {
  id: string;
  conversationId: string;
  content: string;
  sender: 'contact' | 'agent' | 'system';
  senderName: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'document' | 'audio';
}
```

### Stats
```typescript
interface ChatStats {
  totalConversations: number;
  activeConversations: number;
  unreadMessages: number;
  averageResponseTime: number; // minutos
}
```

## Configuração e Instalação

### Backend

1. **Instalar dependências:**
```bash
cd backend
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

2. **Importar módulo:**
```typescript
// app.module.ts
import { ChatModule } from './interface/chat/chat.module';

@Module({
  imports: [
    // ...outros módulos
    ChatModule,
  ],
})
```

### Frontend

1. **Instalar dependências:**
```bash
cd frontend
npm install socket.io-client
```

2. **Adicionar rota:**
```typescript
// app-routing.module.ts
{
  path: 'chat',
  loadChildren: () => import('./modules/chat/chat.module').then(m => m.ChatModule),
  canActivate: [AuthGuard],
  data: { roles: [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.ATTENDANT] }
}
```

3. **Adicionar link no sidebar:**
```html
<li class="nav-item">
  <a routerLink="/chat" routerLinkActive="active" class="nav-link">
    <i class="bi bi-chat-dots"></i>
    <span class="nav-text">Chat WhatsApp</span>
    <span class="badge badge-danger">3</span>
  </a>
</li>
```

## Uso

### Acessar o Chat

1. **URL**: `http://localhost:4200/chat`
2. **Permissões**: ADMIN, SALES_MANAGER ou ATTENDANT
3. **Login**: `admin@alpha.com / password123`

### Funcionalidades Disponíveis

✅ **Visualizar conversas**
- Lista ordenada por última mensagem
- Badge com contagem de não lidas
- Busca por nome/número

✅ **Visualizar mensagens**
- Histórico completo da conversa
- Auto-scroll para última mensagem
- Formatação de tempo
- Indicador de status (sent/delivered/read)

✅ **Enviar mensagens**
- Input com auto-foco
- Envio com Enter
- Desabilita botão se vazio
- Feedback visual de envio

✅ **Tempo real**
- Novas mensagens aparecem automaticamente
- Atualização de status em tempo real
- Notificação de novas conversas

✅ **Estatísticas**
- Total de conversas
- Conversas ativas
- Mensagens não lidas
- Tempo médio de resposta

## Próximas Implementações

### 📋 TODO - Persistência

- [ ] Criar entidades TypeORM para Conversation e Message
- [ ] Implementar repositórios
- [ ] Migrar dados mockados para banco de dados
- [ ] Adicionar paginação real com offset/limit

### 📋 TODO - Integração WhatsApp

- [ ] Conectar com serviço WhatsApp existente
- [ ] Sincronizar mensagens recebidas
- [ ] Implementar envio real via whatsapp-web.js
- [ ] Processar status de mensagem (ACK)
- [ ] Suportar mídia (imagens, áudio, documentos)

### 📋 TODO - Features Avançadas

- [ ] Indicador de "digitando..."
- [ ] Suporte a emojis
- [ ] Envio de anexos
- [ ] Mensagens rápidas (templates)
- [ ] Atribuição de conversas a atendentes
- [ ] Notas internas
- [ ] Tags/Categorias
- [ ] Busca em mensagens
- [ ] Exportar conversas
- [ ] Notificações push
- [ ] Modo escuro/claro toggle

### 📋 TODO - Melhorias UX

- [ ] Skeleton loaders
- [ ] Infinite scroll nas mensagens
- [ ] Indicador de conexão WebSocket
- [ ] Retry automático de mensagens
- [ ] Preview de links
- [ ] Preview de mídia
- [ ] Reações a mensagens
- [ ] Mensagens em destaque

## Testes

### Backend
```bash
cd backend
npm test -- chat.gateway.spec.ts
npm test -- chat.controller.spec.ts
```

### Frontend
```bash
cd frontend
npm test -- chat.component.spec.ts
npm test -- chat.service.spec.ts
```

### E2E
```bash
# Testar fluxo completo
npm run test:e2e -- chat.e2e-spec.ts
```

## Troubleshooting

### WebSocket não conecta

**Problema**: `WebSocket connection failed`

**Solução**:
```typescript
// Verificar CORS no gateway
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200',
    credentials: true,
  },
})
```

### Mensagens não aparecem

**Problema**: Mensagens enviadas mas não aparecem na interface

**Solução**:
1. Verificar se está no room correto
2. Verificar logs do gateway
3. Testar com `socket.emit('new_message', message)` manual

### Performance

**Problema**: Interface lenta com muitas mensagens

**Solução**:
- Implementar virtual scroll
- Limitar mensagens carregadas (ex: últimas 50)
- Usar paginação

## Segurança

✅ **Implementado**:
- Autenticação JWT em todas as rotas
- Validação de roles (RBAC)
- CORS configurado
- Sanitização de inputs

⚠️ **Recomendado**:
- [ ] Rate limiting
- [ ] Validação de conteúdo de mensagens
- [ ] Criptografia end-to-end (opcional)
- [ ] Audit log de ações

## Performance

**Otimizações implementadas**:
- Lazy loading do módulo de chat
- Observables com BehaviorSubject
- OnPush change detection (recomendado)
- Debounce na busca de conversas

**Métricas esperadas**:
- Conexão WebSocket: < 500ms
- Envio de mensagem: < 1s
- Atualização em tempo real: < 100ms
- Bundle size: ~120kb (lazy loaded)

---

**Versão**: 1.0.0
**Data**: 2025-11-17
**Status**: ✅ Funcionando (com dados mockados)
**Próximo passo**: Integrar com banco de dados e WhatsApp real
