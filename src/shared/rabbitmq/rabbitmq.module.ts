import { DynamicModule, Global, Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { MessageBusService } from './rabbitmq.service.js';
import { RabbitMQConfig } from './config/rabbitmq.config.js';
import { AppConfigService } from '../../config/config.service.js';

@Global()
@Module({})
export class RabbitMQRootModule {
  static forRoot(): DynamicModule {
    return {
      module: RabbitMQRootModule,
      imports: [
        RabbitMQModule.forRootAsync({
          imports: [],
          inject: [AppConfigService],
          useFactory: (configService: AppConfigService) => ({
            exchanges: [
              // Event exchange (topic)
              {
                name: RabbitMQConfig.EXCHANGES.APP_EVENTS,
                type: 'topic',
                options: {
                  durable: true,
                  autoDelete: false,
                },
              },
              // Command exchange (direct)
              {
                name: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
                type: 'direct',
                options: {
                  durable: true,
                  autoDelete: false,
                },
              },
              // RPC exchange (direct)
              {
                name: RabbitMQConfig.EXCHANGES.APP_RPC,
                type: 'direct',
                options: {
                  durable: true,
                  autoDelete: false,
                },
              },
              // Dead letter exchange
              {
                name: RabbitMQConfig.EXCHANGES.APP_DLX,
                type: 'direct',
                options: {
                  durable: true,
                  autoDelete: false,
                },
              },
            ],
            uri: configService.rabbitmqUri,
            connectionInitOptions: {
              wait: true,
              timeout: configService.rabbitmqTimeout,
            },
            connectionManagerOptions: {
              heartbeatIntervalInSeconds: configService.rabbitmqHeartbeat,
              reconnectTimeInSeconds: 5,
            },
            channels: {
              default: {
                prefetchCount: configService.rabbitmqPrefetchCount,
              },
              events: {
                prefetchCount: 20, // Events can be processed in parallel
              },
              commands: {
                prefetchCount: 5, // Commands might need sequential processing
              },
              rpc: {
                prefetchCount: 1, // RPC should process one at a time
              },
            },
            logger: console,
          }),
        }),
      ],
      providers: [
        {
          provide: 'RABBITMQ_CONFIG',
          useFactory: (configService: AppConfigService) => ({
            defaultExchange: configService.rabbitmqExchange,
            maxRetries: 3,
            retryDelay: configService.rabbitmqReconnectDelay,
          }),
          inject: [AppConfigService],
        },
        MessageBusService,
      ],
      exports: [MessageBusService, RabbitMQModule],
    };
  }
}
