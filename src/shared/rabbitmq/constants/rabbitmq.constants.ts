export const RABBITMQ_CONFIG_TOKEN = 'RABBITMQ_CONFIG';
export const RABBITMQ_SERVICE_TOKEN = 'RABBITMQ_SERVICE';

export const EXCHANGES = {
  EVENTS: 'app.events',
  DIRECT: 'app.direct',
  DLX: 'app.dlx',
} as const;

export const ROUTING_KEYS = {
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_CANCELLED: 'order.cancelled',
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  PAYMENT_PROCESSED: 'payment.processed',
  PAYMENT_FAILED: 'payment.failed',
} as const;

export const QUEUES = {
  ORDER_EVENTS: 'order.events.queue',
  USER_EVENTS: 'user.events.queue',
  PAYMENT_EVENTS: 'payment.events.queue',
  RPC_GET_USER: 'rpc.get.user.queue',
  RPC_CREATE_ORDER: 'rpc.create.order.queue',
} as const;

export const RPC_COMMANDS = {
  GET_USER: 'rpc.get.user',
  CREATE_ORDER: 'rpc.create.order',
  GET_ORDER: 'rpc.get.order',
  VALIDATE_PAYMENT: 'rpc.validate.payment',
} as const;
