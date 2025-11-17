import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { QuotationRequest } from './quotation-request.entity';
import { SupplierQuote } from './supplier-quote.entity';

@Entity('pricing_scenarios')
export class PricingScenario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  quotationRequestId: string;

  @ManyToOne(() => QuotationRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quotationRequestId' })
  quotationRequest: QuotationRequest;

  @Column({ type: 'uuid', nullable: true })
  selectedSupplierQuoteId: string;

  @ManyToOne(() => SupplierQuote, { nullable: true })
  @JoinColumn({ name: 'selectedSupplierQuoteId' })
  selectedSupplierQuote: SupplierQuote;

  @Column({ type: 'varchar' })
  scenarioType: string; // 'ECONOMIC', 'STANDARD', 'PREMIUM'

  @Column({ type: 'varchar' })
  scenarioName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  baseCost: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  marginPercent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  marginValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  installationCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  shippingCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  additionalServices: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  finalPrice: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  features: string[]; // ['Garantia Estendida', 'Instalação Inclusa', etc]

  @Column({ type: 'int', nullable: true })
  estimatedDeliveryDays: number;

  @Column({ type: 'boolean', default: false })
  isRecommended: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
