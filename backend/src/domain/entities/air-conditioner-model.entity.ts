import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { QuotationItem } from './quotation-item.entity';

export enum ACType {
  SPLIT = 'split',
  WINDOW = 'janela',
  CASSETTE = 'cassete',
  FLOOR_CEILING = 'piso-teto',
  DUCTED = 'dutado'
}

export enum EnergyClass {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E'
}

export enum Voltage {
  V110 = '110V',
  V220_SINGLE = '220V',
  V220_THREE_PHASE = '220V Trifásico',
  V380 = '380V'
}

@Entity('air_conditioner_models')
export class AirConditionerModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  tenantId: string;

  @Column({ unique: true })
  sku: string;

  @Column()
  brand: string;

  @Column()
  modelName: string;

  @Column({ type: 'int' })
  btuCapacity: number;

  @Column({ type: 'enum', enum: ACType })
  type: ACType;

  @Column({ default: false })
  inverter: boolean;

  @Column({ type: 'enum', enum: Voltage })
  voltage: Voltage;

  @Column({ type: 'enum', enum: EnergyClass, default: EnergyClass.C })
  energyEfficiencyClass: EnergyClass;

  @Column({ type: 'int', nullable: true })
  noiseLevelDb: number;

  @Column({ default: false })
  wifiEnabled: boolean;

  @Column({ type: 'int', nullable: true })
  recommendedAreaM2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  baseCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  suggestedRetailPrice: number;

  @Column({ type: 'text', nullable: true })
  features: string; // JSON string array

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => QuotationItem, item => item.airConditionerModel)
  quotationItems: QuotationItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
