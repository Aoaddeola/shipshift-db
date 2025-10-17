import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Parcel } from './parcel.types.js';

// Nested DTO for ParcelHandlingInfo
export class ParcelHandlingInfoDto {
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Whether the parcel is sealed',
  })
  sealed: boolean;

  @IsBoolean()
  @ApiProperty({
    example: false,
    description: 'Whether the parcel is fragile',
  })
  fragile: boolean;

  @IsBoolean()
  @ApiProperty({
    example: false,
    description: 'Whether the parcel is perishable',
  })
  perishable: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({
    example: 2.5,
    description: 'Weight of the parcel in kg',
  })
  weight?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({
    example: 0.1,
    description: 'Size of the parcel in cubic meters',
  })
  size?: number;
}

export class ParcelCreateDto
  implements Omit<Parcel, 'id' | 'createdAt' | 'updatedAt'>
{
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'user-123',
    description: 'ID of the owner of the parcel',
  })
  ownerId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Laptop',
    description: 'Name of the parcel',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'New MacBook Pro',
    description: 'Description of the parcel',
  })
  description: string;

  @IsNumber()
  @Min(1)
  @ApiProperty({
    example: 1,
    description: 'Quantity of items in the parcel',
    minimum: 1,
  })
  quantity: number;

  @IsArray()
  // @IsString({ each: false })
  @ApiProperty({
    example: ['USD', 1500],
    description: 'Currency ID and value as a tuple [currencyId, amount]',
  })
  value: [string, number];

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'https://example.com/laptop.jpg',
    description: 'URL of the parcel image',
  })
  image?: string;

  @ValidateNested()
  @Type(() => ParcelHandlingInfoDto)
  @ApiProperty({ type: ParcelHandlingInfoDto })
  handlingInfo: ParcelHandlingInfoDto;
}
