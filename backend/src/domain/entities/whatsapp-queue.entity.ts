import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('whatsapp_queue')
export class WhatsAppQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  phoneNumber: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', nullable: true })
  mediaUrl: string;

  @Column({ type: 'varchar', nullable: true })
  mediaType: string; // 'image', 'document', 'video'

  @Column({ type: 'varchar', default: 'PENDING' })
  status: string; // 'PENDING', 'PROCESSING', 'SENT', 'FAILED', 'RETRY'

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'int', default: 3 })
  maxRetries: number;

  @Column({ type: 'timestamp', nullable: true })
  scheduledFor: Date;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'varchar', nullable: true })
  relatedEntityType: string; // 'QUOTATION', 'ORDER'

  @Column({ type: 'uuid', nullable: true })
  relatedEntityId: string;

  @Column({ type: 'varchar', default: 'default' })
  sessionId: string; // Para multi-sessão

  @Column({ type: 'int', default: 0 })
  priority: number; // Maior = mais prioritário

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
