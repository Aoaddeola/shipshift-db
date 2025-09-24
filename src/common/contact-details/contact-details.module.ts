import { Module } from '@nestjs/common';
import { IPFSAccessController } from '@orbitdb/core';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';
import { ContactDetailsController } from './contact-details.controller.js';
import { ContactDetailsService } from './contact-details.service.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('contact-details', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
  ],
  controllers: [ContactDetailsController],
  providers: [ContactDetailsService],
  exports: [ContactDetailsService],
})
export class ContactDetailsModule {}
