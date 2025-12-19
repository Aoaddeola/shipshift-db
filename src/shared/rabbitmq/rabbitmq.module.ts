// Update your rabbitmq.module.ts to use AppConfigService

import { DynamicModule, Global, Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { AppConfigService } from '../../config/config.service.js';
import { MessageBusService } from './rabbitmq.service.js';

@Global()
@Module({})
export class RabbitMQRootModule {
  static forRoot(): DynamicModule {
    return {
      module: RabbitMQRootModule,
      imports: [
        RabbitMQModule.forRootAsync({
          imports: [], // AppConfigModule is already global
          inject: [AppConfigService],
          useFactory: (configService: AppConfigService) => ({
            exchanges: [
              {
                name: configService.rabbitmqExchange,
                type: 'topic',
              },
              {
                name: configService.rabbitmqDirectExchange,
                type: 'direct',
              },
              {
                name: 'app.dlx',
                type: 'direct',
              },
            ],
            uri: configService.rabbitmqUri,
            connectionInitOptions: {
              wait: true,
              timeout: configService.rabbitmqTimeout,
            },
            connectionManagerOptions: {
              heartbeatIntervalInSeconds: configService.rabbitmqHeartbeat,
              reconnectTimeInSeconds:
                configService.rabbitmqReconnectDelay / 1000,
            },
            channels: {
              default: {
                prefetchCount: configService.rabbitmqPrefetchCount,
              },
              rpc: {
                prefetchCount: 1,
              },
            },
            logger: configService.isDevelopment ? console : undefined,
          }),
        }),
      ],
      providers: [
        {
          provide: 'RABBITMQ_CONFIG',
          useFactory: (configService: AppConfigService) => ({
            defaultExchange: configService.rabbitmqExchange,
            maxRetries: 3,
            retryDelay: 1000,
          }),
          inject: [AppConfigService],
        },
        MessageBusService,
      ],
      exports: [MessageBusService, RabbitMQModule],
    };
  }
}
