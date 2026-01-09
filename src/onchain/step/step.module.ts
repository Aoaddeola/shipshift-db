import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../db/orbitdb/orbitdb.module.js';
import { StepController } from './step.controller.js';
import { StepService } from './step.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { ShipmentModule } from '../../logistics/shipment/shipment.module.js';
import { JourneyModule } from '../../logistics/journey/journey.module.js';
import { OperatorModule } from '../../users/operator/operator.module.js';
import { ColonyNodeModule } from '../colony-node/colony-node.module.js';
import { UserModule } from '../../users/user/user.module.js';
import { AgentModule } from '../../profiles/agent/agent.module.js';
import { StepConsumer } from './consumers/step.consumer.js';
import { StepProducer } from './producers/step.producer.js';
import { StepFactory } from './step.factory.js';
import { OperatorBadgeModule } from '../operator-badge/operator-badge.module.js';
import { ContactDetailsModule } from '../../common/contact-details/contact-details.module.js';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    OrbitDBModule.forDatabase('step', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    ShipmentModule,
    JourneyModule,
    OperatorModule,
    OperatorBadgeModule,
    OperatorModule,
    ColonyNodeModule,
    AgentModule,
    UserModule,
    ContactDetailsModule,
    JwtModule,
  ],
  controllers: [StepController],
  providers: [StepConsumer, StepService, StepProducer, StepFactory],
  exports: [StepService, StepConsumer],
})
export class StepModule {}
