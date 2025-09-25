import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';
import { AgentController } from './agent.controller.js';
import { AgentService } from './agent.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { ContactDetailsModule } from '../../common/contact-details/contact-details.module.js';
import { OperatorModule } from '../operator/operator.module.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('agent', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    ContactDetailsModule,
    OperatorModule,
  ],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
