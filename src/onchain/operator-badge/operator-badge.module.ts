import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';
import { OperatorBadgeController } from './operator-badge.controller.js';
import { OperatorBadgeService } from './operator-badge.service.js';
import { IPFSAccessController } from '@orbitdb/core';

@Module({
  imports: [
    OrbitDBModule.forDatabase('operator-badge', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
  ],
  controllers: [OperatorBadgeController],
  providers: [OperatorBadgeService],
  exports: [OperatorBadgeService],
})
export class OperatorBadgeModule {}
