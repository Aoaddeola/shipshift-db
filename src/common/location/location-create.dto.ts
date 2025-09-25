import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Location } from './location.types.js';

// Custom validator for coordinates
function IsValidCoordinates() {
  return function (object: any, propertyName: string) {
    const coordinates = object[propertyName];

    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return false;
    }

    const [longitude, latitude] = coordinates;

    // Validate longitude (-180 to 180)
    if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
      return false;
    }

    // Validate latitude (-90 to 90)
    if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
      return false;
    }

    return true;
  };
}

export class LocationCreateDto implements Omit<Location, 'id'> {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '123 Main St' })
  street: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'New York' })
  city: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'NY' })
  state: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @Validate(IsValidCoordinates, {
    message: 'Coordinates must be [longitude, latitude] with valid ranges',
  })
  @ApiProperty({
    example: [-74.006, 40.7128],
    description: 'Array of [longitude, latitude]',
  })
  coordinates: [number, number];
}
