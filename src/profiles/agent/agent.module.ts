import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';
import { AgentController } from './agent.controller.js';
import { AgentService } from './agent.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { OperatorModule } from '../../users/operator/operator.module.js';
import { UserModule } from '../../users/user/user.module.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('agent', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    OperatorModule,
    UserModule,
  ],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
