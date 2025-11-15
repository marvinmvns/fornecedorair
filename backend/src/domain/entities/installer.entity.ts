import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { QuotationRequest } from './quotation-request.entity';

@Entity('installers')
export class Installer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  whatsappNumber: string;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  zipCode: string;

  @OneToMany(() => QuotationRequest, quotation => quotation.installer)
  quotationRequests: QuotationRequest[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
