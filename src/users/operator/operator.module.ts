import { Module } from '@nestjs/common';
import { IPFSAccessController } from '@orbitdb/core';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';
import { OperatorController } from './operator.controller.js';
import { OperatorService } from './operator.service.js';
import { ContactDetailsModule } from '../../common/contact-details/contact-details.module.js';

@Module({
  imports: [
    ContactDetailsModule,
    OrbitDBModule.forDatabase('operator', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
  ],
  controllers: [OperatorController],
  providers: [OperatorService],
  exports: [OperatorService],
})
export class OperatorModule {}
