import { Module } from '@nestjs/common';
import { CurrencyController } from './currency.controller.js';
import { CurrencyService } from './currency.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { OrbitDBModule } from '../../db/orbitdb/orbitdb.module.js';
import { JwtModule } from '@nestjs/jwt';
import { ColonyNodeModule } from '../../onchain/colony-node/colony-node.module.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('currency', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    JwtModule,
    ColonyNodeModule,
  ],
  controllers: [CurrencyController],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
