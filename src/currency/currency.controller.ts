// src/sp-cost/sp-cost.controller.ts

import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CurrencyService } from './currency.service.js';
import { CurrencyCreateDto } from './currency-create.dto.js';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post()
  async createCurrency(@Body() currency: CurrencyCreateDto) {
    return this.currencyService.createCurrency(currency);
  }

  @Get(':id')
  async getCurrency(@Param('id') id: string) {
    return this.currencyService.getCurrency(id);
  }

  @Get(':id')
  async getValByCurrency(@Param('id') id: string) {
    return this.currencyService.currencyToGYValue(id);
  }

  @Get()
  async getCurrencys() {
    return this.currencyService.getCurrencys();
  }

  @Delete(':id')
  async deleteCurrency(@Param('id') id: string) {
    return this.currencyService.deleteCurrency(id);
  }
}
