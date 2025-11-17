import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Order } from './order.entity';
import { User } from './user.entity';

@Entity('installation_schedules')
export class InstallationSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ type: 'timestamp' })
  scheduledDate: Date;

  @Column({ type: 'varchar' })
  timeSlot: string; // 'MORNING' (8-12), 'AFTERNOON' (13-17), 'EVENING' (17-20)

  @Column({ type: 'varchar' })
  technicianName: string;

  @Column({ type: 'varchar', nullable: true })
  technicianPhone: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  city: string;

  @Column({ type: 'varchar', nullable: true })
  state: string;

  @Column({ type: 'varchar', nullable: true })
  zipCode: string;

  @Column({ type: 'text', nullable: true })
  accessInstructions: string;

  @Column({ type: 'varchar', default: 'SCHEDULED' })
  status: string; // 'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'

  @Column({ type: 'timestamp', nullable: true })
  actualStartTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualEndTime: Date;

  @Column({ type: 'int', nullable: true })
  durationMinutes: number;

  @Column({ type: 'text', nullable: true })
  completionNotes: string;

  @Column({ type: 'boolean', default: false })
  customerConfirmed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  confirmationSentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  confirmationReceivedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  assignedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedById' })
  assignedBy: User;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
