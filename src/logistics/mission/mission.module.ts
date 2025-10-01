import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';
import { MissionController } from './mission.controller.js';
import { MissionService } from './mission.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { JourneyModule } from '../journey/journey.module.js';
import { LocationModule } from '../../common/location/location.module.js';
import { OperatorModule } from '../../users/operator/operator.module.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('mission', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    OperatorModule,
    JourneyModule,
    LocationModule,
  ],
  controllers: [MissionController],
  providers: [MissionService],
  exports: [MissionService],
})
export class MissionModule {}
