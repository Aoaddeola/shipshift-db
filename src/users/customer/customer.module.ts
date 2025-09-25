import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';
import { CustomerController } from './customer.controller.js';
import { CustomerService } from './customer.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { ContactDetailsModule } from '../../common/contact-details/contact-details.module.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('customer', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    ContactDetailsModule,
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
