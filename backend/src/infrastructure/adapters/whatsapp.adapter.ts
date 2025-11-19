import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../../application/services/settings.service';
import { WhatsappJsProvider } from './whatsapp/whatsapp-js.provider';
import { MetaWhatsappProvider } from './whatsapp/meta-whatsapp.provider';

@Injectable()
export class WhatsappAdapter {
  private readonly logger = new Logger(WhatsappAdapter.name);

  constructor(
    private settingsService: SettingsService,
    private whatsappJsProvider: WhatsappJsProvider,
    private metaWhatsappProvider: MetaWhatsappProvider,
  ) { }

  async sendMessage(to: string, message: string, context?: any): Promise<void> {
    const config = await this.settingsService.getIntegrationConfig();

    if (config.whatsappProvider === 'meta') {
      return this.metaWhatsappProvider.sendMessage(to, message, context);
    } else {
      return this.whatsappJsProvider.sendMessage(to, message, context);
    }
  }

  async checkHealth(): Promise<boolean> {
    const config = await this.settingsService.getIntegrationConfig();

    if (config.whatsappProvider === 'meta') {
      return this.metaWhatsappProvider.checkHealth();
    } else {
      return this.whatsappJsProvider.checkHealth();
    }
  }
}
