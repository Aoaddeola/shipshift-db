import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { RabbitMQHealthIndicator } from './rabbitmq.health.js';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private rabbitMQHealth: RabbitMQHealthIndicator,
    private memoryHealth: MemoryHealthIndicator,
    private diskHealth: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.rabbitMQHealth.isHealthy('rabbitmq'),
      () => this.rabbitMQHealth.checkPing('rabbitmq_ping'),
      () => this.memoryHealth.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
      () => this.memoryHealth.checkRSS('memory_rss', 300 * 1024 * 1024), // 300MB
      () =>
        this.diskHealth.checkStorage('disk', {
          path: '/',
          thresholdPercent: 0.9,
        }),
    ]);
  }

  @Get('rabbitmq')
  @HealthCheck()
  rabbitmqCheck(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.rabbitMQHealth.isHealthy('rabbitmq'),
      () => this.rabbitMQHealth.checkPing('rabbitmq_ping'),
    ]);
  }
}
