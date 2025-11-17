import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { QuotationRequest } from './quotation-request.entity';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  quotationRequestId: string;

  @ManyToOne(() => QuotationRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quotationRequestId' })
  quotationRequest: QuotationRequest;

  @Column({ type: 'varchar' })
  fileName: string;

  @Column({ type: 'varchar' })
  originalName: string;

  @Column({ type: 'varchar' })
  mimeType: string; // image/jpeg, image/png, application/pdf

  @Column({ type: 'int' })
  fileSizeBytes: number;

  @Column({ type: 'varchar' })
  storagePath: string; // Local path or S3 URL

  @Column({ type: 'varchar', nullable: true })
  thumbnailPath: string; // For images

  @Column({ type: 'varchar' })
  uploadedVia: string; // 'WHATSAPP', 'WEB', 'API'

  @Column({ type: 'varchar', nullable: true })
  uploadedByPhone: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // EXIF data, OCR results, etc.

  @CreateDateColumn()
  createdAt: Date;
}
