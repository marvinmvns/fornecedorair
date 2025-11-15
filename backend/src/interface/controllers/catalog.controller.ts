import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CatalogService } from '../../application/services/catalog.service';
import { CreateAirConditionerDto } from '../dtos/catalog/create-air-conditioner.dto';
import { UpdateAirConditionerDto } from '../dtos/catalog/update-air-conditioner.dto';

@ApiTags('catalog')
@Controller('catalog/air-conditioners')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post()
  @ApiOperation({ summary: 'Create air conditioner model' })
  create(@Body() dto: CreateAirConditionerDto) {
    return this.catalogService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List air conditioner models' })
  findAll(
    @Query('brand') brand?: string,
    @Query('type') type?: string,
    @Query('minBtu') minBtu?: number,
    @Query('maxBtu') maxBtu?: number,
  ) {
    return this.catalogService.findAll({ brand, type, minBtu, maxBtu });
  }

  @Get('recommend')
  @ApiOperation({ summary: 'Get recommended models by area' })
  findRecommended(@Query('area') area: number) {
    return this.catalogService.findRecommendedByArea(area);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get air conditioner model by ID' })
  findOne(@Param('id') id: string) {
    return this.catalogService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update air conditioner model' })
  update(@Param('id') id: string, @Body() dto: UpdateAirConditionerDto) {
    return this.catalogService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete (deactivate) air conditioner model' })
  remove(@Param('id') id: string) {
    return this.catalogService.remove(id);
  }
}
