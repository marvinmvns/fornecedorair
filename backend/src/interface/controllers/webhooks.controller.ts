import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { QuotationsService } from '../../application/services/quotations.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post('whatsapp')
  @ApiOperation({ summary: 'Receive WhatsApp messages' })
  async handleWhatsappMessage(@Body() body: { from: string; body: string; timestamp: number; isGroup: boolean }) {
    if (body.isGroup) {
      return { success: true, ignored: true, reason: 'Group messages are not processed' };
    }

    await this.quotationsService.handleWhatsappMessage(body.from, body.body);

    return { success: true, processed: true };
  }
}
