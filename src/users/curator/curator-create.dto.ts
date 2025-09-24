import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Curator } from './curator.types.js';

export class CuratorCreateDto
  implements Omit<Curator, 'id' | 'createdAt' | 'updatedAt'>
{
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'John Curator',
    description: 'Full name of the curator',
    minLength: 3,
    maxLength: 100,
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'contact-123',
    description: 'ID of the associated contact details',
  })
  contactDetailsId: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ArrayNotEmpty({ message: 'missionIds array cannot be empty when provided' })
  @ApiPropertyOptional({
    example: ['mission-456', 'mission-789'],
    description: 'Array of mission IDs managed by this curator',
  })
  missionIds: string[];
}
