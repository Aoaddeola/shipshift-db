import { IsString, IsNumber, Min, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TaskUpdateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'Updated task description',
    description: 'Updated description of the task',
  })
  description?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'Updated task goal',
    description: 'Updated goal of the task',
  })
  goal?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({
    example: 75,
    description: 'Updated reward for completing the task',
    minimum: 0,
  })
  reward?: number;
  @IsOptional()
  @IsObject()
  @ApiProperty({
    description: 'Validation rules for the task',
    required: false,
  })
  validation: any; // Make it optional
}
