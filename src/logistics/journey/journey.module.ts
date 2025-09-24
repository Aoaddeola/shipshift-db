import { Module } from '@nestjs/common';
import { IPFSAccessController } from '@orbitdb/core';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';
import { JourneyController } from './journey.controller.js';
import { JourneyService } from './journey.service.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('journey', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
  ],
  controllers: [JourneyController],
  providers: [JourneyService],
  exports: [JourneyService],
})
export class JourneyModule {}
