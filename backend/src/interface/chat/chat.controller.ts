import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { ChatGateway } from './chat.gateway';
import { ChatService } from '../../application/services/chat.service';
import { MessageSender } from '../../domain/entities/message.entity';
import { WhatsappAdapter } from '../../infrastructure/adapters/whatsapp.adapter';

@Controller('api/v1/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatGateway: ChatGateway,
    private readonly chatService: ChatService,
    private readonly whatsappAdapter: WhatsappAdapter,
  ) {}

  @Get('conversations')
  async getConversations(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const tenantId = req.user.tenantId;
    const { conversations, total } = await this.chatService.getConversations(
      tenantId,
      page,
      limit,
    );

    return {
      conversations,
      total,
      page,
      limit,
    };
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id') conversationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    const { messages, total } = await this.chatService.getMessages(
      conversationId,
      page,
      limit,
    );

    return {
      messages,
      total,
      page,
      limit,
    };
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @Param('id') conversationId: string,
    @Body() body: { message: string; type?: string },
    @Request() req,
  ) {
    // Get conversation to get whatsappChatId
    const conversation = await this.chatService.getConversation(conversationId);

    // Save message to database
    const message = await this.chatService.createMessage({
      conversationId,
      content: body.message,
      sender: MessageSender.AGENT,
      senderName: req.user.name,
      userId: req.user.id,
      type: body.type as any,
    });

    // Emit message via WebSocket
    this.chatGateway.emitNewMessage(conversationId, message);

    // Send via WhatsApp
    try {
      await this.whatsappAdapter.sendMessage(
        conversation.whatsappChatId,
        body.message,
      );
    } catch (error) {
      // Log error but don't fail - message is already saved
      console.error('Failed to send WhatsApp message:', error.message);
    }

    return message;
  }

  @Post('conversations/:id/mark-read')
  async markAsRead(
    @Param('id') conversationId: string,
  ) {
    await this.chatService.markConversationAsRead(conversationId);
    return { success: true, conversationId };
  }

  @Get('stats')
  async getStats(@Request() req) {
    const tenantId = req.user.tenantId;
    return this.chatService.getChatStats(tenantId);
  }
}
