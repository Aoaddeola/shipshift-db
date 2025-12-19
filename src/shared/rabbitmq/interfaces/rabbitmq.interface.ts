export interface RabbitMQConfig {
  uri: string;
  exchange: string;
  directExchange: string;
  prefetchCount: number;
  reconnectDelay: number;
}

export interface QueueOptions {
  durable?: boolean;
  exclusive?: boolean;
  autoDelete?: boolean;
  deadLetterExchange?: string;
  deadLetterRoutingKey?: string;
  messageTtl?: number;
  maxLength?: number;
}

export interface SubscribeOptions {
  exchange: string;
  routingKey: string | string[];
  queue: string;
  queueOptions?: QueueOptions;
  errorHandler?: (channel: any, msg: any, error: any) => void;
  allowNonJsonMessages?: boolean;
}

export interface RPCOptions {
  exchange: string;
  routingKey: string;
  queue: string;
  queueOptions?: QueueOptions;
  timeout?: number;
}

export interface MessageHeaders {
  'x-correlation-id'?: string;
  'x-message-id'?: string;
  'x-timestamp'?: string;
  'x-service'?: string;
  'x-version'?: string;
  'x-retry-count'?: number;
}
