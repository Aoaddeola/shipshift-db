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

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: '0x742d35Cc6634C0532925a3b8D...',
    description: 'Updated public key hash of the agent',
  })
  onChainAddress?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    example: true,
    description: 'Updated verification status',
  })
  verified?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    example: false,
    description: 'Updated active status',
  })
  active?: boolean;

  @IsEnum(AgentType)
  @IsOptional()
  @ApiPropertyOptional({
    enum: AgentType,
    example: AgentType.Private,
    description: 'Updated type of agent (Business or Private)',
  })
  type?: AgentType;
}
