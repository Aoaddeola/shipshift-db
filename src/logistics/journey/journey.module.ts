import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../db/orbitdb/orbitdb.module.js';
import { JourneyController } from './journey.controller.js';
import { JourneyService } from './journey.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { LocationModule } from '../../common/location/location.module.js';
import { AgentModule } from '../../profiles/agent/agent.module.js';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    OrbitDBModule.forDatabase('journey', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    AgentModule,
    LocationModule,
    JwtModule,
  ],
  controllers: [JourneyController],
  providers: [JourneyService],
  exports: [JourneyService],
})
export class JourneyModule {}
