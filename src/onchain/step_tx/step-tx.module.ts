// src/step-tx/step-tx.module.ts

import { Module } from '@nestjs/common';
import { StepTxController } from './step-tx.controller.js';
import { StepTxService } from './step-tx.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('step-tx', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
  ],
  controllers: [StepTxController],
  providers: [StepTxService],
  exports: [StepTxService],
})
export class StepTxModule {}
