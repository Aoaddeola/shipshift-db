import {
  IsString,
  IsBoolean,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
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

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'user-789',
    description: 'Updated owner ID',
  })
  ownerId?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    example: false,
    description: 'Updated open to destinations out of scope',
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
