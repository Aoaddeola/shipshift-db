// src/currency/currency.module.ts

import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../orbitdb/orbitdb.module.js';
import { CurrencyController } from './currency.controller.js';
import { CurrencyService } from './currency.service.js';
import { IPFSAccessController } from '@orbitdb/core';

@Module({
  imports: [
    OrbitDBModule.forDatabase('currency', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
  ],
  controllers: [CurrencyController],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
