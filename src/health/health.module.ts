import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { RabbitMQHealthIndicator } from './rabbitmq.health.js';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { HealthController } from './health.controller.js';

@Module({
  imports: [TerminusModule, RabbitMQModule],
  controllers: [HealthController],
  providers: [RabbitMQHealthIndicator],
  exports: [RabbitMQHealthIndicator],
})
export class HealthModule {}
