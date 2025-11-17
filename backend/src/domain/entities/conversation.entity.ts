import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { Installer } from './installer.entity';
import { Message } from './message.entity';
import { QuotationRequest } from './quotation-request.entity';

export enum ConversationStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'contact_name' })
  contactName: string;

  @Column({ name: 'contact_number', unique: true })
  contactNumber: string;

  @Column({ name: 'whatsapp_chat_id' })
  whatsappChatId: string; // ID do chat no WhatsApp (ex: 5511999999999@c.us)

  @Column({ name: 'last_message', nullable: true })
  lastMessage: string;

  @Column({ name: 'last_message_time', type: 'timestamp', nullable: true })
  lastMessageTime: Date;

  @Column({ name: 'unread_count', default: 0 })
  unreadCount: number;

  @Column({
    type: 'enum',
    enum: ConversationStatus,
    default: ConversationStatus.ACTIVE,
  })
  status: ConversationStatus;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'installer_id', nullable: true })
  installerId: string;

  @ManyToOne(() => Installer, { nullable: true })
  @JoinColumn({ name: 'installer_id' })
  installer: Installer;

  @Column({ name: 'quotation_request_id', nullable: true })
  quotationRequestId: string;

  @ManyToOne(() => QuotationRequest, { nullable: true })
  @JoinColumn({ name: 'quotation_request_id' })
  quotationRequest: QuotationRequest;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
