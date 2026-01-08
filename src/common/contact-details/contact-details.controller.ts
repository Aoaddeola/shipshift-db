import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ContactDetailsService } from './contact-details.service.js';
import { ContactDetailsModel } from './contact-details.model.js';
import { ContactDetails } from './contact-details.types.js';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('contact-details')
export class ContactDetailsController {
  constructor(private readonly contactDetailsService: ContactDetailsService) {}

  @Post()
  async create(
    @Body()
    contactDetails: Omit<ContactDetails, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ContactDetailsModel> {
    return this.contactDetailsService.create(contactDetails);
  }

  @Get()
  async findAll(): Promise<ContactDetailsModel[]> {
    return this.contactDetailsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ContactDetailsModel> {
    return this.contactDetailsService.findOne(id);
  }

  @Get('owner/:ownerId')
  async findByOwner(
    @Param('ownerId') ownerId: string,
  ): Promise<ContactDetailsModel[]> {
    return this.contactDetailsService.findByOwner(ownerId);
  }

  @Get('session/:session')
  async findBySession(
    @Param('session') session: string,
  ): Promise<ContactDetailsModel> {
    return this.contactDetailsService.findBySession(session);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() contactDetails: Partial<ContactDetails>,
    @Req() request,
  ): Promise<ContactDetailsModel> {
    if (request.user.sub !== contactDetails.ownerId) {
      throw new ForbiddenException(
        'You are not authorized to make modifications',
      );
    }
    return this.contactDetailsService.update(id, contactDetails);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.contactDetailsService.remove(id);
  }
}
