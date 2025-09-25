import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';
import { ShipmentController } from './shipment.controller.js';
import { ShipmentService } from './shipment.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { MissionModule } from '../mission/mission.module.js';
import { StepModule } from '../../onchain/step/step.module.js';
import { CustomerModule } from '../../users/customer/customer.module.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('shipment', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    MissionModule,
    StepModule,
    CustomerModule,
  ],
  controllers: [ShipmentController],
  providers: [ShipmentService],
  exports: [ShipmentService],
})
export class ShipmentModule {}
