import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  ArrayNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Mission, MissionStatus } from './mission.types.js';

export class MissionCreateDto implements Omit<Mission, 'id'> {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'curator-123' })
  curatorId: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
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
