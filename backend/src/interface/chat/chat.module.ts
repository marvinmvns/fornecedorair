import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ChatWebhookController } from './chat-webhook.controller';
import { ChatService } from '../../application/services/chat.service';
import { Conversation } from '../../domain/entities/conversation.entity';
import { Message } from '../../domain/entities/message.entity';
import { WhatsappModule } from '../modules/whatsapp/whatsapp.module';
import { SettingsModule } from '../modules/settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message]),
    WhatsappModule,
    SettingsModule,
  ],
  controllers: [ChatController, ChatWebhookController],
  providers: [ChatGateway, ChatService],
  exports: [ChatGateway, ChatService],
})
export class ChatModule { }
