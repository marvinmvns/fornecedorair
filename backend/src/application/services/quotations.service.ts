import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuotationRequest, QuotationStatus, OriginChannel } from '../../domain/entities/quotation-request.entity';
import { Installer } from '../../domain/entities/installer.entity';
import { QuotationItem } from '../../domain/entities/quotation-item.entity';
import { SupplierQuote, SupplierQuoteStatus } from '../../domain/entities/supplier-quote.entity';
import { ChatMessage, MessageDirection, MessageChannel, MessageRole } from '../../domain/entities/chat-message.entity';
import { CreateQuotationDto } from '../../interface/dtos/quotations/create-quotation.dto';
import { CatalogService } from './catalog.service';
import { OllamaAdapter } from '../../infrastructure/adapters/ollama.adapter';
import { WhatsappAdapter } from '../../infrastructure/adapters/whatsapp.adapter';

@Injectable()
export class QuotationsService {
  private readonly logger = new Logger(QuotationsService.name);

  constructor(
    @InjectRepository(QuotationRequest)
    private quotationRepo: Repository<QuotationRequest>,
    @InjectRepository(Installer)
    private installerRepo: Repository<Installer>,
    @InjectRepository(QuotationItem)
    private itemRepo: Repository<QuotationItem>,
    @InjectRepository(SupplierQuote)
    private supplierQuoteRepo: Repository<SupplierQuote>,
    @InjectRepository(ChatMessage)
    private chatRepo: Repository<ChatMessage>,
    private catalogService: CatalogService,
    private ollamaAdapter: OllamaAdapter,
    private whatsappAdapter: WhatsappAdapter,
  ) {}

  async handleWhatsappMessage(phoneNumber: string, message: string): Promise<void> {
    this.logger.log(`Processing WhatsApp message from ${phoneNumber}`);

    // Save incoming message
    await this.chatRepo.save({
      direction: MessageDirection.INBOUND,
      channel: MessageChannel.WHATSAPP,
      fromRole: MessageRole.INSTALLER,
      phoneNumber,
      content: message,
    });

    // Get or create installer
    let installer = await this.installerRepo.findOne({ where: { whatsappNumber: phoneNumber } });

    if (!installer) {
      installer = await this.installerRepo.save({
        name: `Cliente ${phoneNumber.slice(-4)}`,
        whatsappNumber: phoneNumber,
      });
      this.logger.log(`Created new installer: ${installer.id}`);
    }

    // Get conversation history
    const history = await this.chatRepo.find({
      where: { phoneNumber },
      order: { createdAt: 'ASC' },
      take: 20,
    });

    const messages = history.map(h => h.content);

    // Parse with LLM
    const parsed = await this.ollamaAdapter.parseInstallRequest(messages);

    this.logger.log(`LLM confidence: ${parsed.confidence}`);

    // Check if we have enough information
    if (parsed.confidence < 0.7 || !parsed.environmentAreaM2 || !parsed.voltagePreference) {
      // Need more information - LLM generates follow-up question
      const question = await this.ollamaAdapter.generateFollowUpQuestion(message, parsed);

      await this.sendWhatsappMessage(phoneNumber, question, MessageRole.LLM);
      return;
    }

    // We have enough info - create quotation
    const quotation = await this.createFromParsedData(installer.id, parsed);

    // Notify installer
    const confirmationMsg = `✅ Perfeito! Recebi sua solicitação de cotação.

📋 *Resumo:*
• Ambiente: ${parsed.environmentAreaM2}m²
• Localização: ${parsed.locationCity}/${parsed.locationState}
• Voltagem: ${parsed.voltagePreference}

Estou processando e em breve você receberá as melhores opções! 🎯`;

    await this.sendWhatsappMessage(phoneNumber, confirmationMsg, MessageRole.SYSTEM);

    this.logger.log(`Created quotation ${quotation.id} from WhatsApp conversation`);
  }

  private async createFromParsedData(installerId: string, parsed: any): Promise<QuotationRequest> {
    // Find recommended products
    const recommended = await this.catalogService.findRecommendedByArea(parsed.environmentAreaM2);

    const quotation = this.quotationRepo.create({
      originChannel: OriginChannel.WHATSAPP,
      installerId,
      description: parsed.description,
      environmentType: parsed.environmentType,
      environmentAreaM2: parsed.environmentAreaM2,
      locationCity: parsed.locationCity,
      locationState: parsed.locationState,
      voltagePreference: parsed.voltagePreference,
      productTypePreference: parsed.productTypePreference,
      brandPreference: parsed.brandPreference,
      maxBudget: parsed.maxBudget,
      deadlineDays: parsed.deadlineDays,
      status: QuotationStatus.OPEN,
    });

    const saved = await this.quotationRepo.save(quotation);

    // Add recommended items
    if (recommended.length > 0) {
      const items = recommended.slice(0, 3).map(product =>
        this.itemRepo.create({
          quotationRequestId: saved.id,
          airConditionerModelId: product.id,
          quantity: 1,
          notes: 'Sugerido automaticamente pelo sistema',
        })
      );

      await this.itemRepo.save(items);
    }

    return saved;
  }

