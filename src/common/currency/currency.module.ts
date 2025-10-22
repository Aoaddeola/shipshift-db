// src/currency/currency.module.ts

import { Module } from '@nestjs/common';
import { CurrencyController } from './currency.controller.js';
import { CurrencyService } from './currency.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { OrbitDBModule } from '../../db/orbitdb/orbitdb.module.js';

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
