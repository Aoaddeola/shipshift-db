import { IsString, IsArray, IsOptional, ArrayNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AgentUpdateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'Updated Agent Name',
    description: 'Updated name of the agent',
  })
  name?: string;

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
    example: 'operator-789',
    description: 'Updated operator ID',
  })
  operatorId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ArrayNotEmpty({ message: 'journeyIds array cannot be empty when provided' })
  @ApiPropertyOptional({
    example: ['journey-345', 'journey-678'],
    description: 'Updated array of journey IDs',
  })
  journeyIds?: string[];
}
