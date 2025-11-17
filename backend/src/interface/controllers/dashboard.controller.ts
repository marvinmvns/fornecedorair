import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from '../../application/services/dashboard.service';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get general statistics for dashboard' })
  async getStats(@CurrentUser() user: any) {
    return this.dashboardService.getStats(user.tenantId);
  }

  @Get('info-boxes')
  @ApiOperation({ summary: 'Get info boxes data' })
  async getInfoBoxes(@CurrentUser() user: any) {
    return this.dashboardService.getInfoBoxes(user.tenantId);
  }

  @Get('quotations-timeline')
  @ApiOperation({ summary: 'Get quotations timeline for chart' })
  @ApiQuery({ name: 'period', required: false, enum: ['daily', 'weekly', 'monthly', 'yearly'] })
  @ApiQuery({ name: 'months', required: false, type: Number })
  async getQuotationsTimeline(
    @CurrentUser() user: any,
    @Query('period') period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly',
    @Query('months') months: string = '7',
  ) {
    return this.dashboardService.getQuotationsTimeline(
      user.tenantId,
      period,
      parseInt(months, 10),
    );
  }

  @Get('quotations-by-status')
  @ApiOperation({ summary: 'Get quotations distribution by status for pie chart' })
  async getQuotationsByStatus(@CurrentUser() user: any) {
    return this.dashboardService.getQuotationsByStatus(user.tenantId);
  }
}
