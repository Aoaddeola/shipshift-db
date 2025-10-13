import {
  IsString,
  IsNumber,
  Min,
  IsOptional,
  ValidateNested,
  IsEnum,
  IsDateString,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { StepState } from './step.types.js';

// Nested DTO for StepOnChain update
class StepOnChainUpdateDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({
    example: 5500000,
    description: 'Updated cost of the step in lovelace',
    minimum: 0,
  })
  spCost?: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'addr1q9abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    description: 'Updated delegate wallet address',
  })
  spDelegate?: string;

  @IsDateString()
  // @Type(() => Date)
  @IsOptional()
  @ApiPropertyOptional({
    example: '2025-04-06T17:00:00Z',
    description: 'Updated estimated time of arrival (ISO 8601)',
  })
  spETA?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'addr1q8uvwxyz0987654321abcdef1234567890abcdef1234567890abcdef',
    description: 'Updated holder wallet address',
  })
  spHolder?: string;

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional({
    example: ['addr1q7defghij5678901234', 'policyid.assetname'],
    description: 'Updated performer wallet address and minting policy ID',
  })
  spPerformer?: [string, string];

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'addr1q6klmnopqr4321098765abcdef1234567890abcdef1234567890abcdef',
    description: 'Updated recipient wallet address',
  })
  spRecipient?: string;

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional({
    example: ['addr1q5tuvxyz1122334455', 'policyid.assetname'],
    description: 'Updated requester wallet address and minting policy ID',
  })
  spRequester?: [string, string | undefined];

  @IsDateString()
  // @Type(() => Date)
  @IsOptional()
  @ApiPropertyOptional({
    example: '2025-04-02T09:00:00Z',
    description: 'Updated start time of the step (ISO 8601)',
  })
  spStartTime?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: '2b3c4d5e#1',
    description: 'Updated transaction output reference',
  })
  spTxOutRef?: string;
}

export class StepUpdateDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({
    example: 1,
    description: 'Updated index of the step in the journey',
    minimum: 0,
  })
  index?: number;

  @ValidateNested()
  @Type(() => StepOnChainUpdateDto)
  @IsOptional()
  @ApiPropertyOptional({ type: StepOnChainUpdateDto })
  stepParams?: StepOnChainUpdateDto;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'shipment-456',
    description: 'Updated shipment ID',
  })
  shipmentId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'journey-789',
    description: 'Updated journey ID',
  })
  journeyId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'operator-012',
    description: 'Updated operator ID',
  })
  operatorId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'colony-node-345',
    description: 'Updated colony node ID',
  })
  colonyId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'agent-678',
    description: 'Updated agent ID',
  })
  agentId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'sender-901',
    description: 'Updated sender ID',
  })
  senderId?: string;

  @IsEnum(StepState)
  @IsOptional()
  @ApiPropertyOptional({
    enum: StepState,
    description: 'Updated state of the step',
  })
  state?: StepState;
}
