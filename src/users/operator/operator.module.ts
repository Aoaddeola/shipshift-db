import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../../db/orbitdb/orbitdb.module.js';
import { OperatorController } from './operator.controller.js';
import { OperatorService } from './operator.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { ColonyNodeModule } from '../../onchain/colony-node/colony-node.module.js';
import { OperatorBadgeModule } from '../../onchain/operator-badge/operator-badge.module.js';
import { JwtModule } from '@nestjs/jwt';
import { ContactDetailsModule } from '../../settings/contact-details/contact-details.module.js';

@Module({
  imports: [
    OrbitDBModule.forDatabase('operator', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    ColonyNodeModule,
    OperatorBadgeModule,
    ContactDetailsModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'secret_key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [OperatorController],
  providers: [OperatorService],
  exports: [OperatorService],
})
export class OperatorModule {}
