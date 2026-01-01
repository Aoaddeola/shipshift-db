// notification.orbitdb.module.ts
import { Module, Global } from '@nestjs/common';
import { MessagingModule } from '../shared/messaging/messaging.module.js';
import { OrbitDBNotificationService } from './notification.service.js';
import { NotificationOrbitDBController } from './notification.controller.js';
import { OrbitDBModule } from '../db/orbitdb/orbitdb.module.js';
import { IPFSAccessController } from '@orbitdb/core';
import { NotificationConsumerService } from './notification-consumer.service.js';

@Global()
@Module({
  imports: [
    MessagingModule,
    OrbitDBModule.forDatabase('notification-template', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    OrbitDBModule.forDatabase('notification-rule', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    OrbitDBModule.forDatabase('notification', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
  ],
  controllers: [NotificationOrbitDBController],
  providers: [OrbitDBNotificationService, NotificationConsumerService],
  exports: [OrbitDBNotificationService],
})
export class NotificationOrbitDBModule {}
