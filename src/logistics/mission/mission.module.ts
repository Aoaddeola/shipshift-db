import { Module } from '@nestjs/common';
import { IPFSAccessController } from '@orbitdb/core';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';
import { MissionController } from './mission.controller.js';
import { MissionService } from './mission.service.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('mission', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
  ],
  controllers: [MissionController],
  providers: [MissionService],
  exports: [MissionService],
})
export class MissionModule {}
