import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Installer } from '../../domain/entities/installer.entity';

export interface CreateInstallerDto {
  name: string;
  whatsappNumber: string;
  companyName?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  tenantId: string;
}

export interface UpdateInstallerDto {
  name?: string;
  whatsappNumber?: string;
  companyName?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

@Injectable()
export class InstallersService {
  constructor(
    @InjectRepository(Installer)
    private installerRepo: Repository<Installer>,
  ) {}

  async create(dto: CreateInstallerDto): Promise<Installer> {
    const installer = this.installerRepo.create(dto);
    return this.installerRepo.save(installer);
  }

  async findAll(): Promise<Installer[]> {
    return this.installerRepo.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Installer> {
    const installer = await this.installerRepo.findOne({ where: { id } });
    if (!installer) {
      throw new NotFoundException(`Installer ${id} not found`);
    }
    return installer;
  }

  async update(id: string, dto: UpdateInstallerDto): Promise<Installer> {
    const installer = await this.findOne(id);
    Object.assign(installer, dto);
    return this.installerRepo.save(installer);
  }

  async remove(id: string): Promise<void> {
    const installer = await this.findOne(id);
    await this.installerRepo.remove(installer);
  }
}
