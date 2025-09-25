import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ContactDetailsController } from './contact-details.controller.js';
import { ContactDetailsModel } from './contact-details.model.js';
import { ContactDetailsService } from './contact-details.service.js';

@Module({
  imports: [SequelizeModule.forFeature([ContactDetailsModel])],
  controllers: [ContactDetailsController],
  providers: [ContactDetailsService],
  exports: [ContactDetailsService],
})
export class ContactDetailsModule {}
