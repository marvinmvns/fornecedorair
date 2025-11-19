import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IWhatsappProvider } from './whatsapp-provider.interface';

@Injectable()
export class WhatsappJsProvider implements IWhatsappProvider {
    private readonly logger = new Logger(WhatsappJsProvider.name);
    private readonly serviceUrl: string;

    constructor(private configService: ConfigService) {
        this.serviceUrl = this.configService.get<string>('WHATSAPP_SERVICE_URL', 'http://localhost:3001');
    }

    async sendMessage(to: string, message: string, context?: any): Promise<void> {
        try {
            const response = await axios.post(`${this.serviceUrl}/send`, {
                to,
                message,
                context,
            });

            this.logger.log(`Message sent to ${to}: ${response.data.success}`);
        } catch (error) {
            this.logger.error(`Failed to send WhatsApp message to ${to}`, error.message);
            throw error;
        }
    }

    async checkHealth(): Promise<boolean> {
        try {
            const response = await axios.get(`${this.serviceUrl}/health`);
            return response.data.whatsapp === 'connected';
        } catch (error) {
            this.logger.error('WhatsApp service is not available', error.message);
            return false;
        }
    }
}
