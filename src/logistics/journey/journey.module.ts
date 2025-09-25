import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';
import { JourneyController } from './journey.controller.js';
import { JourneyService } from './journey.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { LocationModule } from '../../common/location/location.module.js';
import { AgentModule } from '../../users/agent/agent.module.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('journey', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    AgentModule,
    LocationModule,
  ],
  controllers: [JourneyController],
  providers: [JourneyService],
  exports: [JourneyService],
})
export class JourneyModule {}
