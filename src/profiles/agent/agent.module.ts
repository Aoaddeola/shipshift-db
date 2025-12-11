import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../db/orbitdb/orbitdb.module.js';
import { AgentController } from './agent.controller.js';
import { AgentService } from './agent.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { UserModule } from '../../users/user/user.module.js';
import { OperatorModule } from '../../users/operator/operator.module.js';
import { JwtModule } from '@nestjs/jwt';
import { AgentMPFProofModule } from '../../agent-mpf-proof/agent-mpf-proof.module.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('agent', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    OperatorModule,
    UserModule,
    JwtModule,
    AgentMPFProofModule,
  ],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
