import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Installer } from './installer.entity';
import { Supplier } from './supplier.entity';
import { AirConditionerModel } from './air-conditioner-model.entity';
import { QuotationRequest } from './quotation-request.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  primaryColor: string;

  @Column({ nullable: true })
  secondaryColor: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  whatsappEntryNumber: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 15 })
  defaultMarginPercent: number;

  @Column({ type: 'int', default: 48 })
  slaTargetHours: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => User, user => user.tenant)
  users: User[];

  @OneToMany(() => Installer, installer => installer.tenant)
  installers: Installer[];

  @OneToMany(() => Supplier, supplier => supplier.tenant)
  suppliers: Supplier[];

  @OneToMany(() => AirConditionerModel, model => model.tenant)
  airConditionerModels: AirConditionerModel[];

  @OneToMany(() => QuotationRequest, quotation => quotation.tenant)
  quotationRequests: QuotationRequest[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
