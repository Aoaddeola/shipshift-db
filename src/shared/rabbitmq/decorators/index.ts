import { SetMetadata } from '@nestjs/common';

export const RABBIT_HANDLER = 'RABBIT_HANDLER';
export const RABBIT_SUBSCRIBE = 'RABBIT_SUBSCRIBE';
export const RABBIT_RPC = 'RABBIT_RPC';

export const RabbitHandler = (options: any) =>
  SetMetadata(RABBIT_HANDLER, options);

export const RabbitSubscribe = (options: any) =>
  SetMetadata(RABBIT_SUBSCRIBE, options);

export const RabbitRPC = (options: any) => SetMetadata(RABBIT_RPC, options);
