import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../db/orbitdb/orbitdb.module.js';
import { MultiSigTxController } from './multi-sig-tx.controller.js';
import { MultiSigTxService } from './multi-sig-tx.service.js';
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
