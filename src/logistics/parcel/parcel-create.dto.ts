import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsUrl,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Parcel } from './parcel.types.js';

export class ParcelCreateDto implements Omit<Parcel, 'id'> {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  @ApiProperty({
    example: 'Standard Package',
    description: 'Name of the parcel',
    minLength: 3,
    maxLength: 100,
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  @ApiProperty({
    example: 'Standard shipping package for general items',
    description: 'Description of the parcel',
    minLength: 10,
    maxLength: 500,
  })
  description: string;

  @IsUrl({ require_tld: true, protocols: ['http', 'https'] })
  @IsOptional()
  @ApiPropertyOptional({
    example: 'https://example.com/parcel.jpg',
    description: 'URL of the parcel image',
  })
  image?: string;
}
