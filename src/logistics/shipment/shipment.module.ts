import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../db/orbitdb/orbitdb.module.js';
import { ShipmentController } from './shipment.controller.js';
import { ShipmentService } from './shipment.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { ParcelModule } from '../parcel/parcel.module.js';
import { LocationModule } from '../../common/location/location.module.js';
import { MissionModule } from '../mission/mission.module.js';
import { JourneyModule } from '../journey/journey.module.js';
import { ShipmentProducer } from './providers/shipment.provider.js';
import { ShipmentConsumer } from './consumers/shipment.consumer.js';
import { UserModule } from '../../users/user/user.module.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('shipment', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    UserModule,
    ParcelModule,
    LocationModule,
    MissionModule,
    JourneyModule,
  ],
  controllers: [ShipmentController],
  providers: [ShipmentService, ShipmentProducer, ShipmentConsumer],
  exports: [ShipmentService],
})
export class ShipmentModule {}
