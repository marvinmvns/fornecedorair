import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { QuotationRequest } from './quotation-request.entity';
import { Supplier } from './supplier.entity';

export enum SupplierQuoteStatus {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  IGNORED = 'IGNORED',
  SELECTED = 'SELECTED',
  REJECTED = 'REJECTED'
}

@Entity('supplier_quotes')
export class SupplierQuote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => QuotationRequest, quotation => quotation.supplierQuotes)
  @JoinColumn({ name: 'quotation_request_id' })
  quotationRequest: QuotationRequest;

  @Column({ name: 'quotation_request_id' })
  quotationRequestId: string;

  @ManyToOne(() => Supplier, supplier => supplier.quotes)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ name: 'supplier_id' })
  supplierId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitPrice: number;

  @Column({ type: 'int', nullable: true })
  leadTimeDays: number;

  @Column({ default: false })
  stockAvailable: boolean;

  @Column({ type: 'text', nullable: true })
  paymentConditions: string;

  @Column({ type: 'int', default: 12 })
  warrantyMonths: number;

  @Column({ type: 'text', nullable: true })
  additionalNotes: string;

  @Column({ type: 'enum', enum: SupplierQuoteStatus, default: SupplierQuoteStatus.PENDING })
  status: SupplierQuoteStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
