import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrdersService, CreateOrderDto } from '../../application/services/orders.service';
import { OrderStatus } from '../../domain/entities/order.entity';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create order from quotation' })
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post(':id/send-to-installer')
  @ApiOperation({ summary: 'Send proposal to installer via WhatsApp' })
  async sendToInstaller(@Param('id') id: string) {
    await this.ordersService.sendToInstaller(id);
    return { success: true, message: 'Proposal sent to installer' };
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  updateStatus(@Param('id') id: string, @Body() body: { status: OrderStatus }) {
    return this.ordersService.updateStatus(id, body.status);
  }
}
