import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';
import { StepController } from './step.controller.js';
import { StepService } from './step.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { ShipmentModule } from '../../logistics/shipment/shipment.module.js';
import { JourneyModule } from '../../logistics/journey/journey.module.js';
import { OperatorModule } from '../../users/operator/operator.module.js';
import { ColonyNodeModule } from '../colony-node/colony-node.module.js';
import { UserModule } from '../../users/user/user.module.js';
import { AgentModule } from '../../profiles/agent/agent.module.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('step', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    ShipmentModule,
    JourneyModule,
    OperatorModule,
    ColonyNodeModule,
    AgentModule,
    UserModule,
  ],
  controllers: [StepController],
  providers: [StepService],
  exports: [StepService],
})
export class StepModule {}
