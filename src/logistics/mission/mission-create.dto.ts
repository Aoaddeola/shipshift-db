import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Mission, MissionStatus } from './mission.types.js';

export class MissionCreateDto
  implements
    Omit<
      Mission,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'curator'
      | 'journeys'
      | 'fromLocation'
      | 'toLocation'
    >
{
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'curator-123' })
  curatorId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'location-456' })
  fromLocationId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'location-789' })
  toLocationId: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty({ message: 'journeyIds array cannot be empty when provided' })
  @ApiPropertyOptional({
    example: ['journey-456', 'journey-789'],
    description: 'Array of journey IDs associated with this mission',
  })
  journeyIds: string[];

  @IsEnum(MissionStatus)
  @ApiProperty({
    enum: MissionStatus,
    default: MissionStatus.DRAFT,
    description: 'Current status of the mission',
  })
  status: MissionStatus = MissionStatus.DRAFT;
}
