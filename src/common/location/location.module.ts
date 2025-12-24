import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../db/orbitdb/orbitdb.module.js';
import { LocationController } from './location.controller.js';
import { LocationService } from './location.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { UserModule } from '../../users/user/user.module.js';
import { JwtModule } from '@nestjs/jwt';
import { LocationProducer } from './producers/location.producer.js';
import { LocationConsumer } from './consumers/location.consumer.js';
import { MessagingModule } from '../../shared/messaging/messaging.module.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('location', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    UserModule,
    JwtModule,
    MessagingModule,
  ],
  controllers: [LocationController],
  providers: [LocationService, LocationProducer, LocationConsumer],
  exports: [LocationService, LocationProducer],
})
export class LocationModule {}
