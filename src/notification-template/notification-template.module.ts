// notification.orbitdb.module.ts
import { Module, Global } from '@nestjs/common';
import { MessagingModule } from '../shared/messaging/messaging.module.js';
import { OrbitDBModule } from '../db/orbitdb/orbitdb.module.js';
import { IPFSAccessController } from '@orbitdb/core';
import { NotificationTemplateService } from './notification-template.service.js';
import { NotificationTemplateController } from './notification-template.controller.js';

@Global()
@Module({
  imports: [
    MessagingModule,
    OrbitDBModule.forDatabase('notification-template', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
  ],
  controllers: [NotificationTemplateController],
  providers: [NotificationTemplateService],
  exports: [NotificationTemplateService],
})
export class NotificationTemplateModule {}
