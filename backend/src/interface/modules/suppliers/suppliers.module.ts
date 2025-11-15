import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from '../../../domain/entities/supplier.entity';
import { SuppliersService } from '../../../application/services/suppliers.service';
import { SuppliersController } from '../../controllers/suppliers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier])],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
