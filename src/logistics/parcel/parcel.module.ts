import { Module } from '@nestjs/common';
import { IPFSAccessController } from '@orbitdb/core';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';
import { ParcelController } from './parcel.controller.js';
import { ParcelService } from './parcel.service.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('parcel', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
  ],
  controllers: [ParcelController],
  providers: [ParcelService],
  exports: [ParcelService],
})
export class ParcelModule {}
