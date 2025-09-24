// src/addresses/addresses.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ContactDetailsService } from './contact-details.service.js';
import { ContactDetailsModel } from './contact-details.model.js';
import { ContactDetailsController } from './contact-details.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([ContactDetailsModel])],
  providers: [ContactDetailsService],
  controllers: [ContactDetailsController],
  exports: [ContactDetailsService],
})
export class ContactDetailsModule {}
