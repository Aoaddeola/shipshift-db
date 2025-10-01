import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';
import { ShipmentController } from './shipment.controller.js';
import { ShipmentService } from './shipment.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { ParcelModule } from '../parcel/parcel.module.js';
import { MissionModule } from '../mission/mission.module.js';
import { JourneyModule } from '../journey/journey.module.js';
import { LocationModule } from '../../common/location/location.module.js';
import { CustomerModule } from '../../users/customer/customer.module.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('shipment', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    CustomerModule,
    ParcelModule,
    MissionModule,
    JourneyModule,
    LocationModule,
  ],
  controllers: [ShipmentController],
  providers: [ShipmentService],
  exports: [ShipmentService],
})
export class ShipmentModule {}
