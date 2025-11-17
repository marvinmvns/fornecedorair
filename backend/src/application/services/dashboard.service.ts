import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuotationRequest, QuotationStatus } from '../../domain/entities/quotation-request.entity';
import { Supplier } from '../../domain/entities/supplier.entity';
import { Installer } from '../../domain/entities/installer.entity';
import { AirConditionerModel } from '../../domain/entities/air-conditioner-model.entity';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(QuotationRequest)
    private quotationRepo: Repository<QuotationRequest>,
    @InjectRepository(Supplier)
    private supplierRepo: Repository<Supplier>,
    @InjectRepository(Installer)
    private installerRepo: Repository<Installer>,
    @InjectRepository(AirConditionerModel)
    private modelRepo: Repository<AirConditionerModel>,
  ) {}

  /**
   * GET /api/v1/dashboard/stats
   * Returns general statistics for small boxes
   */
  async getStats(tenantId: string) {
    this.logger.log(`Getting stats for tenant ${tenantId}`);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

    // Get quotations for current month
    const quotations = await this.quotationRepo
      .createQueryBuilder('q')
      .where('q.tenantId = :tenantId', { tenantId })
      .andWhere('EXTRACT(YEAR FROM q.createdAt) = :year', { year: currentYear })
      .andWhere('EXTRACT(MONTH FROM q.createdAt) = :month', { month: currentMonth })
      .getMany();

    // Count by status
    const open = quotations.filter(q => q.status === QuotationStatus.OPEN).length;
    const waiting = quotations.filter(q => q.status === QuotationStatus.WAITING_SUPPLIERS).length;
    const completed = quotations.filter(q => q.status === QuotationStatus.PROPOSAL_SENT).length;
    const total = quotations.length;

    return {
      open,
      waiting,
      completed,
      total,
    };
  }

  /**
   * GET /api/v1/dashboard/info-boxes
   * Returns data for info boxes
   */
  async getInfoBoxes(tenantId: string) {
    this.logger.log(`Getting info boxes for tenant ${tenantId}`);

    // Count active suppliers
    const activeSuppliers = await this.supplierRepo.count({
      where: { tenantId, isActive: true },
    });

    // Count installers
    const installers = await this.installerRepo.count({
      where: { tenantId },
    });

    // Count products in catalog
    const products = await this.modelRepo.count({
      where: { tenantId },
    });

    // WhatsApp messages count - for now return 0 since we don't have a messages table
    // TODO: Implement when ChatMessage entity is available with proper tenantId
    const whatsappMessages = 0;

    return {
      whatsappMessages,
      activeSuppliers,
      installers,
      products,
    };
  }

  /**
   * GET /api/v1/dashboard/quotations-timeline
   * Returns quotations timeline for chart
   */
  async getQuotationsTimeline(
    tenantId: string,
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly',
    months: number = 7,
  ) {
    this.logger.log(`Getting quotations timeline for tenant ${tenantId}, period: ${period}, months: ${months}`);

    const currentDate = new Date();
    const labels: string[] = [];
    const data: number[] = [];

    if (period === 'monthly') {
      // Get last N months
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        // Month name in Portuguese
        const monthNames = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        labels.push(monthNames[date.getMonth()]);

        // Count quotations for this month
        const count = await this.quotationRepo
          .createQueryBuilder('q')
          .where('q.tenantId = :tenantId', { tenantId })
          .andWhere('EXTRACT(YEAR FROM q.createdAt) = :year', { year })
          .andWhere('EXTRACT(MONTH FROM q.createdAt) = :month', { month })
          .getCount();

        data.push(count);
      }
    }

    return {
      labels,
      data,
    };
  }

  /**
   * GET /api/v1/dashboard/quotations-by-status
   * Returns quotations distribution by status for pie chart
   */
  async getQuotationsByStatus(tenantId: string) {
    this.logger.log(`Getting quotations by status for tenant ${tenantId}`);

    // Get all quotations for tenant
    const quotations = await this.quotationRepo.find({
      where: { tenantId },
    });

    // Count by status
    const statusCounts = {
      [QuotationStatus.OPEN]: 0,
      [QuotationStatus.WAITING_SUPPLIERS]: 0,
      [QuotationStatus.RECEIVED_SUPPLIERS]: 0,
      [QuotationStatus.PROPOSAL_SENT]: 0,
      [QuotationStatus.CLOSED]: 0,
    };

    quotations.forEach(q => {
      if (statusCounts[q.status] !== undefined) {
        statusCounts[q.status]++;
      }
    });

    // Map to response format
    const labels = ['Aberto', 'Aguardando', 'Recebido', 'Enviado', 'Fechado'];
    const data = [
      statusCounts[QuotationStatus.OPEN],
      statusCounts[QuotationStatus.WAITING_SUPPLIERS],
      statusCounts[QuotationStatus.RECEIVED_SUPPLIERS],
      statusCounts[QuotationStatus.PROPOSAL_SENT],
      statusCounts[QuotationStatus.CLOSED],
    ];

    const backgroundColor = [
      'rgba(23, 162, 184, 0.8)',   // Info - Cyan
      'rgba(255, 193, 7, 0.8)',    // Warning - Yellow
      'rgba(40, 167, 69, 0.8)',    // Success - Green
      'rgba(0, 123, 255, 0.8)',    // Primary - Blue
      'rgba(108, 117, 125, 0.8)',  // Secondary - Gray
    ];

    return {
      labels,
      data,
      backgroundColor,
    };
  }
}
