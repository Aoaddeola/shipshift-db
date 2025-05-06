// src/colony-badge/colony-badge.module.ts

import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../orbitdb/orbitdb.module.js';
import { ColonyBadgeController } from './badge.controller.js';
import { ColonyBadgeService } from './badge.service.js';
import { IPFSAccessController } from '@orbitdb/core';

@Module({
  imports: [
    OrbitDBModule.forDatabase('colony-badge', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
  ],
  controllers: [ColonyBadgeController],
  providers: [ColonyBadgeService],
  exports: [ColonyBadgeService],
})
export class ColonyBadgeModule {}