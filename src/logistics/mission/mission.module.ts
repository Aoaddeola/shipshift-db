import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';
import { MissionController } from './mission.controller.js';
import { MissionService } from './mission.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { JourneyModule } from '../journey/journey.module.js';
import { CuratorModule } from '../../users/curator/curator.module.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('mission', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    CuratorModule,
    JourneyModule,
  ],
  controllers: [MissionController],
  providers: [MissionService],
  exports: [MissionService],
})
export class MissionModule {}
