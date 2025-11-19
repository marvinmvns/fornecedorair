import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('integration_configs')
export class IntegrationConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ default: 'whatsapp-js' })
    whatsappProvider: string; // 'whatsapp-js' | 'meta'

    @Column({ type: 'jsonb', nullable: true })
    metaConfig: {
        appId: string;
        phoneNumberId: string;
        accessToken: string;
        verifyToken: string;
    };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
