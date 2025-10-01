import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
  ArrayNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Location } from './location.types.js';

export class LocationCreateDto
  implements Omit<Location, 'id' | 'createdAt' | 'updatedAt'>
{
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({
    example: 'Office',
    description: 'Location name',
    minLength: 2,
    maxLength: 100,
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({
    example: '123 Main St',
    description: 'Street address',
    minLength: 2,
    maxLength: 100,
  })
  street: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({
    example: 'New York',
    description: 'City name',
    minLength: 2,
    maxLength: 50,
  })
  city: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({
    example: 'NY',
    description: 'State or province',
    minLength: 2,
    maxLength: 50,
  })
  state: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    example: 10001,
    description: 'Postal or ZIP code (optional)',
  })
  postalCode?: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({
    example: 'USA',
    description: 'Country name',
    minLength: 2,
    maxLength: 50,
  })
  country: string;

  @ValidateNested()
  @Type(() => Array)
  @ArrayNotEmpty()
  @ApiProperty({
    example: [-74.006, 40.7128],
    description: 'Longitude and latitude coordinates',
  })
  coordinates: [number, number];
}
