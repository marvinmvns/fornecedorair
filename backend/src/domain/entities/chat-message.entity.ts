import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { QuotationRequest } from './quotation-request.entity';

export enum MessageDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND'
}

export enum MessageChannel {
  WHATSAPP = 'WHATSAPP',
  API = 'API'
}

export enum MessageRole {
  INSTALLER = 'INSTALLER',
  SUPPLIER = 'SUPPLIER',
  ATTENDANT = 'ATTENDANT',
  SYSTEM = 'SYSTEM',
  LLM = 'LLM'
}

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: MessageDirection })
  direction: MessageDirection;

  @Column({ type: 'enum', enum: MessageChannel })
  channel: MessageChannel;

  @Column({ type: 'enum', enum: MessageRole })
  fromRole: MessageRole;

  @Column({ nullable: true })
  phoneNumber: string;

  @ManyToOne(() => QuotationRequest, { nullable: true })
  @JoinColumn({ name: 'related_quotation_request_id' })
  relatedQuotationRequest: QuotationRequest;

  @Column({ name: 'related_quotation_request_id', nullable: true })
  relatedQuotationRequestId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;
}
