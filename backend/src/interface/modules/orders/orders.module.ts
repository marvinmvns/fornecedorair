import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../../domain/entities/order.entity';
import { QuotationRequest } from '../../../domain/entities/quotation-request.entity';
import { SupplierQuote } from '../../../domain/entities/supplier-quote.entity';
import { OrdersService } from '../../../application/services/orders.service';
import { OrdersController } from '../../controllers/orders.controller';
import { LlmModule } from '../llm/llm.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, QuotationRequest, SupplierQuote]), LlmModule, WhatsappModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
