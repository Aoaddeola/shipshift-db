import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';
import { LocationController } from './location.controller.js';
import { LocationService } from './location.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { UserModule } from '../../users/user/user.module.js';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    OrbitDBModule.forDatabase('location', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    UserModule,
    JwtModule,
  ],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}
