import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller.js';
import { NotificationService } from './notification.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { UserModule } from '../users/user/user.module.js';
import { OrbitDBModule } from '../db/orbitdb/orbitdb.module.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('notification', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    UserModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
