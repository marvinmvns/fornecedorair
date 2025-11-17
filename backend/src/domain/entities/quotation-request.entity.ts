import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Installer } from './installer.entity';
import { QuotationItem } from './quotation-item.entity';
import { SupplierQuote } from './supplier-quote.entity';
import { Order } from './order.entity';

export enum OriginChannel {
  WHATSAPP = 'WHATSAPP',
  API = 'API'
}

export enum QuotationStatus {
  OPEN = 'OPEN',
  WAITING_SUPPLIERS = 'WAITING_SUPPLIERS',
  RECEIVED_SUPPLIERS = 'RECEIVED_SUPPLIERS',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  CLOSED = 'CLOSED'
}

export enum EnvironmentType {
  RESIDENTIAL = 'residencial',
  COMMERCIAL = 'comercial',
  INDUSTRIAL = 'industrial'
}

@Entity('quotation_requests')
export class QuotationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  tenantId: string;

  @Column({ type: 'enum', enum: OriginChannel })
  originChannel: OriginChannel;

  @ManyToOne(() => Installer, installer => installer.quotationRequests)
  @JoinColumn({ name: 'installer_id' })
  installer: Installer;

  @Column({ name: 'installer_id' })
  installerId: string;

  @Column({ type: 'text' })
  description: string;

  // Structured data
  @Column({ type: 'enum', enum: EnvironmentType, nullable: true })
  environmentType: EnvironmentType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  environmentAreaM2: number;

  @Column({ nullable: true })
  locationCity: string;

  @Column({ nullable: true })
  locationState: string;

  @Column({ nullable: true })
  voltagePreference: string;

  @Column({ nullable: true })
  productTypePreference: string;

  @Column({ nullable: true })
  brandPreference: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxBudget: number;

  @Column({ type: 'int', nullable: true })
  deadlineDays: number;

  @Column({ type: 'enum', enum: QuotationStatus, default: QuotationStatus.OPEN })
  status: QuotationStatus;

  @OneToMany(() => QuotationItem, item => item.quotationRequest, { cascade: true })
  items: QuotationItem[];

  @OneToMany(() => SupplierQuote, quote => quote.quotationRequest, { cascade: true })
  supplierQuotes: SupplierQuote[];

  @OneToMany(() => Order, order => order.quotationRequest)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
