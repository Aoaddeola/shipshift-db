import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  IsNumber,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ColonyNode } from './colony-node.types.js';
import { OperatorTypeParams } from '../../users/operator/operator.types.js';

export class ColonyNodeCreateDto
  implements Omit<ColonyNode, 'id' | 'createdAt' | 'updatedAt'>
{
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Main Colony Node',
    description: 'Name of the colony node',
    minLength: 2,
    maxLength: 100,
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'BTC',
    description: 'Platform asset class',
  })
  platformAssetClass: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty({ message: 'nodeOperatorAddresses cannot be empty' })
  @ApiProperty({
    example: ['addr1q9abcdef1234567890', 'addr1q8uvwxyz0987654321'],
    description: 'Array of node operator addresses',
  })
  nodeOperatorAddresses: string[];

  @IsNumber()
  @Min(1)
  @ApiProperty({
    example: 3,
    description: 'Minimum number of active signatories required',
    minimum: 1,
  })
  minimumActiveSignatory: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsNotEmpty()
  @ApiProperty({
    example: 5,
    description: 'Commission percentage (0-100)',
    minimum: 0,
    maximum: 100,
  })
  commissionPercent: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  @ApiProperty({
    example: 100,
    description: 'Maximum number of active steps',
    minimum: 1,
  })
  maximumActiveStepsCount: number;

  @IsString()
  // @IsNotEmpty()
  @ApiProperty({
    example: 'QmX58D3k4m...',
    description: 'Peer ID for network communication',
  })
  peerId: string;
}
