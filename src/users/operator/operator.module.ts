import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';
import { OperatorController } from './operator.controller.js';
import { OperatorService } from './operator.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { ContactDetailsModule } from '../../common/contact-details/contact-details.module.js';
import { ColonyNodeModule } from '../../onchain/colony-node/colony-node.module.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('operator', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    ContactDetailsModule,
    ColonyNodeModule,
  ],
  controllers: [OperatorController],
  providers: [OperatorService],
  exports: [OperatorService],
})
export class OperatorModule {}
