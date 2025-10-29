import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CurrencyUpdateDto {
  @IsString()
  @IsOptional()
  @MaxLength(10)
  @ApiPropertyOptional({
    example: 'USDT',
    description: 'Updated currency symbol',
    maxLength: 56,
  })
  currencySymbol?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  @ApiPropertyOptional({
    example: 'USDC',
    description: 'Updated token name',
    maxLength: 50,
  })
  tokenName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  @ApiPropertyOptional({
    example: 'US Dollar Coin',
    description: 'Updated user-friendly name',
    maxLength: 50,
  })
  userFriendlyName?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    example: false,
    description: 'Updated stablecoin status',
  })
  isStableCoin?: boolean;
}
