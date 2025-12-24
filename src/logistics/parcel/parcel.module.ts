import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../db/orbitdb/orbitdb.module.js';
import { ParcelController } from './parcel.controller.js';
import { ParcelService } from './parcel.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { CurrencyModule } from '../../common/currency/currency.module.js';
import { UserModule } from '../../users/user/user.module.js';
import { JwtModule } from '@nestjs/jwt';
import { ParcelConsumer } from './consumers/parcel.consumer.js';
import { ParcelProducer } from './producers/parcel.producer.js';
import { MessagingModule } from '../../shared/messaging/messaging.module.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('parcel', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    CurrencyModule,
    UserModule,
    JwtModule,
    MessagingModule,
  ],
  controllers: [ParcelController],
  providers: [ParcelService, ParcelProducer, ParcelConsumer],
  exports: [ParcelService, ParcelProducer],
})
export class ParcelModule {}
