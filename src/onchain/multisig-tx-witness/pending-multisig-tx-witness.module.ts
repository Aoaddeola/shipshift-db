// src/pending-multisig-tx-witness/pending-multisig-tx-witness.module.ts

import { Module } from '@nestjs/common';
import { MultiSigWitnessController } from './pending-multisig-tx-witness.controller.js';
import { MultiSigWitnessService } from './pending-multisig-tx-witness.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('pending-multisig-tx-witness', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
  ],
  controllers: [MultiSigWitnessController],
  providers: [MultiSigWitnessService],
  exports: [MultiSigWitnessService],
})
export class MultiSigWitnessModule {}
