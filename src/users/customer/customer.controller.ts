import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Patch,
  Query,
} from '@nestjs/common';
import { CustomerService } from './customer.service.js';
import { CustomerCreateDto } from './customer-create.dto.js';
import { CustomerUpdateDto } from './customer-update.dto.js';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async createCustomer(@Body() customer: CustomerCreateDto) {
    return this.customerService.createCustomer(customer);
  }

  @Get(':id')
  async getCustomer(
    @Param('id') id: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.customerService.getCustomer(id, includeArray);
  }

  @Get()
  async getCustomers(
    @Query('contactDetailsId') contactDetailsId?: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];

    if (contactDetailsId) {
      return this.customerService.getCustomersByContactDetails(
        contactDetailsId,
        includeArray,
      );
    }
    return this.customerService.getCustomers(includeArray);
  }

  @Get('contact/:contactDetailsId')
  async getCustomersByContactDetails(
    @Param('contactDetailsId') contactDetailsId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.customerService.getCustomersByContactDetails(
      contactDetailsId,
      includeArray,
    );
  }

  @Put(':id')
  async updateCustomer(
    @Param('id') id: string,
    @Body() customer: CustomerCreateDto,
  ) {
    return this.customerService.updateCustomer(id, customer);
  }

  @Patch(':id')
  async partialUpdateCustomer(
    @Param('id') id: string,
    @Body() update: CustomerUpdateDto,
  ) {
    return this.customerService.partialUpdateCustomer(id, update);
  }

  @Delete(':id')
  async deleteCustomer(@Param('id') id: string) {
    return this.customerService.deleteCustomer(id);
  }
}
