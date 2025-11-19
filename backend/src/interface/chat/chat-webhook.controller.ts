import { Controller, Post, Body, Logger, Get, Query, ForbiddenException } from '@nestjs/common';
import { SettingsService } from '../../application/services/settings.service';
import { ChatService } from '../../application/services/chat.service';
import { ChatGateway } from './chat.gateway';
import { MessageSender, MessageType } from '../../domain/entities/message.entity';
import { MetaWebhookPayloadDto, MetaWebhookMessageDto, MetaWebhookContactDto } from './dto/meta-webhook.dto';

@Controller('api/v1/webhooks/whatsapp')
export class ChatWebhookController {
  private readonly logger = new Logger(ChatWebhookController.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
    private readonly settingsService: SettingsService,
  ) { }

  @Get('meta')
  async verifyMetaWebhook(@Query() query: any) {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    const config = await this.settingsService.getIntegrationConfig();
    const verifyToken = config.metaConfig?.verifyToken;

    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    throw new ForbiddenException('Invalid verify token');
  }

  @Post('meta')
  async handleMetaWebhook(@Body() payload: MetaWebhookPayloadDto) {
    try {
      if (payload.object === 'whatsapp_business_account') {
        for (const entry of payload.entry) {
          for (const change of entry.changes) {
            if (change.value.messages) {
              for (const message of change.value.messages) {
                await this.processMetaMessage(message, change.value.contacts || []);
              }
            }
          }
        }
        return { success: true };
      }
    } catch (error) {
      this.logger.error('Error processing Meta webhook:', error);
      throw error;
    }
  }

  private async processMetaMessage(message: MetaWebhookMessageDto, contacts: MetaWebhookContactDto[]) {
    const contactNumber = message.from;
    const contactName = contacts?.find((c) => c.wa_id === contactNumber)?.profile?.name || contactNumber;

    // Find or create conversation
    const conversation = await this.chatService.findOrCreateConversation(
      contactNumber,
      contactName,
      contactNumber, // whatsappChatId
      'default-tenant-id', // TODO: Get tenant
    );

    let messageType: MessageType = MessageType.TEXT;
    let content = '';
    let mediaUrl = '';

    switch (message.type) {
      case 'text':
        messageType = MessageType.TEXT;
        content = message.text?.body || '';
        break;
      case 'image':
        messageType = MessageType.IMAGE;
        mediaUrl = message.image?.id || '';
        content = message.image?.caption || '';
        break;
      default:
        content = `[Unsupported message type: ${message.type}]`;
    }

    // Save message
    const savedMessage = await this.chatService.createMessage({
      conversationId: conversation.id,
      content: content,
      sender: MessageSender.CONTACT,
      senderName: contactName,
      type: messageType,
      whatsappMessageId: message.id,
      mediaUrl: mediaUrl,
    });

    // Emit
    this.chatGateway.emitNewMessage(conversation.id, savedMessage);
    this.chatGateway.emitConversationUpdate(conversation.id, {
      lastMessage: {
        content: content,
        timestamp: savedMessage.timestamp,
        sender: MessageSender.CONTACT,
      },
    });
  }
}
