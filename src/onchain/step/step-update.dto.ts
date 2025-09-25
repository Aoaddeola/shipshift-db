import {
  IsString,
  IsNumber,
  Min,
  ValidateNested,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { StepState } from './step.types.js';

// Nested DTO for StepOnChain update
class StepOnChainUpdateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'addr1q9abcdef1234567890' })
  spRecipient?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'addr1q8uvwxyz0987654321' })
  spRequester?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'addr1q7defghij5678901234' })
  spHolder?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'addr1q6klmnopqr4321098765' })
  spPerformer?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'addr1q5tuvxyz1122334455' })
  spDelegate?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({
    example: 7500000,
    description: 'Updated cost in lovelace',
  })
  spCost?: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: '1a2b3c4d#0' })
  spTxOutRef?: string;
}

export class StepUpdateDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({ example: 1, description: 'Updated index of the step' })
  index?: number;

  @ValidateNested()
  @Type(() => StepOnChainUpdateDto)
  @IsOptional()
  @ApiPropertyOptional({ type: StepOnChainUpdateDto })
  stepParams?: StepOnChainUpdateDto;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'shipment-456' })
  shipmentId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'journey-789' })
  journeyId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'operator-012' })
  operatorId?: string;

  @IsEnum(StepState)
  @IsOptional()
  @ApiPropertyOptional({
    enum: StepState,
    description: 'Updated state of the step',
  })
  state?: StepState;
}
