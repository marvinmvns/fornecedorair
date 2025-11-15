import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirConditionerModel } from '../../../domain/entities/air-conditioner-model.entity';
import { CatalogService } from '../../../application/services/catalog.service';
import { CatalogController } from '../../controllers/catalog.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AirConditionerModel])],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
