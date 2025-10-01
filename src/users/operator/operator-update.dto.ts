import {
  IsString,
  IsNumber,
  Min,
  IsOptional,
  ValidateNested,
  IsEnum,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OperatorTypeParams, ParticipantTypeParams } from './operator.types.js';

// Nested DTO for OnchainOperator update
class OnchainOperatorUpdateDto {
  @IsEnum(['ReserveOperatorType', 'DispatchOperatorType', 'CuratorType'])
  @IsOptional()
  @ApiPropertyOptional({
    enum: ['ReserveOperatorType', 'DispatchOperatorType', 'CuratorType'],
    example: 'DispatchOperatorType',
    description: 'Updated role of the operator',
  })
  opRole?: OperatorTypeParams;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'addr1q8uvwxyz0987654321abcdef1234567890abcdef1234567890abcdef',
    description: 'Updated operator address',
  })
  opAddr?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({
    example: 7.5,
    description: 'Updated curator commission percentage (0-100)',
  })
  opCuratorPercentCommission?: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: '2b3c4d5e#1',
    description: 'Updated transaction output reference',
  })
  opTxOutRef?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'updated.policyid.assetname',
    description: 'Updated collateral asset class identifier',
  })
  opCollateralAssetClass?: string;

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional({
    example: [
      ['RequesterType', 1500000],
      ['RecipientType', 1500000],
      ['PerformerType', 1500000],
      ['HolderType', 1500000],
      ['ComplainantType', 1500000],
    ],
    description:
      'Updated minimum collateral required per participant type as [type, amount] tuples',
  })
  opMinCollateralPerParticipant?: [ParticipantTypeParams, number][];
}

// Nested DTO for OffchainOperator update
class OffchainOperatorUpdateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'contact-456',
    description: 'Updated contact details ID',
  })
  contactDetailsId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'colony-node-789',
    description: 'Updated colony node ID',
  })
  colonyNodeId?: string;
}

export class OperatorUpdateDto {
  @ValidateNested()
  @Type(() => OnchainOperatorUpdateDto)
  @IsOptional()
  @ApiPropertyOptional({ type: OnchainOperatorUpdateDto })
  onchain?: OnchainOperatorUpdateDto;

  @ValidateNested()
  @Type(() => OffchainOperatorUpdateDto)
  @IsOptional()
  @ApiPropertyOptional({ type: OffchainOperatorUpdateDto })
  offchain?: OffchainOperatorUpdateDto;
}
