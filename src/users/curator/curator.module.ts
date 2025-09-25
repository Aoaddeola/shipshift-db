import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';
import { CuratorController } from './curator.controller.js';
import { CuratorService } from './curator.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { ContactDetailsModule } from '../../common/contact-details/contact-details.module.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('curator', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    ContactDetailsModule,
  ],
  controllers: [CuratorController],
  providers: [CuratorService],
  exports: [CuratorService],
})
export class CuratorModule {}
