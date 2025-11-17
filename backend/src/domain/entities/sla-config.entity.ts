import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('sla_configs')
export class SlaConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  stage: string; // 'QUOTATION_CREATED', 'SUPPLIER_DISPATCH', 'SUPPLIER_RESPONSE', 'PROPOSAL_SENT'

  @Column({ type: 'int' })
  targetMinutes: number;

  @Column({ type: 'int' })
  warningMinutes: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
