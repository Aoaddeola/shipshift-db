import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

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
}
