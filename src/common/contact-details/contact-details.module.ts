import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ContactDetailsController } from './contact-details.controller.js';
import { ContactDetailsService } from './contact-details.service.js';
import { JwtModule } from '@nestjs/jwt';
import { ContactDetailsModel } from './contact-details.model.js';
import { ColonyNodeModule } from '../../onchain/colony-node/colony-node.module.js';

@Module({
  imports: [
    SequelizeModule.forFeature([ContactDetailsModel]),
    JwtModule,
    ColonyNodeModule,
  ],
  controllers: [ContactDetailsController],
  providers: [ContactDetailsService],
  exports: [ContactDetailsService],
})
export class ContactDetailsModule {}
