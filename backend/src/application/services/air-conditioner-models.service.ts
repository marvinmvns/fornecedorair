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

  async findAll(): Promise<AirConditionerModel[]> {
    return this.acModelRepo.find({
      where: { isActive: true },
      order: { brand: 'ASC', modelName: 'ASC' },
    });
  }

  async findOne(id: string): Promise<AirConditionerModel> {
    const model = await this.acModelRepo.findOne({ where: { id } });
    if (!model) {
      throw new NotFoundException(`Air Conditioner Model ${id} not found`);
    }
    return model;
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
}
