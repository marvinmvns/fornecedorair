import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AirConditionerModel } from '../../domain/entities/air-conditioner-model.entity';
import { CreateAirConditionerDto } from '../../interface/dtos/catalog/create-air-conditioner.dto';
import { UpdateAirConditionerDto } from '../../interface/dtos/catalog/update-air-conditioner.dto';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(AirConditionerModel)
    private readonly acRepository: Repository<AirConditionerModel>,
  ) {}

  async create(dto: CreateAirConditionerDto): Promise<AirConditionerModel> {
    const model = this.acRepository.create(dto);
    return this.acRepository.save(model);
  }

  async findAll(filters?: {
    brand?: string;
    type?: string;
    minBtu?: number;
    maxBtu?: number;
  }): Promise<AirConditionerModel[]> {
    const query = this.acRepository.createQueryBuilder('ac').where('ac.isActive = :isActive', { isActive: true });

    if (filters?.brand) {
      query.andWhere('LOWER(ac.brand) LIKE LOWER(:brand)', { brand: `%${filters.brand}%` });
    }

    if (filters?.type) {
      query.andWhere('ac.type = :type', { type: filters.type });
    }

    if (filters?.minBtu) {
      query.andWhere('ac.btuCapacity >= :minBtu', { minBtu: filters.minBtu });
    }

    if (filters?.maxBtu) {
      query.andWhere('ac.btuCapacity <= :maxBtu', { maxBtu: filters.maxBtu });
    }

    const models = await query.orderBy('ac.brand', 'ASC').addOrderBy('ac.btuCapacity', 'ASC').getMany();

    // Convert decimal strings to numbers for proper JSON serialization
    return models.map(model => ({
      ...model,
      baseCost: Number(model.baseCost),
      suggestedRetailPrice: Number(model.suggestedRetailPrice),
    })) as AirConditionerModel[];
  }

  async findOne(id: string): Promise<AirConditionerModel> {
    const model = await this.acRepository.findOne({ where: { id } });
    if (!model) {
      throw new NotFoundException(`Air conditioner model with ID ${id} not found`);
    }
    // Convert decimal strings to numbers for proper JSON serialization
    return {
      ...model,
      baseCost: Number(model.baseCost),
      suggestedRetailPrice: Number(model.suggestedRetailPrice),
    } as AirConditionerModel;
  }

  async update(id: string, dto: UpdateAirConditionerDto): Promise<AirConditionerModel> {
    const model = await this.findOne(id);
    Object.assign(model, dto);
    return this.acRepository.save(model);
  }

  async remove(id: string): Promise<void> {
    const model = await this.findOne(id);
    model.isActive = false;
    await this.acRepository.save(model);
  }

  async findRecommendedByArea(areaM2: number): Promise<AirConditionerModel[]> {
    // Simple BTU calculation: ~600 BTU per m²
    const estimatedBtu = areaM2 * 600;
    const minBtu = estimatedBtu * 0.8;
    const maxBtu = estimatedBtu * 1.2;

    const models = await this.acRepository
      .createQueryBuilder('ac')
      .where('ac.isActive = :isActive', { isActive: true })
      .andWhere('ac.btuCapacity >= :minBtu', { minBtu })
      .andWhere('ac.btuCapacity <= :maxBtu', { maxBtu })
      .orderBy('ac.energyEfficiencyClass', 'ASC')
      .addOrderBy('ac.baseCost', 'ASC')
      .getMany();

    // Convert decimal strings to numbers for proper JSON serialization
    return models.map(model => ({
      ...model,
      baseCost: Number(model.baseCost),
      suggestedRetailPrice: Number(model.suggestedRetailPrice),
    })) as AirConditionerModel[];
  }
}
