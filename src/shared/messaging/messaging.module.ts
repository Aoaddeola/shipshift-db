import { Module } from '@nestjs/common';
import { MessageBusService } from '../rabbitmq/rabbitmq.service.js';
import { RabbitMQRootModule } from '../rabbitmq/rabbitmq.module.js';

@Module({
  imports: [RabbitMQRootModule.forRoot()],
  providers: [
    {
      provide: 'RABBITMQ_CONFIG',
      useValue: {
        defaultExchange: process.env.RABBITMQ_EXCHANGE || 'app.events',
        maxRetries: 3,
        retryDelay: 1000,
      },
    },
    MessageBusService,
  ],
  exports: [MessageBusService],
})
export class MessagingModule {}
