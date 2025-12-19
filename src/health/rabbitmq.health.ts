import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RabbitMQHealthIndicator extends HealthIndicator {
  constructor(private readonly rabbitService: AmqpConnection) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isHealthy =
      this.rabbitService['managedConnection']?.isConnected() || false;

    const result = this.getStatus(key, isHealthy, {
      connected: isHealthy,
      timestamp: new Date().toISOString(),
    });

    if (isHealthy) {
      return result;
    }

    throw new HealthCheckError('RabbitMQ connection failed', result);
  }

  async checkPing(key: string): Promise<HealthIndicatorResult> {
    try {
      // Try to publish a test message
      await this.rabbitService.publish('health.check', 'ping', {
        id: 'health-check',
        timestamp: new Date().toISOString(),
      });

      return this.getStatus(key, true, {
        ping: 'pong',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw new HealthCheckError(
        'RabbitMQ ping failed',
        this.getStatus(key, false, {
          error: error.message,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }
}
