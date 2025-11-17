import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Installer } from '../../../domain/entities/installer.entity';
import { InstallersService } from '../../../application/services/installers.service';
import { InstallersController } from '../../controllers/installers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Installer])],
  controllers: [InstallersController],
  providers: [InstallersService],
  exports: [InstallersService],
})
export class InstallersModule {}
