import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AgentType, ConveyanceMeans } from './agent.types.js';

export class AgentUpdateDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  @ApiPropertyOptional({
    example: 'Updated Agent Name',
    description: 'Updated name of the agent',
  })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'operator-456',
    description: 'Updated operator ID',
  })
  operatorId?: string;

  @IsNumber()
  @Min(0.001)
  @IsOptional()
  @ApiPropertyOptional({
    example: 75,
    description: 'Updated maximum weight the agent can carry (in kg)',
    minimum: 0.001,
  })
  weightLimit?: number;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    example: false,
    description:
      'Whether the agent is open to destinations outside their listed scope',
  })
  openToDestinationsOutOfScope?: boolean;

  @IsEnum(ConveyanceMeans)
  @IsOptional()
  @ApiPropertyOptional({
    enum: ConveyanceMeans,
    example: ConveyanceMeans.Drone,
    description: 'Updated means of conveyance used by the agent',
  })
  meansOfConveyance?: ConveyanceMeans;

  @IsEnum(AgentType)
  @IsOptional()
  @ApiPropertyOptional({
    enum: AgentType,
    example: AgentType.Private,
    description: 'Updated type of agent (Business or Private)',
  })
  type?: AgentType;
}
