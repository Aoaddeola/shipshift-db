import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  ValidateNested,
  IsEnum,
  IsDateString,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Step, StepState } from './step.types.js';

// Nested DTO for StepOnChain
class StepOnChainDto {
  @IsNumber()
  @Min(0)
  @ApiProperty({
    example: 5000000,
    description: 'Cost of the step in lovelace',
    minimum: 0,
  })
  spCost: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'addr1q9abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    description: 'Delegate wallet address',
  })
  spDelegate?: string;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({
    example: '2025-04-05T17:00:00Z',
    description: 'Estimated time of arrival (ISO 8601)',
  })
  spETA?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'addr1q8uvwxyz0987654321abcdef1234567890abcdef1234567890abcdef',
    description: 'Holder wallet address',
  })
  spHolder?: string;

  @IsArray()
  @ApiProperty({
    example: ['addr1q7defghij5678901234', 'policyid.assetname'],
    description: 'Performer wallet address and minting policy ID',
  })
  spPerformer: [string, string];

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'addr1q6klmnopqr4321098765abcdef1234567890abcdef1234567890abcdef',
    description: 'Recipient wallet address',
  })
  spRecipient?: string;

  @IsArray()
  @ApiProperty({
    example: ['addr1q5tuvxyz1122334455', 'policyid.assetname'],
    description: 'Requester wallet address and minting policy ID',
  })
  spRequester: [string, string | undefined];

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({
    example: '2025-04-01T09:00:00Z',
    description: 'Start time of the step (ISO 8601)',
  })
  spStartTime?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: '1a2b3c4d#0',
    description: 'Transaction output reference',
  })
  spTxOutRef?: string;
}

export class StepCreateDto
  implements
    Omit<
      Step,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'shipment'
      | 'journey'
      | 'operator'
      | 'colony'
    >
{
  @IsNumber()
  @Min(0)
  @ApiProperty({
    example: 0,
    description: 'Index of the step in the journey',
    minimum: 0,
  })
  index: number;

  @ValidateNested()
  @Type(() => StepOnChainDto)
  @ApiProperty({ type: StepOnChainDto })
  stepParams: StepOnChainDto;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'shipment-123',
    description: 'ID of the shipment',
  })
  shipmentId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'journey-456',
    description: 'ID of the journey',
  })
  journeyId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'operator-789',
    description: 'ID of the operator',
  })
  operatorId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'colony-node-012',
    description: 'ID of the colony node',
  })
  colonyId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'agent-345',
    description: 'ID of the agent',
  })
  agentId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'sender-678',
    description: 'ID of the sender',
  })
  senderId: string;

  @IsEnum(StepState)
  @ApiProperty({
    enum: StepState,
    default: StepState.PENDING,
    description: 'Current state of the step',
  })
  state: StepState = StepState.PENDING;
}
