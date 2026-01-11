import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BankAccountController } from './bank-account.controller.js';
import { BankAccountService } from './bank-account.service.js';
import { JwtModule } from '@nestjs/jwt';
import { BankAccountModel } from './bank-account.model.js';
import { ColonyNodeModule } from '../../onchain/colony-node/colony-node.module.js';

@Module({
  imports: [
    SequelizeModule.forFeature([BankAccountModel]),
    JwtModule,
    ColonyNodeModule,
  ],
  controllers: [BankAccountController],
  providers: [BankAccountService],
  exports: [BankAccountService],
})
export class BankAccountModule {}
