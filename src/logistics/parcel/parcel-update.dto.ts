import {
  IsString,
  IsNumber,
  Min,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Nested DTO for ParcelHandlingInfo update
export class ParcelHandlingInfoUpdateDto {
  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    example: false,
    description: 'Updated sealed status',
  })
  sealed?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    example: true,
    description: 'Updated fragile status',
  })
  fragile?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    example: false,
    description: 'Updated perishable status',
  })
  perishable?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({
    example: 3.0,
    description: 'Updated weight of the parcel in kg',
  })
  weight?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({
    example: 0.15,
    description: 'Updated size of the parcel in cubic meters',
  })
  size?: number;
}

export class ParcelUpdateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'user-456',
    description: 'Updated owner ID of the parcel',
  })
  ownerId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'Updated Laptop Name',
    description: 'Updated name of the parcel',
  })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'Updated MacBook Pro description',
    description: 'Updated description of the parcel',
  })
  description?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  @ApiPropertyOptional({
    example: 2,
    description: 'Updated quantity of items in the parcel',
    minimum: 1,
  })
  quantity?: number;

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional({
    example: ['USD', 1600],
    description:
      'Updated currency ID and value as a tuple [currencyId, amount]',
  })
  value?: [string, number];

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'https://example.com/updated-laptop.jpg',
    description: 'Updated URL of the parcel image',
  })
  image?: string;

  @ValidateNested()
  @Type(() => ParcelHandlingInfoUpdateDto)
  @IsOptional()
  @ApiPropertyOptional({ type: ParcelHandlingInfoUpdateDto })
  handlingInfo?: ParcelHandlingInfoUpdateDto;
}
