// src/currency/currency-create.dto.ts

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from './types.js';

export class CurrencyCreateDto implements Omit<Currency, 'id'> {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'ADA',
    description: 'Currency symbol (e.g., USD, ADA)',
  })
  currencySymbol: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'lovelace',
    description: 'Token name (e.g., lovelace for ADA)',
  })
  tokenName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Cardano',
    description: 'User-friendly name of the currency',
  })
  userFriendlyName: string;
}
