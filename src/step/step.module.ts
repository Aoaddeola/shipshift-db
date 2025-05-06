// src/step/step.module.ts
import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../orbitdb/orbitdb.module.js';
import { StepController } from './step.controller.js';
import { StepService } from './step.service.js';
import { IPFSAccessController } from '@orbitdb/core';

@Module({
  imports: [
    OrbitDBModule.forDatabase('step', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
  ],
  controllers: [StepController],
  providers: [StepService],
  exports: [StepService],
})
export class StepModule {}