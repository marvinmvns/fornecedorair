import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirConditionerModel } from '../../../domain/entities/air-conditioner-model.entity';
import { AirConditionerModelsService } from '../../../application/services/air-conditioner-models.service';
import { AirConditionerModelsController } from '../../controllers/air-conditioner-models.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AirConditionerModel])],
  controllers: [AirConditionerModelsController],
  providers: [AirConditionerModelsService],
  exports: [AirConditionerModelsService],
})
export class AirConditionerModelsModule {}
