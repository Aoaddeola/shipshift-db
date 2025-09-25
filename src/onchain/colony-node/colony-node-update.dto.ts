import {
  IsString,
  IsArray,
  IsNumber,
  Min,
  Max,
  IsOptional,
  ArrayNotEmpty,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ColonyNodeUpdateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'Updated Colony Node Name',
    description: 'Updated name of the colony node',
  })
  name?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ArrayNotEmpty({
    message: 'nodeOperatorAddresses cannot be empty when provided',
  })
  @ApiPropertyOptional({
    example: ['addr1q7defghij5678901234', 'addr1q6klmnopqr4321098765'],
    description: 'Updated array of node operator addresses',
  })
  nodeOperatorAddresses?: string[];

  @IsNumber()
  @Min(1)
  @IsOptional()
  @ApiPropertyOptional({
    example: 4,
    description: 'Updated minimum number of active signatories',
    minimum: 1,
  })
  minimumActiveSignatory?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @ApiPropertyOptional({
    example: 7.5,
    description: 'Updated commission percentage (0-100)',
    minimum: 0,
    maximum: 100,
  })
  commissionPercent?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  @ApiPropertyOptional({
    example: 150,
    description: 'Updated maximum number of active steps',
    minimum: 1,
  })
  maximumActiveStepsCount?: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'QmUpdatedPeerId...',
    description: 'Updated peer ID for network communication',
  })
  peerId?: string;
}
