import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  IsNumber,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ColonyNode } from './colony-node.types.js';

// Nested DTO for AssetClass
class AssetClassDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
    description: 'Policy ID for the asset',
  })
  policy_id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '74657374746f6b656e',
    description: 'Asset name in hex format',
  })
  asset_name: string;
}

export class ColonyNodeCreateDto
  implements
    Omit<
      ColonyNode,
      'id' | 'createdAt' | 'updatedAt' | 'platformAssetClassDetails'
    >
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

  @ValidateNested()
  @Type(() => AssetClassDto)
  @ApiProperty({
    type: AssetClassDto,
    description: 'Platform asset class configuration',
  })
  platformAssetClass: AssetClassDto;

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
  @ApiProperty({
    example: 5,
    description: 'Commission percentage (0-100)',
    minimum: 0,
    maximum: 100,
  })
  commissionPercent: number;

  @IsNumber()
  @Min(1)
  @ApiProperty({
    example: 100,
    description: 'Maximum number of active steps',
    minimum: 1,
  })
  maximumActiveStepsCount: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'QmX58D3k4m...',
    description: 'Peer ID for network communication',
  })
  peerId: string;
}
