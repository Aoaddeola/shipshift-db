// src/addresses/controllers/addresses.controller.ts
import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ContactDetailsService } from './contact-details.service.js';
import { ContactDetailsModel } from './contact-details.model.js';
import { ContactDetails } from './contact-details.types.js';

@Controller('contact-details')
export class ContactDetailsController {
  constructor(private readonly contactDetailsService: ContactDetailsService) {}

  @Post()
  create(@Body() dto: ContactDetails): Promise<ContactDetailsModel> {
    return this.contactDetailsService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ContactDetailsModel | null> {
    return this.contactDetailsService.findOne(id);
  }

  @Get()
  findAll(): Promise<ContactDetailsModel[]> {
    return this.contactDetailsService.findAll();
  }

  @Put()
  updateOne(@Body() dto: ContactDetails): Promise<[affectedCount: number]> {
    return this.contactDetailsService.update(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.contactDetailsService.remove(id);
  }
}
