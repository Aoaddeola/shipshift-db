import { Injectable, Logger, Inject } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { v4 as uuidv4 } from 'uuid';
import { RabbitMQConfig } from './config/rabbitmq.config.js';

@Injectable()
export class MessageBusService {
  private readonly logger = new Logger(MessageBusService.name);

  constructor(
    private readonly rabbitService: AmqpConnection,
    @Inject('RABBITMQ_CONFIG') private readonly config: any,
  ) {}

  async emitEvent<T>(
    routingKey: string,
    payload: T,
    options?: {
      exchange?: string;
      headers?: Record<string, any>;
      correlationId?: string;
    },
  ): Promise<boolean> {
    const message = {
      id: uuidv4(),
      type: routingKey,
      timestamp: new Date().toISOString(),
      data: payload,
      source: process.env.APP_NAME || 'nestjs-app',
      version: '1.0',
    };

    try {
      await this.rabbitService.publish(
        options?.exchange || RabbitMQConfig.EXCHANGES.APP_EVENTS,
        routingKey,
        message,
        {
          correlationId: options?.correlationId || uuidv4(),
          persistent: true,
          headers: {
            'x-message-type': 'event',
            'x-routing-key': routingKey,
            'x-source-service': process.env.APP_NAME || 'nestjs-app',
            'x-message-version': '1.0',
            ...options?.headers,
          },
        },
      );

      this.logger.debug(`Published event: ${routingKey} [${message.id}]`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to publish event ${routingKey}:`, error);
      throw error;
    }
  }

  async sendCommand<T>(
    routingKey: string,
    payload: T,
    options?: {
      exchange?: string;
      headers?: Record<string, any>;
      correlationId?: string;
    },
  ): Promise<boolean> {
    const message = {
      id: uuidv4(),
      type: routingKey,
      timestamp: new Date().toISOString(),
      data: payload,
      source: process.env.APP_NAME || 'nestjs-app',
      version: '1.0',
    };

    try {
      await this.rabbitService.publish(
        options?.exchange || RabbitMQConfig.EXCHANGES.APP_COMMANDS,
        routingKey,
        message,
        {
          correlationId: options?.correlationId || uuidv4(),
          persistent: true,
          headers: {
            'x-message-type': 'command',
            'x-routing-key': routingKey,
            'x-source-service': process.env.APP_NAME || 'nestjs-app',
            'x-command-id': message.id,
            ...options?.headers,
          },
        },
      );

      this.logger.debug(`Sent command: ${routingKey} [${message.id}]`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send command ${routingKey}:`, error);
      throw error;
    }
  }

  async sendRPC<T = any, R = any>(
    routingKey: string,
    payload: T,
    options?: {
      exchange?: string;
      timeout?: number;
      correlationId?: string;
      headers?: Record<string, any>;
    },
  ): Promise<R> {
    try {
      const response = await this.rabbitService.request<R>({
        exchange: options?.exchange || RabbitMQConfig.EXCHANGES.APP_RPC,
        routingKey,
        payload,
        timeout: options?.timeout || 10000,
        correlationId: options?.correlationId || uuidv4(),
        headers: {
          'x-message-type': 'rpc_request',
          'x-routing-key': routingKey,
          'x-source-service': process.env.APP_NAME || 'nestjs-app',
          'x-request-id': uuidv4(),
          ...options?.headers,
        },
      });

      return response;
    } catch (error) {
      this.logger.error(`RPC call to ${routingKey} failed:`, error);
      throw error;
    }
  }
}
