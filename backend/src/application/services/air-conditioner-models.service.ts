import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AirConditionerModel, ACType, EnergyClass, Voltage } from '../../domain/entities/air-conditioner-model.entity';

export interface CreateAirConditionerModelDto {
  sku: string;
  brand: string;
  modelName: string;
  btuCapacity: number;
  type: ACType;
  inverter?: boolean;
  voltage: Voltage;
  energyEfficiencyClass?: EnergyClass;
  noiseLevelDb?: number;
  wifiEnabled?: boolean;
  recommendedAreaM2?: number;
  baseCost: number;
  suggestedRetailPrice: number;
  features?: string;
  isActive?: boolean;
  tenantId?: string;
}

export interface UpdateAirConditionerModelDto {
  sku?: string;
  brand?: string;
  modelName?: string;
  btuCapacity?: number;
  type?: ACType;
  inverter?: boolean;
  voltage?: Voltage;
  energyEfficiencyClass?: EnergyClass;
  noiseLevelDb?: number;
  wifiEnabled?: boolean;
  recommendedAreaM2?: number;
  baseCost?: number;
  suggestedRetailPrice?: number;
  features?: string;
  isActive?: boolean;
}

@Injectable()
export class AirConditionerModelsService {
  constructor(
    @InjectRepository(AirConditionerModel)
    private acModelRepo: Repository<AirConditionerModel>,
  ) {}

  async create(dto: CreateAirConditionerModelDto): Promise<AirConditionerModel> {
    // Check if SKU already exists
    const existingModel = await this.acModelRepo.findOne({
      where: { sku: dto.sku }
    });

    if (existingModel) {
      throw new ConflictException('SKU already exists');
    }

    const model = this.acModelRepo.create({
      ...dto,
      inverter: dto.inverter !== undefined ? dto.inverter : false,
      wifiEnabled: dto.wifiEnabled !== undefined ? dto.wifiEnabled : false,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      energyEfficiencyClass: dto.energyEfficiencyClass || EnergyClass.C,
    });

    return this.acModelRepo.save(model);
  }

  async findAll(filters?: {
    brand?: string;
    type?: string;
    minBtu?: number;
    maxBtu?: number;
  }): Promise<AirConditionerModel[]> {
    const query = this.acModelRepo
      .createQueryBuilder('ac')
      .where('ac.isActive = :isActive', { isActive: true });

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

    const models = await query
      .orderBy('ac.brand', 'ASC')
      .addOrderBy('ac.btuCapacity', 'ASC')
      .getMany();

    // Convert decimal strings to numbers for proper JSON serialization
    return models.map(model => ({
      ...model,
      baseCost: Number(model.baseCost),
      suggestedRetailPrice: Number(model.suggestedRetailPrice),
    })) as AirConditionerModel[];
  }

  async findOne(id: string): Promise<AirConditionerModel> {
    const model = await this.acModelRepo.findOne({ where: { id } });
    if (!model) {
      throw new NotFoundException(`Air Conditioner Model ${id} not found`);
    }
    // Convert decimal strings to numbers for proper JSON serialization
    return {
      ...model,
      baseCost: Number(model.baseCost),
      suggestedRetailPrice: Number(model.suggestedRetailPrice),
    } as AirConditionerModel;
  }

  async update(id: string, dto: UpdateAirConditionerModelDto): Promise<AirConditionerModel> {
    const model = await this.findOne(id);

    // Check SKU uniqueness if SKU is being updated
    if (dto.sku && dto.sku !== model.sku) {
      const existingModel = await this.acModelRepo.findOne({
        where: { sku: dto.sku }
      });
      if (existingModel) {
        throw new ConflictException('SKU already exists');
      }
    }

    Object.assign(model, dto);
    return this.acModelRepo.save(model);
  }

  async toggleStatus(id: string): Promise<AirConditionerModel> {
    const model = await this.findOne(id);
    model.isActive = !model.isActive;
    return this.acModelRepo.save(model);
  }

  async remove(id: string): Promise<void> {
    const model = await this.findOne(id);
    model.isActive = false;
    await this.acModelRepo.save(model);
  }

  async findRecommendedByArea(areaM2: number): Promise<AirConditionerModel[]> {
    // Simple BTU calculation: ~600 BTU per m²
    const estimatedBtu = areaM2 * 600;
    const minBtu = estimatedBtu * 0.8;
    const maxBtu = estimatedBtu * 1.2;

    const models = await this.acModelRepo
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
