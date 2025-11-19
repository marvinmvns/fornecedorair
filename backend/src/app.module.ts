import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

// Modules
import { AuthModule } from './interface/modules/auth/auth.module';
import { QuotationsModule } from './interface/modules/quotations/quotations.module';
import { SuppliersModule } from './interface/modules/suppliers/suppliers.module';
import { OrdersModule } from './interface/modules/orders/orders.module';
import { WhatsappModule } from './interface/modules/whatsapp/whatsapp.module';
import { LlmModule } from './interface/modules/llm/llm.module';
import { ChatModule } from './interface/chat/chat.module';
import { UsersModule } from './interface/modules/users/users.module';
import { InstallersModule } from './interface/modules/installers/installers.module';
import { AirConditionerModelsModule } from './interface/modules/air-conditioner-models/air-conditioner-models.module';
import { DashboardModule } from './interface/modules/dashboard/dashboard.module';
import { SettingsModule } from './interface/modules/settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'fornecedorair',
      entities: [join(__dirname, 'domain/entities/**/*.entity{.ts,.js}')],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    QuotationsModule,
    SuppliersModule,
    OrdersModule,
    WhatsappModule,
    LlmModule,
    ChatModule,
    UsersModule,
    InstallersModule,
    AirConditionerModelsModule,
    AirConditionerModelsModule,
    DashboardModule,
    SettingsModule,
  ],
})
export class AppModule { }
