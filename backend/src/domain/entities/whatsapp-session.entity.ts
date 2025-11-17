import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('whatsapp_sessions')
export class WhatsAppSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  sessionId: string;

  @Column({ type: 'varchar' })
  phoneNumber: string;

  @Column({ type: 'varchar', default: 'DISCONNECTED' })
  status: string; // 'DISCONNECTED', 'CONNECTING', 'CONNECTED', 'QR_CODE', 'ERROR'

  @Column({ type: 'text', nullable: true })
  qrCode: string;

  @Column({ type: 'timestamp', nullable: true })
  lastConnectedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastDisconnectedAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean; // Sessão principal

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
