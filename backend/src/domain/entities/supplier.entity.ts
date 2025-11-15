import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { SupplierQuote } from './supplier-quote.entity';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  whatsappNumber: string;

  @Column({ nullable: true })
  apiUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 7 })
  averageLeadTimeDays: number;

  @OneToMany(() => SupplierQuote, quote => quote.supplier)
  quotes: SupplierQuote[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
