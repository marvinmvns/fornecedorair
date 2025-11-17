import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowEvent } from '../../domain/entities/workflow-event.entity';
import { SlaConfig } from '../../domain/entities/sla-config.entity';
import { Notification } from '../../domain/entities/notification.entity';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(WorkflowEvent)
    private workflowEventRepository: Repository<WorkflowEvent>,
    @InjectRepository(SlaConfig)
    private slaConfigRepository: Repository<SlaConfig>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async trackEvent(data: {
    quotationRequestId: string;
    eventType: string;
    fromStatus?: string;
    toStatus?: string;
    userId?: string;
    description?: string;
    metadata?: Record<string, any>;
  }): Promise<WorkflowEvent> {
    // Buscar último evento para calcular duração
    const lastEvent = await this.workflowEventRepository.findOne({
      where: { quotationRequestId: data.quotationRequestId },
      order: { createdAt: 'DESC' },
    });

    let durationMinutes: number | undefined;
    let slaViolated = false;

    if (lastEvent) {
      const duration = Date.now() - lastEvent.createdAt.getTime();
      durationMinutes = Math.floor(duration / (1000 * 60));

      // Verificar SLA
      const slaConfig = await this.slaConfigRepository.findOne({
        where: { stage: data.eventType, isActive: true },
      });

      if (slaConfig && durationMinutes > slaConfig.targetMinutes) {
        slaViolated = true;

        // Criar notificação de violação de SLA
        await this.createSlaViolationNotification(
          data.quotationRequestId,
          data.eventType,
          durationMinutes,
          slaConfig.targetMinutes,
        );
      }
    }

    const event = this.workflowEventRepository.create({
      ...data,
      durationMinutes,
      slaViolated,
    });

    return await this.workflowEventRepository.save(event);
  }

  async getTimeline(quotationRequestId: string): Promise<WorkflowEvent[]> {
    return await this.workflowEventRepository.find({
      where: { quotationRequestId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async getSlaStatus(quotationRequestId: string): Promise<{
    currentStage: string;
    minutesElapsed: number;
    targetMinutes: number;
    warningMinutes: number;
    status: 'ON_TIME' | 'WARNING' | 'VIOLATED';
  }> {
    const lastEvent = await this.workflowEventRepository.findOne({
      where: { quotationRequestId },
      order: { createdAt: 'DESC' },
    });

    if (!lastEvent) {
      return null;
    }

    const slaConfig = await this.slaConfigRepository.findOne({
      where: { stage: lastEvent.toStatus, isActive: true },
    });

    if (!slaConfig) {
      return null;
    }

    const minutesElapsed = Math.floor((Date.now() - lastEvent.createdAt.getTime()) / (1000 * 60));

    let status: 'ON_TIME' | 'WARNING' | 'VIOLATED' = 'ON_TIME';
    if (minutesElapsed > slaConfig.targetMinutes) {
      status = 'VIOLATED';
    } else if (minutesElapsed > slaConfig.warningMinutes) {
      status = 'WARNING';
    }

    return {
      currentStage: lastEvent.toStatus,
      minutesElapsed,
      targetMinutes: slaConfig.targetMinutes,
      warningMinutes: slaConfig.warningMinutes,
      status,
    };
  }

  private async createSlaViolationNotification(
    quotationRequestId: string,
    stage: string,
    actualMinutes: number,
    targetMinutes: number,
  ): Promise<void> {
    // Buscar todos os usuários que devem receber notificação (role ADMIN, MANAGER)
    // Por simplicidade, criamos uma notificação genérica
    const notification = this.notificationRepository.create({
      userId: '00000000-0000-0000-0000-000000000000', // Placeholder - deve ser ajustado
      type: 'SLA_VIOLATED',
      priority: 'HIGH',
      title: `SLA Violado - ${stage}`,
      message: `A cotação ultrapassou o SLA de ${targetMinutes} minutos. Tempo decorrido: ${actualMinutes} minutos.`,
      relatedEntityType: 'QUOTATION',
      relatedEntityId: quotationRequestId,
      actionUrl: `/quotations/${quotationRequestId}`,
    });

    await this.notificationRepository.save(notification);
  }
}
