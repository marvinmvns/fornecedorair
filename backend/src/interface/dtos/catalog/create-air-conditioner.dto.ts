import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, Min } from 'class-validator';
import { ACType, EnergyClass, Voltage } from '../../../domain/entities/air-conditioner-model.entity';

export class CreateAirConditionerDto {
  @IsString()
  sku: string;

  @IsString()
  brand: string;

  @IsString()
  modelName: string;

  @IsNumber()
  @Min(5000)
  btuCapacity: number;

  @IsEnum(ACType)
  type: ACType;

  @IsBoolean()
  @IsOptional()
  inverter?: boolean;

  @IsEnum(Voltage)
  voltage: Voltage;

  @IsEnum(EnergyClass)
  @IsOptional()
  energyEfficiencyClass?: EnergyClass;

  @IsNumber()
  @IsOptional()
  noiseLevelDb?: number;

  @IsBoolean()
  @IsOptional()
  wifiEnabled?: boolean;

  @IsNumber()
  @IsOptional()
  recommendedAreaM2?: number;

  @IsNumber()
  @Min(0)
  baseCost: number;

  @IsNumber()
  @Min(0)
  suggestedRetailPrice: number;

  @IsString()
  @IsOptional()
  features?: string;
}
