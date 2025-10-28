import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Location } from './location.types.js';

// Nested DTO for Coordinates
export class CoordinatesDto {
  @IsLongitude()
  @ApiProperty({
    example: '-74.0060',
    description: 'Longitude coordinate',
  })
  longitude!: number;

  @IsLatitude()
  @ApiProperty({
    example: '40.7128',
    description: 'Latitude coordinate',
  })
  latitude!: number;
}

export class LocationCreateDto
  implements Omit<Location, 'id' | 'createdAt' | 'updatedAt' | 'owner'>
{
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'user-123',
    description: 'ID of the owner of the location',
  })
  ownerId!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Home Address',
    description: 'Name of the location',
  })
  name!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '123 Main St',
    description: 'Street address',
  })
  street!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'New York',
    description: 'City name',
  })
  city!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'NY',
    description: 'State or region',
  })
  state!: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    example: 10001,
    description: 'Postal code or ZIP code',
  })
  postalCode?: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'USA',
    description: 'Country name',
  })
  country!: string;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  @ApiProperty({ type: CoordinatesDto })
  coordinates!: CoordinatesDto;
}
