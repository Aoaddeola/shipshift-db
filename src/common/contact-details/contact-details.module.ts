import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ContactDetailsController } from './contact-details.controller.js';
import { ContactDetailsService } from './contact-details.service.js';
import { JwtModule } from '@nestjs/jwt';
import { ContactDetailsModel } from './contact-details.model.js';

@Module({
  imports: [SequelizeModule.forFeature([ContactDetailsModel]), JwtModule],
  controllers: [ContactDetailsController],
  providers: [ContactDetailsService],
  exports: [ContactDetailsService],
})
export class ContactDetailsModule {}
