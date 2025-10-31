import { IsString, IsNotEmpty, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from './currency.types.js';

export class CurrencyCreateDto
  implements Omit<Currency, 'id' | 'createdAt' | 'updatedAt'>
{
  @IsString()
  @IsNotEmpty()
  @MaxLength(56)
  @ApiProperty({
    example: 'USD',
    description: 'Currency symbol (e.g., USD, EUR, BTC)',
    maxLength: 56,
  })
  currencySymbol: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({
    example: 'USDT',
    description: 'Token name (e.g., USDT, ETH)',
    maxLength: 50,
  })
  tokenName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({
    example: 'US Dollar Tether',
    description: 'User-friendly name for the currency',
    maxLength: 50,
  })
  userFriendlyName: string;

  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Whether this currency is a stablecoin',
  })
  isStableCoin: boolean;
}
