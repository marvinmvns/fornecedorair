import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, Min } from 'class-validator';
import {
  AirConditionerModelsService,
  CreateAirConditionerModelDto,
  UpdateAirConditionerModelDto
} from '../../application/services/air-conditioner-models.service';
import { ACType, EnergyClass, Voltage } from '../../domain/entities/air-conditioner-model.entity';

export class CreateAirConditionerModelRequestDto implements CreateAirConditionerModelDto {
  @IsString()
  sku: string;

  @IsString()
  brand: string;

  @IsString()
  modelName: string;

  @IsNumber()
  @Min(0)
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

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  tenantId?: string;
}

export class UpdateAirConditionerModelRequestDto implements UpdateAirConditionerModelDto {
  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  modelName?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  btuCapacity?: number;

  @IsEnum(ACType)
  @IsOptional()
  type?: ACType;

  @IsBoolean()
  @IsOptional()
  inverter?: boolean;

  @IsEnum(Voltage)
  @IsOptional()
  voltage?: Voltage;

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
  @IsOptional()
  baseCost?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  suggestedRetailPrice?: number;

  @IsString()
  @IsOptional()
  features?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

@ApiTags('air-conditioner-models')
@Controller('air-conditioner-models')
export class AirConditionerModelsController {
  constructor(private readonly acModelsService: AirConditionerModelsService) {}

  @Post()
  @ApiOperation({ summary: 'Create air conditioner model' })
  create(@Body() dto: CreateAirConditionerModelRequestDto) {
    return this.acModelsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List air conditioner models' })
  findAll(
    @Query('brand') brand?: string,
    @Query('type') type?: string,
    @Query('minBtu') minBtu?: number,
    @Query('maxBtu') maxBtu?: number,
  ) {
    return this.acModelsService.findAll({ brand, type, minBtu, maxBtu });
  }

  @Get('recommend')
  @ApiOperation({ summary: 'Get recommended models by area' })
  findRecommended(@Query('area') area: number) {
    return this.acModelsService.findRecommendedByArea(area);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get air conditioner model by ID' })
  findOne(@Param('id') id: string) {
    return this.acModelsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update air conditioner model' })
  update(@Param('id') id: string, @Body() dto: UpdateAirConditionerModelRequestDto) {
    return this.acModelsService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Toggle air conditioner model active status' })
  toggleStatus(@Param('id') id: string) {
    return this.acModelsService.toggleStatus(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete air conditioner model (soft delete)' })
  remove(@Param('id') id: string) {
    return this.acModelsService.remove(id);
  }
}
