import { Module } from '@nestjs/common';
import { WhatsappAdapter } from '../../../infrastructure/adapters/whatsapp.adapter';
import { SettingsModule } from '../settings/settings.module';
import { WhatsappJsProvider } from '../../../infrastructure/adapters/whatsapp/whatsapp-js.provider';
import { MetaWhatsappProvider } from '../../../infrastructure/adapters/whatsapp/meta-whatsapp.provider';

@Module({
  imports: [SettingsModule],
  providers: [WhatsappAdapter, WhatsappJsProvider, MetaWhatsappProvider],
  exports: [WhatsappAdapter],
})
export class WhatsappModule { }
