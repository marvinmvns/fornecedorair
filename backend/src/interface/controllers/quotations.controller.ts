import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { QuotationsService } from '../../application/services/quotations.service';
import { CreateQuotationDto } from '../dtos/quotations/create-quotation.dto';
import { DispatchSuppliersDto } from '../dtos/quotations/dispatch-suppliers.dto';

@ApiTags('quotations')
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create quotation request' })
  create(@Body() dto: CreateQuotationDto) {
    return this.quotationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List quotation requests' })
  findAll(@Query('status') status?: string, @Query('channel') channel?: string) {
    return this.quotationsService.findAll({ status, channel });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quotation request by ID' })
  findOne(@Param('id') id: string) {
    return this.quotationsService.findOne(id);
  }

  @Post(':id/dispatch-suppliers')
  @ApiOperation({ summary: 'Dispatch quotation to suppliers' })
  async dispatchSuppliers(@Param('id') id: string, @Body() dto: DispatchSuppliersDto) {
    await this.quotationsService.dispatchToSuppliers(id, dto.supplierIds);
    return { success: true, message: 'Dispatched to suppliers' };
  }

  @Get(':id/supplier-quotes')
  @ApiOperation({ summary: 'Get supplier quotes for a quotation' })
  getSupplierQuotes(@Param('id') id: string) {
    return this.quotationsService.getSupplierQuotes(id);
  }

  @Get(':id/chat-history')
  @ApiOperation({ summary: 'Get chat history for a quotation' })
  getChatHistory(@Param('id') id: string) {
    return this.quotationsService.getChatHistory(id);
  }
}
