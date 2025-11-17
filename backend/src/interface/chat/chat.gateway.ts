import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');
  private connectedClients = new Map<string, Socket>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`conversation_${data.conversationId}`);
    this.logger.log(`Client ${client.id} joined conversation ${data.conversationId}`);
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`conversation_${data.conversationId}`);
    this.logger.log(`Client ${client.id} left conversation ${data.conversationId}`);
  }

  @SubscribeMessage('send_message')
  handleSendMessage(
    @MessageBody() data: { conversationId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Este método será chamado pelo frontend, mas a lógica real de envio
    // será no controller usando o serviço do WhatsApp
    return { status: 'received', data };
  }

  // Método para emitir novas mensagens para todos os clientes conectados
  emitNewMessage(conversationId: string, message: any) {
    this.server.to(`conversation_${conversationId}`).emit('new_message', message);
    this.server.emit('conversation_updated', { conversationId, lastMessage: message });
  }

  // Método para emitir atualização de status de mensagem (overload)
  emitMessageStatusUpdate(messageId: string, status: string): void;
  emitMessageStatusUpdate(conversationId: string, messageId: string, status: string): void;
  emitMessageStatusUpdate(arg1: string, arg2: string, arg3?: string) {
    if (arg3) {
      // Old signature: (conversationId, messageId, status)
      const conversationId = arg1;
      const messageId = arg2;
      const status = arg3;
      this.server.to(`conversation_${conversationId}`).emit('message_status_update', {
        messageId,
        status,
      });
    } else {
      // New signature: (messageId, status)
      const messageId = arg1;
      const status = arg2;
      this.server.emit('message_status_update', {
        messageId,
        status,
      });
    }
  }

  // Método para emitir atualização de conversa
  emitConversationUpdate(conversationId: string, data: any) {
    this.server.emit('conversation_updated', { conversationId, ...data });
  }

  // Método para notificar nova conversa
  emitNewConversation(conversation: any) {
    this.server.emit('new_conversation', conversation);
  }
}
