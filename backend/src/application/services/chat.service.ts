import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import {
  Conversation,
  ConversationStatus,
} from '../../domain/entities/conversation.entity';
import {
  Message,
  MessageSender,
  MessageStatus,
  MessageType,
} from '../../domain/entities/message.entity';

export interface CreateConversationDto {
  contactName: string;
  contactNumber: string;
  whatsappChatId: string;
  tenantId: string;
  installerId?: string;
}

export interface CreateMessageDto {
  conversationId: string;
  content: string;
  sender: MessageSender;
  senderName: string;
  userId?: string;
  type?: MessageType;
  whatsappMessageId?: string;
  mediaUrl?: string;
}

export interface ChatStats {
  totalConversations: number;
  activeConversations: number;
  unreadMessages: number;
  averageResponseTime: number;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
  ) {}

  // ========== Conversation Methods ==========

  async findOrCreateConversation(
    contactNumber: string,
    contactName: string,
    whatsappChatId: string,
    tenantId: string,
  ): Promise<Conversation> {
    let conversation = await this.conversationRepo.findOne({
      where: { contactNumber },
    });

    if (!conversation) {
      conversation = this.conversationRepo.create({
        contactName,
        contactNumber,
        whatsappChatId,
        tenantId,
        status: ConversationStatus.ACTIVE,
      });
      await this.conversationRepo.save(conversation);
    }

    return conversation;
  }

  async getConversations(
    tenantId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ conversations: Conversation[]; total: number }> {
    const skip = (page - 1) * limit;

    const [conversations, total] = await this.conversationRepo.findAndCount({
      where: { tenantId },
      order: { lastMessageTime: 'DESC' },
      skip,
      take: limit,
      relations: ['installer'],
    });

    return { conversations, total };
  }

  async getConversation(id: string): Promise<Conversation> {
    const conversation = await this.conversationRepo.findOne({
      where: { id },
      relations: ['installer', 'quotationRequest'],
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation ${id} not found`);
    }

    return conversation;
  }

  async updateConversationLastMessage(
    conversationId: string,
    lastMessage: string,
    lastMessageTime: Date,
  ): Promise<Conversation> {
    const conversation = await this.getConversation(conversationId);
    conversation.lastMessage = lastMessage;
    conversation.lastMessageTime = lastMessageTime;
    return this.conversationRepo.save(conversation);
  }

  async incrementUnreadCount(conversationId: string): Promise<Conversation> {
    const conversation = await this.getConversation(conversationId);
    conversation.unreadCount += 1;
    return this.conversationRepo.save(conversation);
  }

  async markConversationAsRead(conversationId: string): Promise<Conversation> {
    const conversation = await this.getConversation(conversationId);
    conversation.unreadCount = 0;

    // Mark all messages in conversation as read
    await this.messageRepo.update(
      { conversationId, isRead: false },
      { isRead: true, status: MessageStatus.READ },
    );

    return this.conversationRepo.save(conversation);
  }

  async closeConversation(conversationId: string): Promise<Conversation> {
    const conversation = await this.getConversation(conversationId);
    conversation.status = ConversationStatus.CLOSED;
    return this.conversationRepo.save(conversation);
  }

  async assignToInstaller(
    conversationId: string,
    installerId: string,
  ): Promise<Conversation> {
    const conversation = await this.getConversation(conversationId);
    conversation.installerId = installerId;
    return this.conversationRepo.save(conversation);
  }

  async linkQuotationRequest(
    conversationId: string,
    quotationRequestId: string,
  ): Promise<Conversation> {
    const conversation = await this.getConversation(conversationId);
    conversation.quotationRequestId = quotationRequestId;
    return this.conversationRepo.save(conversation);
  }

  // ========== Message Methods ==========

  async createMessage(dto: CreateMessageDto): Promise<Message> {
    const message = this.messageRepo.create({
      ...dto,
      type: dto.type || MessageType.TEXT,
      status: MessageStatus.SENT,
      isRead: false,
    });

    const savedMessage = await this.messageRepo.save(message);

    // Update conversation last message
    await this.updateConversationLastMessage(
      dto.conversationId,
      dto.content,
      savedMessage.timestamp,
    );

    // Increment unread count if message is from contact
    if (dto.sender === MessageSender.CONTACT) {
      await this.incrementUnreadCount(dto.conversationId);
    }

    return savedMessage;
  }

  async getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ messages: Message[]; total: number }> {
    const skip = (page - 1) * limit;

    const [messages, total] = await this.messageRepo.findAndCount({
      where: { conversationId },
      order: { timestamp: 'ASC' },
      skip,
      take: limit,
      relations: ['user'],
    });

    return { messages, total };
  }

  async updateMessageStatus(
    messageId: string,
    status: MessageStatus,
  ): Promise<Message> {
    const message = await this.messageRepo.findOne({ where: { id: messageId } });

    if (!message) {
      throw new NotFoundException(`Message ${messageId} not found`);
    }

    message.status = status;
    return this.messageRepo.save(message);
  }

  async updateMessageStatusByWhatsappId(
    whatsappMessageId: string,
    status: MessageStatus,
  ): Promise<Message | null> {
    const message = await this.messageRepo.findOne({
      where: { whatsappMessageId },
    });

    if (!message) {
      return null;
    }

    message.status = status;
    return this.messageRepo.save(message);
  }

  async markMessageAsRead(messageId: string): Promise<Message> {
    const message = await this.messageRepo.findOne({ where: { id: messageId } });

    if (!message) {
      throw new NotFoundException(`Message ${messageId} not found`);
    }

    message.isRead = true;
    message.status = MessageStatus.READ;
    return this.messageRepo.save(message);
  }

  // ========== Stats Methods ==========

  async getChatStats(tenantId: string): Promise<ChatStats> {
    const totalConversations = await this.conversationRepo.count({
      where: { tenantId },
    });

    const activeConversations = await this.conversationRepo.count({
      where: { tenantId, status: ConversationStatus.ACTIVE },
    });

    const unreadMessages = await this.conversationRepo
      .createQueryBuilder('conversation')
      .select('SUM(conversation.unread_count)', 'total')
      .where('conversation.tenant_id = :tenantId', { tenantId })
      .getRawOne();

    // Calculate average response time (in minutes)
    // This is a simplified calculation - you may want to implement a more sophisticated one
    const averageResponseTime = 15; // Default to 15 minutes for now

    return {
      totalConversations,
      activeConversations,
      unreadMessages: parseInt(unreadMessages?.total || '0'),
      averageResponseTime,
    };
  }

  async searchConversations(
    tenantId: string,
    searchTerm: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ conversations: Conversation[]; total: number }> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.conversationRepo
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.installer', 'installer')
      .where('conversation.tenant_id = :tenantId', { tenantId })
      .andWhere(
        '(conversation.contact_name ILIKE :search OR conversation.contact_number LIKE :search)',
        { search: `%${searchTerm}%` },
      )
      .orderBy('conversation.last_message_time', 'DESC')
      .skip(skip)
      .take(limit);

    const [conversations, total] = await queryBuilder.getManyAndCount();

    return { conversations, total };
  }
}
