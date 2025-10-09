import { Module } from '@nestjs/common';
import { IPFSAccessController } from '@orbitdb/core';
import { StepController } from './step.controller.js';
import { StepService } from './step.service.js';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    OrbitDBModule.forDatabase('step', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    JwtModule,
  ],
  controllers: [StepController],
  providers: [StepService],
  exports: [StepService],
})
export class StepModule {}
