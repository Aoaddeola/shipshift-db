// src/sp-cost/sp-cost-create.dto.ts

import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from './types.js';

export class CurrencyCreateDto implements Omit<Currency, 'id'> {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'fiat', description: 'Asset class category' })
  assetClass: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'USD',
    description: 'Currency symbol (e.g., USD, EUR)',
  })
  currencySymbol: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'US Dollar',
    description: 'Full name of the currency',
  })
  name: string;

  @ApiProperty({ description: 'Currency quantity' })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
