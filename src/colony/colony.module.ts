// src/colony/colony.module.ts
import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../orbitdb/orbitdb.module.js';
import { ColonyController } from './colony.controller.js';
import { ColonyService } from './colony.service.js';
import { IPFSAccessController } from '@orbitdb/core';

@Module({
  imports: [
    OrbitDBModule.forDatabase('colony', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
  ],
  controllers: [ColonyController],
  providers: [ColonyService],
  exports: [ColonyService],
})
export class ColonyModule {}