import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { IWhatsappProvider } from './whatsapp-provider.interface';
import { SettingsService } from '../../../application/services/settings.service';

@Injectable()
export class MetaWhatsappProvider implements IWhatsappProvider {
    private readonly logger = new Logger(MetaWhatsappProvider.name);

    constructor(private settingsService: SettingsService) { }

    async sendMessage(to: string, message: string, context?: any): Promise<void> {
        const config = await this.settingsService.getIntegrationConfig();
        const { phoneNumberId, accessToken } = config.metaConfig || {};

        if (!phoneNumberId || !accessToken) {
            throw new Error('Meta WhatsApp configuration is missing');
        }

        try {
            const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
            const response = await axios.post(
                url,
                {
                    messaging_product: 'whatsapp',
                    to: to,
                    type: 'text',
                    text: { body: message },
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            this.logger.log(`Message sent to ${to} via Meta: ${response.data.messages?.[0]?.id}`);
        } catch (error) {
            this.logger.error(`Failed to send WhatsApp message via Meta to ${to}`, error.response?.data || error.message);
            throw error;
        }
    }

    async checkHealth(): Promise<boolean> {
        const config = await this.settingsService.getIntegrationConfig();
        return !!(config.metaConfig?.phoneNumberId && config.metaConfig?.accessToken);
    }
}
