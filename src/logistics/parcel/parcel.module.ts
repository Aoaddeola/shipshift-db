import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';
import { ParcelController } from './parcel.controller.js';
import { ParcelService } from './parcel.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { CurrencyModule } from '../../common/currency/currency.module.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('parcel', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    CurrencyModule,
  ],
  controllers: [ParcelController],
  providers: [ParcelService],
  exports: [ParcelService],
})
export class ParcelModule {}
