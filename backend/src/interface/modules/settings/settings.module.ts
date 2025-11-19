import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from './settings.controller';
import { SettingsService } from '../../../application/services/settings.service';
import { IntegrationConfig } from '../../../domain/entities/integration-config.entity';

@Module({
    imports: [TypeOrmModule.forFeature([IntegrationConfig])],
    controllers: [SettingsController],
    providers: [SettingsService],
    exports: [SettingsService],
})
export class SettingsModule { }
