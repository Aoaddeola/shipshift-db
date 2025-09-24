import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ContactDetailsCreateDto } from './contact-details-create.dto.js';
import { ContactDetailsService } from './contact-details.service.js';

@Controller('contact-details')
export class ContactDetailsController {
  constructor(private readonly contactDetailsService: ContactDetailsService) {}

  @Post()
  async createContactDetails(@Body() contact: ContactDetailsCreateDto) {
    return this.contactDetailsService.createContactDetails(contact);
  }

  @Get(':id')
  async getContactDetails(@Param('id') id: string) {
    return this.contactDetailsService.getContactDetails(id);
  }

  @Get('owner/:ownerId')
  async getContactDetailsForOwner(@Param('ownerId') ownerId: string) {
    return this.contactDetailsService.getContactDetailsForOwner(ownerId);
  }

  @Delete(':id')
  async deleteContactDetails(@Param('id') id: string) {
    return this.contactDetailsService.deleteContactDetails(id);
  }
}
