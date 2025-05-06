// src/operator/operator.module.ts

import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../orbitdb/orbitdb.module.js';
import { OperatorController } from './operator.controller.js';
import { OperatorService } from './operator.service.js';
import { IPFSAccessController } from '@orbitdb/core';

@Module({
  imports: [
    OrbitDBModule.forDatabase('operator', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
  ],
  controllers: [OperatorController],
  providers: [OperatorService],
  exports: [OperatorService],
})
export class OperatorModule {}
