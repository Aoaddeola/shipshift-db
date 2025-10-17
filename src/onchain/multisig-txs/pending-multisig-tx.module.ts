// src/multi-sig-tx/pending-multisig-tx.module.ts

import { Module } from '@nestjs/common';
import { MultiSigTxController } from './pending-multisig-tx.controller.js';
import { MultiSigTxService } from './pending-multisig-tx.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    OrbitDBModule.forDatabase('multi-sig-tx', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    JwtModule,
  ],
  controllers: [MultiSigTxController],
  providers: [MultiSigTxService],
  exports: [MultiSigTxService],
})
export class MultiSigTxModule {}
