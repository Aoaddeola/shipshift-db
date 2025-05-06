// src/multi-sig-tx/pending-multisig-tx.module.ts

import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../orbitdb/orbitdb.module.js';
import { MultiSigTxController } from './pending-multisig-tx.controller.js';
import { MultiSigTxService } from './pending-multisig-tx.service.js';
import { IPFSAccessController } from '@orbitdb/core';

@Module({
  imports: [
    OrbitDBModule.forDatabase('multi-sig-tx', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
  ],
  controllers: [MultiSigTxController],
  providers: [MultiSigTxService],
  exports: [MultiSigTxService],
})
export class MultiSigTxModule {}