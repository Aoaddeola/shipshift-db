import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../db/orbitdb/orbitdb.module.js';
import { MissionController } from './mission.controller.js';
import { MissionService } from './mission.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { JourneyModule } from '../journey/journey.module.js';
import { LocationModule } from '../../common/location/location.module.js';
import { OperatorModule } from '../../users/operator/operator.module.js';
import { JwtModule } from '@nestjs/jwt';
import { MissionProducer } from './producers/mission.producer.js';
import { MissionConsumer } from './consumers/mission.consumer.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('mission', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    OperatorModule,
    JourneyModule,
    JwtModule,
    LocationModule,
  ],
  controllers: [MissionController],
  providers: [MissionService, MissionProducer, MissionConsumer],
  exports: [MissionService],
})
export class MissionModule {}
