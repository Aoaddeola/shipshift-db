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
  UseGuards,
} from '@nestjs/common';
import { CurrencyService } from './currency.service.js';
import { CurrencyCreateDto } from './currency-create.dto.js';
import { CurrencyUpdateDto } from './currency-update.dto.js';
import { JwtNodeOpAuthGuard } from '../../guards/jwt-nodeOp-auth.guard.js';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @UseGuards(JwtNodeOpAuthGuard)
  @Post()
  async createCurrency(@Body() currency: CurrencyCreateDto) {
    return this.currencyService.createCurrency(currency);
  }

  @Get(':id')
  async getCurrency(@Param('id') id: string) {
    return this.currencyService.getCurrency(id);
  }

  @Get()
  async getCurrencies(
    @Query('isStableCoin') isStableCoin?: string,
    @Query('currencySymbol') currencySymbol?: string,
  ) {
    if (isStableCoin !== undefined) {
      return this.currencyService.getCurrenciesByStableCoinStatus(
        isStableCoin === 'true',
      );
    }

    if (currencySymbol) {
      return this.currencyService.getCurrencyBySymbol(currencySymbol);
    }

    return this.currencyService.getCurrencies();
  }

  @Get('stablecoin/:isStableCoin')
  async getCurrenciesByStableCoin(@Param('isStableCoin') isStableCoin: string) {
    return this.currencyService.getCurrenciesByStableCoinStatus(
      isStableCoin === 'true',
    );
  }

  @Get('symbol/:currencySymbol')
  async getCurrencyBySymbol(@Param('currencySymbol') currencySymbol: string) {
    return this.currencyService.getCurrencyBySymbol(currencySymbol);
  }

  @Get('assetClass/:assetClass')
  async getCurrencyByAssetClass(@Param('assetClass') assetClass: string) {
    return this.currencyService.getCurrencyByAssetClass(assetClass);
  }

  @UseGuards(JwtNodeOpAuthGuard)
  @Put(':id')
  async updateCurrency(
    @Param('id') id: string,
    @Body() currency: CurrencyCreateDto,
  ) {
    return this.currencyService.updateCurrency(id, currency);
  }

  @UseGuards(JwtNodeOpAuthGuard)
  @Patch(':id')
  async partialUpdateCurrency(
    @Param('id') id: string,
    @Body() update: CurrencyUpdateDto,
  ) {
    return this.currencyService.partialUpdateCurrency(id, update);
  }

  @UseGuards(JwtNodeOpAuthGuard)
  @Delete(':id')
  async deleteCurrency(@Param('id') id: string) {
    return this.currencyService.deleteCurrency(id);
  }
}
