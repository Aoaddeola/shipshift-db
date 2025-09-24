import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../orbitdb/orbitdb.module.js';
import { ColonyNodeController } from './colony-node.controller.js';
import { ColonyNodeService } from './colony-node.service.js';
import { IPFSAccessController } from '@orbitdb/core';

@Module({
  imports: [
    OrbitDBModule.forDatabase('colony-node', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
  ],
  controllers: [ColonyNodeController],
  providers: [ColonyNodeService],
  exports: [ColonyNodeService],
})
export class ColonyNodeModule {}
