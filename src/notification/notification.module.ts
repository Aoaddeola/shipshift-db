// notification.orbitdb.module.ts
import { Module, Global } from '@nestjs/common';
import { NotificationService } from './notification.service.js';
import { NotificationController } from './notification.controller.js';
import { OrbitDBModule } from '../db/orbitdb/orbitdb.module.js';
import { IPFSAccessController } from '@orbitdb/core';
import { NotificationConsumer } from './consumers/notification.consumer.js';
import { StepModule } from '../onchain/step/step.module.js';
import { ContactDetailsModule } from '../settings/contact-details/contact-details.module.js';
import { UserModule } from '../users/user/user.module.js';
import { StepNotificationConsumer } from './consumers/step-notification.consumer.js';
import { OfferNotificationConsumer } from './consumers/offer-notification.consumer.js';
import { OfferModule } from '../offer/offer.module.js';
import { JourneyModule } from '../logistics/journey/journey.module.js';
import { OperatorModule } from '../users/operator/operator.module.js';
import { ShipmentModule } from '../logistics/shipment/shipment.module.js';

@Global()
@Module({
  imports: [
    OrbitDBModule.forDatabase('notification-rule', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    OrbitDBModule.forDatabase('notification', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    StepModule,
    OfferModule,
    ContactDetailsModule,
    ShipmentModule,
    UserModule,
    JourneyModule,
    OperatorModule,
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationConsumer,
    StepNotificationConsumer,
    OfferNotificationConsumer,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
