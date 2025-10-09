import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';
import { ParcelController } from './parcel.controller.js';
import { ParcelService } from './parcel.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { CurrencyModule } from '../../common/currency/currency.module.js';
import { UserModule } from '../../users/user/user.module.js';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    OrbitDBModule.forDatabase('parcel', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    CurrencyModule,
    UserModule,
    JwtModule,
  ],
  controllers: [ParcelController],
  providers: [ParcelService],
  exports: [ParcelService],
})
export class ParcelModule {}
