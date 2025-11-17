import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ChatService } from '../../application/services/chat.service';
import { ChatGateway } from './chat.gateway';
import { MessageSender, MessageType } from '../../domain/entities/message.entity';

interface WhatsAppWebhookMessage {
  from: string; // Phone number with country code (e.g., 5511999999999@c.us)
  to: string;
  body: string;
  type: 'chat' | 'image' | 'document' | 'audio' | 'video';
  messageId: string;
  timestamp: number;
  name?: string;
  mediaUrl?: string;
}

@Controller('api/v1/webhooks/whatsapp')
export class ChatWebhookController {
  private readonly logger = new Logger(ChatWebhookController.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post('message')
  async handleIncomingMessage(@Body() payload: WhatsAppWebhookMessage) {
    try {
      this.logger.log(`Received WhatsApp message from ${payload.from}`);

      // Extract phone number from WhatsApp ID (remove @c.us suffix)
      const contactNumber = payload.from.split('@')[0];
      const contactName = payload.name || contactNumber;

      // Find or create conversation
      const conversation = await this.chatService.findOrCreateConversation(
        contactNumber,
        contactName,
        payload.from, // whatsappChatId
        'default-tenant-id', // TODO: Get tenant from config or context
      );

      // Map WhatsApp message type to our MessageType enum
      let messageType: MessageType;
      switch (payload.type) {
        case 'image':
          messageType = MessageType.IMAGE;
          break;
        case 'document':
          messageType = MessageType.DOCUMENT;
          break;
        case 'audio':
          messageType = MessageType.AUDIO;
          break;
        case 'video':
          messageType = MessageType.VIDEO;
          break;
        default:
          messageType = MessageType.TEXT;
      }

      // Save message to database
      const message = await this.chatService.createMessage({
        conversationId: conversation.id,
        content: payload.body,
        sender: MessageSender.CONTACT,
        senderName: contactName,
        type: messageType,
        whatsappMessageId: payload.messageId,
        mediaUrl: payload.mediaUrl,
      });

      // Emit message via WebSocket to all connected clients
      this.chatGateway.emitNewMessage(conversation.id, message);

      // Update conversation with new message
      this.chatGateway.emitConversationUpdate(conversation.id, {
        lastMessage: {
          content: payload.body,
          timestamp: message.timestamp,
          sender: MessageSender.CONTACT,
        },
      });

      this.logger.log(`Message saved and emitted: ${message.id}`);

      return { success: true, messageId: message.id };
    } catch (error) {
      this.logger.error('Error processing WhatsApp message:', error);
      throw error;
    }
  }

  @Post('status')
  async handleMessageStatus(
    @Body() payload: { messageId: string; status: 'sent' | 'delivered' | 'read' },
  ) {
    try {
      this.logger.log(`Message ${payload.messageId} status: ${payload.status}`);

      const message = await this.chatService.updateMessageStatusByWhatsappId(
        payload.messageId,
        payload.status as any,
      );

      if (message) {
        // Emit status update via WebSocket
        this.chatGateway.emitMessageStatusUpdate(message.id, payload.status);
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Error updating message status:', error);
      throw error;
    }
  }
}
