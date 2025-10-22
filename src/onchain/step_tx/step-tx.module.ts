// src/step-tx/step-tx.module.ts

import { Module } from '@nestjs/common';
import { StepTxController } from './step-tx.controller.js';
import { StepTxService } from './step-tx.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { OrbitDBModule } from '../../db/orbitdb/orbitdb.module.js';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    OrbitDBModule.forDatabase('step-tx', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    JwtModule,
  ],
  controllers: [StepTxController],
  providers: [StepTxService],
  exports: [StepTxService],
})
export class StepTxModule {}
