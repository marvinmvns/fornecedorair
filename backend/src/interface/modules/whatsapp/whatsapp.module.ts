import { Module } from '@nestjs/common';
import { WhatsappAdapter } from '../../../infrastructure/adapters/whatsapp.adapter';

@Module({
  providers: [WhatsappAdapter],
  exports: [WhatsappAdapter],
})
export class WhatsappModule {}