  async create(dto: CreateQuotationDto): Promise<QuotationRequest> {
    let installerId = dto.installerId;

    if (!installerId && dto.installerPhone) {
      let installer = await this.installerRepo.findOne({ where: { whatsappNumber: dto.installerPhone } });

      if (!installer) {
        installer = await this.installerRepo.save({
          name: `Cliente ${dto.installerPhone.slice(-4)}`,
          whatsappNumber: dto.installerPhone,
        });
      }

      installerId = installer.id;
    }

    const quotation = this.quotationRepo.create({
      ...dto,
      installerId,
      status: QuotationStatus.OPEN,
    });

    const saved = await this.quotationRepo.save(quotation);

    if (dto.items?.length) {
      const items = dto.items.map(item =>
        this.itemRepo.create({
          ...item,
          quotationRequestId: saved.id,
        })
      );

      await this.itemRepo.save(items);
    }

    return saved;
  }

  async findAll(filters?: { status?: string; channel?: string }): Promise<QuotationRequest[]> {
    const query = this.quotationRepo
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.installer', 'installer')
      .leftJoinAndSelect('q.items', 'items')
      .leftJoinAndSelect('items.airConditionerModel', 'model');

    if (filters?.status) {
      query.andWhere('q.status = :status', { status: filters.status });
    }

    if (filters?.channel) {
      query.andWhere('q.originChannel = :channel', { channel: filters.channel });
    }

    return query.orderBy('q.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<QuotationRequest> {
    const quotation = await this.quotationRepo.findOne({
      where: { id },
      relations: ['installer', 'items', 'items.airConditionerModel', 'supplierQuotes', 'supplierQuotes.supplier'],
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation ${id} not found`);
    }

    return quotation;
  }

  async dispatchToSuppliers(quotationId: string, supplierIds: string[]): Promise<void> {
    const quotation = await this.findOne(quotationId);

    this.logger.log(`Dispatching quotation ${quotationId} to ${supplierIds.length} suppliers`);

    for (const supplierId of supplierIds) {
      const quote = this.supplierQuoteRepo.create({
        quotationRequestId: quotationId,
        supplierId,
        status: SupplierQuoteStatus.PENDING,
      });

      await this.supplierQuoteRepo.save(quote);

      // Simulate API call to supplier (mock for now)
      this.mockSupplierResponse(quote.id, quotation);
    }

    quotation.status = QuotationStatus.WAITING_SUPPLIERS;
    await this.quotationRepo.save(quotation);
  }

  private async mockSupplierResponse(quoteId: string, quotation: QuotationRequest): Promise<void> {
    // Simulate async response after 2-5 seconds
    setTimeout(async () => {
      const quote = await this.supplierQuoteRepo.findOne({ where: { id: quoteId }, relations: ['supplier'] });

      if (!quote) return;

      // Generate random but realistic prices
      const basePrice = quotation.items?.[0]?.airConditionerModel?.baseCost || 2000;
      const variation = 0.85 + Math.random() * 0.3; // 85% to 115%

      quote.unitPrice = Number((basePrice * variation).toFixed(2));
      quote.totalPrice = Number((quote.unitPrice * (quotation.items?.[0]?.quantity || 1)).toFixed(2));
      quote.leadTimeDays = 5 + Math.floor(Math.random() * 10);
      quote.stockAvailable = Math.random() > 0.3;
      quote.paymentConditions = Math.random() > 0.5 ? 'À vista com 5% desconto' : '30/60 dias';
      quote.warrantyMonths = 12;
      quote.status = SupplierQuoteStatus.RECEIVED;

      await this.supplierQuoteRepo.save(quote);

      this.logger.log(`Mock supplier ${quote.supplier?.name} responded to quote ${quoteId}`);

      // Check if all quotes received
      await this.checkAllQuotesReceived(quotation.id);
    }, 2000 + Math.random() * 3000);
  }

  private async checkAllQuotesReceived(quotationId: string): Promise<void> {
    const quotes = await this.supplierQuoteRepo.find({ where: { quotationRequestId: quotationId } });

    const allReceived = quotes.every(q => q.status === SupplierQuoteStatus.RECEIVED);

    if (allReceived && quotes.length > 0) {
      const quotation = await this.quotationRepo.findOne({ where: { id: quotationId } });

      if (quotation) {
        quotation.status = QuotationStatus.RECEIVED_SUPPLIERS;
        await this.quotationRepo.save(quotation);

        this.logger.log(`All supplier quotes received for quotation ${quotationId}`);
      }
    }
  }

  async getSupplierQuotes(quotationId: string): Promise<SupplierQuote[]> {
    return this.supplierQuoteRepo.find({
      where: { quotationRequestId: quotationId },
      relations: ['supplier'],
      order: { totalPrice: 'ASC' },
    });
  }

  async getChatHistory(quotationId: string): Promise<ChatMessage[]> {
    return this.chatRepo.find({
      where: { relatedQuotationRequestId: quotationId },
      order: { createdAt: 'ASC' },
    });
  }

  private async sendWhatsappMessage(phoneNumber: string, message: string, role: MessageRole): Promise<void> {
    await this.whatsappAdapter.sendMessage(phoneNumber, message);

    await this.chatRepo.save({
      direction: MessageDirection.OUTBOUND,
      channel: MessageChannel.WHATSAPP,
      fromRole: role,
      phoneNumber,
      content: message,
    });
  }
}
