import { Module } from '@nestjs/common';
import { ForwardController } from './forward.controller.js';

@Module({
  controllers: [ForwardController],
})
export class ForwardModule {}
