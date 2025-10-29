import { Module } from '@nestjs/common';
import { TaskValidationService } from './task-validation.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { OrbitDBModule } from '../../db/orbitdb/orbitdb.module.js';
import { UserModule } from '../../users/user/user.module.js';
import { LocationModule } from '../../common/location/location.module.js';
import { JourneyModule } from '../../logistics/journey/journey.module.js';
import { OperatorModule } from '../../users/operator/operator.module.js';
import { StepModule } from '../../onchain/step/step.module.js';
import { ShipmentModule } from '../../logistics/shipment/shipment.module.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('task-validation', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    UserModule,
    LocationModule,
    JourneyModule,
    OperatorModule,
    StepModule,
    ShipmentModule,
  ],
  controllers: [],
  providers: [TaskValidationService],
  exports: [TaskValidationService],
})
export class TaskValidationModule {}
