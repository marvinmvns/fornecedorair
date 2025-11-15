import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { QuotationRequest } from './quotation-request.entity';
import { AirConditionerModel } from './air-conditioner-model.entity';

@Entity('quotation_items')
export class QuotationItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => QuotationRequest, quotation => quotation.items)
  @JoinColumn({ name: 'quotation_request_id' })
  quotationRequest: QuotationRequest;

  @Column({ name: 'quotation_request_id' })
  quotationRequestId: string;

  @ManyToOne(() => AirConditionerModel, model => model.quotationItems)
  @JoinColumn({ name: 'air_conditioner_model_id' })
  airConditionerModel: AirConditionerModel;

  @Column({ name: 'air_conditioner_model_id' })
  airConditionerModelId: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
