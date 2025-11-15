import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../../domain/entities/order.entity';
import { QuotationRequest, QuotationStatus } from '../../domain/entities/quotation-request.entity';
import { SupplierQuote, SupplierQuoteStatus } from '../../domain/entities/supplier-quote.entity';
import { ConfigService } from '@nestjs/config';
import { OllamaAdapter } from '../../infrastructure/adapters/ollama.adapter';
import { WhatsappAdapter } from '../../infrastructure/adapters/whatsapp.adapter';

export interface CreateOrderDto {
  quotationRequestId: string;
  selectedSupplierQuoteId: string;
  marginPercent?: number;
  customMessage?: string;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private readonly defaultMargin: number;

  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(QuotationRequest)
    private quotationRepo: Repository<QuotationRequest>,
    @InjectRepository(SupplierQuote)
    private supplierQuoteRepo: Repository<SupplierQuote>,
    private configService: ConfigService,
    private ollamaAdapter: OllamaAdapter,
    private whatsappAdapter: WhatsappAdapter,
  ) {
    this.defaultMargin = parseFloat(this.configService.get<string>('DEFAULT_MARGIN_PERCENT', '15'));
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    const quotation = await this.quotationRepo.findOne({
      where: { id: dto.quotationRequestId },
      relations: ['installer', 'items', 'items.airConditionerModel'],
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation ${dto.quotationRequestId} not found`);
    }

    const selectedQuote = await this.supplierQuoteRepo.findOne({
      where: { id: dto.selectedSupplierQuoteId },
      relations: ['supplier'],
    });

    if (!selectedQuote) {
      throw new NotFoundException(`Supplier quote ${dto.selectedSupplierQuoteId} not found`);
    }

    const marginPercent = dto.marginPercent || this.defaultMargin;
    const grossCost = selectedQuote.totalPrice;
    const marginValue = grossCost * (marginPercent / 100);
    const finalPrice = grossCost + marginValue;

    // Mark selected quote
    selectedQuote.status = SupplierQuoteStatus.SELECTED;
    await this.supplierQuoteRepo.save(selectedQuote);

    // Generate proposal message with LLM if no custom message
    let proposalMessage = dto.customMessage;

    if (!proposalMessage) {
      const quotationData = {
        productName: quotation.items?.[0]?.airConditionerModel?.modelName || 'Ar-condicionado',
        brand: quotation.items?.[0]?.airConditionerModel?.brand || '',
        btu: quotation.items?.[0]?.airConditionerModel?.btuCapacity || 0,
        price: finalPrice,
        leadTime: selectedQuote.leadTimeDays,
        warranty: selectedQuote.warrantyMonths,
      };

      proposalMessage = await this.ollamaAdapter.generateProposalMessage(quotationData);
    }

    const order = this.orderRepo.create({
      quotationRequestId: dto.quotationRequestId,
      selectedSupplierId: selectedQuote.supplierId,
      finalPriceToInstaller: finalPrice,
      grossCost,
      marginValue,
      marginPercent,
      proposalMessage,
      status: OrderStatus.DRAFT,
    });

    return this.orderRepo.save(order);
  }

  async sendToInstaller(orderId: string): Promise<void> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['quotationRequest', 'quotationRequest.installer'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    const installer = order.quotationRequest.installer;

    if (!installer.whatsappNumber) {
      throw new Error('Installer does not have WhatsApp number');
    }

    // Send proposal via WhatsApp
    await this.whatsappAdapter.sendMessage(installer.whatsappNumber, order.proposalMessage);

    // Update statuses
    order.status = OrderStatus.SENT_TO_INSTALLER;
    order.quotationRequest.status = QuotationStatus.PROPOSAL_SENT;

    await this.orderRepo.save(order);
    await this.quotationRepo.save(order.quotationRequest);

    this.logger.log(`Proposal sent to installer ${installer.whatsappNumber} for order ${orderId}`);
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['quotationRequest', 'quotationRequest.installer', 'selectedSupplier'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return this.orderRepo.save(order);
  }
}
