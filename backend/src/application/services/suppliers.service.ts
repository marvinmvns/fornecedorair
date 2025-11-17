import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../../domain/entities/supplier.entity';

export interface CreateSupplierDto {
  name: string;
  whatsappNumber?: string;
  apiUrl?: string;
  averageLeadTimeDays?: number;
}

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepo: Repository<Supplier>,
  ) {}

  async create(dto: CreateSupplierDto): Promise<Supplier> {
    const supplier = this.supplierRepo.create(dto);
    return this.supplierRepo.save(supplier);
  }

  async findAll(): Promise<Supplier[]> {
    return this.supplierRepo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepo.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException(`Supplier ${id} not found`);
    }
    return supplier;
  }

  async update(id: string, dto: Partial<CreateSupplierDto>): Promise<Supplier> {
    const supplier = await this.findOne(id);
    Object.assign(supplier, dto);
    return this.supplierRepo.save(supplier);
  }

  async toggleStatus(id: string): Promise<Supplier> {
    const supplier = await this.findOne(id);
    supplier.isActive = !supplier.isActive;
    return this.supplierRepo.save(supplier);
  }

  async remove(id: string): Promise<void> {
    const supplier = await this.findOne(id);
    supplier.isActive = false;
    await this.supplierRepo.save(supplier);
  }
}
