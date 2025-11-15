import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { QuotationRequest } from './quotation-request.entity';
import { Supplier } from './supplier.entity';

export enum OrderStatus {
  DRAFT = 'DRAFT',
  SENT_TO_INSTALLER = 'SENT_TO_INSTALLER',
  APPROVED = 'APPROVED',
  CANCELLED = 'CANCELLED'
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => QuotationRequest, quotation => quotation.orders)
  @JoinColumn({ name: 'quotation_request_id' })
  quotationRequest: QuotationRequest;

  @Column({ name: 'quotation_request_id' })
  quotationRequestId: string;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'selected_supplier_id' })
  selectedSupplier: Supplier;

  @Column({ name: 'selected_supplier_id', nullable: true })
  selectedSupplierId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  finalPriceToInstaller: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  grossCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  marginValue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  marginPercent: number;

  @Column({ type: 'text', nullable: true })
  proposalMessage: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.DRAFT })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
