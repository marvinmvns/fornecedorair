import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntegrationConfig } from '../../domain/entities/integration-config.entity';

@Injectable()
export class SettingsService {
    private readonly logger = new Logger(SettingsService.name);
    private configCache: IntegrationConfig | null = null;
    private lastCacheTime: number = 0;
    private readonly CACHE_TTL = 60 * 1000; // 1 minute cache

    constructor(
        @InjectRepository(IntegrationConfig)
        private configRepository: Repository<IntegrationConfig>,
    ) { }

    async getIntegrationConfig(): Promise<IntegrationConfig> {
        const now = Date.now();
        if (this.configCache && (now - this.lastCacheTime < this.CACHE_TTL)) {
            return this.configCache;
        }

        const config = await this.configRepository.findOne({
            where: {},
            order: { createdAt: 'DESC' },
        });

        if (!config) {
            const defaultConfig = this.configRepository.create({
                whatsappProvider: 'whatsapp-js',
                metaConfig: {
                    appId: '',
                    phoneNumberId: '',
                    accessToken: '',
                    verifyToken: '',
                },
            });
            this.configCache = defaultConfig;
            this.lastCacheTime = now;
            return defaultConfig;
        }

        this.configCache = config;
        this.lastCacheTime = now;
        return config;
    }

    async updateIntegrationConfig(
        configData: Partial<IntegrationConfig>,
    ): Promise<IntegrationConfig> {
        let config = await this.configRepository.findOne({
            where: {},
            order: { createdAt: 'DESC' },
        });

        if (!config) {
            config = this.configRepository.create(configData);
        } else {
            this.configRepository.merge(config, configData);
        }

        const savedConfig = await this.configRepository.save(config);

        // Invalidate/Update cache
        this.configCache = savedConfig;
        this.lastCacheTime = Date.now();

        this.logger.log('Integration config updated and cache refreshed');
        return savedConfig;
    }
}
