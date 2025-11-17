import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { QuotationRequest } from './quotation-request.entity';
import { User } from './user.entity';

@Entity('workflow_events')
export class WorkflowEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  quotationRequestId: string;

  @ManyToOne(() => QuotationRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quotationRequestId' })
  quotationRequest: QuotationRequest;

  @Column({ type: 'varchar' })
  eventType: string; // 'STATUS_CHANGE', 'SUPPLIER_DISPATCHED', 'QUOTE_RECEIVED', 'PROPOSAL_SENT', 'NOTE_ADDED'

  @Column({ type: 'varchar', nullable: true })
  fromStatus: string;

  @Column({ type: 'varchar', nullable: true })
  toStatus: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'int', nullable: true })
  durationMinutes: number; // Tempo desde o último evento

  @Column({ type: 'boolean', default: false })
  slaViolated: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
