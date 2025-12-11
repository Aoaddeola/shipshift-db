import { Module } from '@nestjs/common';
import { IPFSAccessController } from '@orbitdb/core';
import { OrbitDBModule } from '../db/orbitdb/orbitdb.module.js';
import { AgentMPFProofController } from './agent-mpf-proof.controller.js';
import { AgentMPFProofService } from './agent-mpf-proof.service.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('agent-mpf-proof', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
  ],
  controllers: [AgentMPFProofController],
  providers: [AgentMPFProofService],
  exports: [AgentMPFProofService],
})
export class AgentMPFProofModule {}
