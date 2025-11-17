import { Controller, Get, Post, Put, Delete, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SuppliersService, CreateSupplierDto } from '../../application/services/suppliers.service';

@ApiTags('suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @ApiOperation({ summary: 'Create supplier' })
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List suppliers' })
  findAll() {
    return this.suppliersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier by ID' })
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update supplier' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateSupplierDto>) {
    return this.suppliersService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Toggle supplier active status' })
  toggleStatus(@Param('id') id: string) {
    return this.suppliersService.toggleStatus(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete supplier' })
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}
