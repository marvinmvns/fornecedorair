import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuotationRequest } from '../../../domain/entities/quotation-request.entity';
import { QuotationItem } from '../../../domain/entities/quotation-item.entity';
import { Installer } from '../../../domain/entities/installer.entity';
import { SupplierQuote } from '../../../domain/entities/supplier-quote.entity';
import { ChatMessage } from '../../../domain/entities/chat-message.entity';
import { QuotationsService } from '../../../application/services/quotations.service';
import { QuotationsController } from '../../controllers/quotations.controller';
import { WebhooksController } from '../../controllers/webhooks.controller';
import { AirConditionerModelsModule } from '../air-conditioner-models/air-conditioner-models.module';
import { LlmModule } from '../llm/llm.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuotationRequest, QuotationItem, Installer, SupplierQuote, ChatMessage]),
    AirConditionerModelsModule,
    LlmModule,
    WhatsappModule,
  ],
  controllers: [QuotationsController, WebhooksController],
  providers: [QuotationsService],
  exports: [QuotationsService],
})
export class QuotationsModule {}
