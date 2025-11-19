import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from '../../../application/services/settings.service';
import { IntegrationConfig } from '../../../domain/entities/integration-config.entity';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Assuming auth is needed

@Controller('settings')
// @UseGuards(JwtAuthGuard) // Uncomment if auth is required
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get('integration')
    async getIntegrationConfig(): Promise<IntegrationConfig> {
        return this.settingsService.getIntegrationConfig();
    }

    @Put('integration')
    async updateIntegrationConfig(
        @Body() configData: Partial<IntegrationConfig>,
    ): Promise<IntegrationConfig> {
        return this.settingsService.updateIntegrationConfig(configData);
    }
}
