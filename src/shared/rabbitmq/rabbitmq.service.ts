/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, Logger, Inject } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { v4 as uuidv4 } from 'uuid';
import { AppConfigService } from '../../config/config.service.js';

export interface RabbitMessage<T = any> {
  id: string;
  type: string;
  timestamp: string;
  data: T;
  source: string;
  version: string;
}

export interface PublishOptions {
  exchange?: string;
  routingKey?: string;
  persistent?: boolean;
  correlationId?: string;
  headers?: Record<string, any>;
  timeout?: number;
}

@Injectable()
export class MessageBusService {
  private readonly logger = new Logger(MessageBusService.name);
  private readonly defaultExchange: string;

  constructor(
    private readonly rabbitService: AmqpConnection,
    @Inject('RABBITMQ_CONFIG') private readonly config: any,
    private readonly appConfig: AppConfigService,
  ) {
    this.defaultExchange = this.appConfig.rabbitmqExchange;
  }

  async publish<T>(
    eventType: string,
    payload: T,
    options?: PublishOptions,
  ): Promise<boolean> {
    const message: RabbitMessage<T> = {
      id: uuidv4(),
      type: eventType,
      timestamp: new Date().toISOString(),
      data: payload,
      source: this.appConfig.appName,
      version: '1.0',
    };

    try {
      await this.rabbitService.publish(
        options?.exchange || this.defaultExchange,
        options?.routingKey || eventType,
        message,
        {
          correlationId: options?.correlationId || uuidv4(),
          persistent: options?.persistent ?? true,
          headers: {
            'x-message-version': '1.0',
            'x-service': this.appConfig.appName,
            'x-timestamp': new Date().toISOString(),
            'x-environment': this.appConfig.nodeEnv,
            ...options?.headers,
          },
        },
      );

      this.logger.debug(`Published event: ${eventType} [${message.id}]`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to publish event ${eventType}:`, error);

      // In production, you might want to implement a retry mechanism
      if (this.appConfig.isProduction) {
        // Implement retry logic or send to dead letter queue
        this.logger.warn(`Event ${eventType} failed in production environment`);
      }

      throw error;
    }
  }
  async sendRPC<T = any, R = any>(
    queue: string,
    payload: T,
    options?: {
      timeout?: number;
      correlationId?: string;
    },
  ): Promise<R> {
    try {
      const response = await this.rabbitService.request<R>({
        exchange: '',
        routingKey: queue,
        payload,
        timeout: options?.timeout || 10000,
        correlationId: options?.correlationId || uuidv4(),
      });

      return response;
    } catch (error) {
      this.logger.error(`RPC call to ${queue} failed:`, error);
      throw error;
    }
  }

  async emitEvent<T>(eventType: string, payload: T): Promise<boolean> {
    return this.publish(eventType, payload, {
      exchange: this.defaultExchange,
    });
  }

  async sendCommand<T>(command: string, payload: T): Promise<boolean> {
    return this.publish(`command.${command}`, payload, {
      exchange: 'app.direct',
      routingKey: command,
    });
  }
}
