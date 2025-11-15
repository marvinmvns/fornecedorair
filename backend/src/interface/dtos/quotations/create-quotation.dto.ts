import { IsString, IsEnum, IsOptional, IsNumber, IsArray } from 'class-validator';
import { OriginChannel, EnvironmentType } from '../../../domain/entities/quotation-request.entity';

class QuotationItemDto {
  @IsString()
  airConditionerModelId: string;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateQuotationDto {
  @IsEnum(OriginChannel)
  originChannel: OriginChannel;

  @IsString()
  @IsOptional()
  installerId?: string;

  @IsString()
  @IsOptional()
  installerPhone?: string;

  @IsString()
  description: string;

  @IsEnum(EnvironmentType)
  @IsOptional()
  environmentType?: EnvironmentType;

  @IsNumber()
  @IsOptional()
  environmentAreaM2?: number;

  @IsString()
  @IsOptional()
  locationCity?: string;

  @IsString()
  @IsOptional()
  locationState?: string;

  @IsString()
  @IsOptional()
  voltagePreference?: string;

  @IsString()
  @IsOptional()
  productTypePreference?: string;

  @IsString()
  @IsOptional()
  brandPreference?: string;

  @IsNumber()
  @IsOptional()
  maxBudget?: number;

  @IsNumber()
  @IsOptional()
  deadlineDays?: number;

  @IsArray()
  @IsOptional()
  items?: QuotationItemDto[];
}
