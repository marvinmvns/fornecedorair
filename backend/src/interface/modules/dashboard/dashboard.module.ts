import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuotationRequest } from '../../../domain/entities/quotation-request.entity';
import { Supplier } from '../../../domain/entities/supplier.entity';
import { Installer } from '../../../domain/entities/installer.entity';
import { AirConditionerModel } from '../../../domain/entities/air-conditioner-model.entity';
import { DashboardService } from '../../../application/services/dashboard.service';
import { DashboardController } from '../../controllers/dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuotationRequest,
      Supplier,
      Installer,
      AirConditionerModel,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
