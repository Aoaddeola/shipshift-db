import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AssignmentState } from './assignment.types.js';

export class AssignmentUpdateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'task-456',
    description: 'Updated task ID',
  })
  taskId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'user-789',
    description: 'Updated performer ID',
  })
  performerId?: string;

  @IsEnum(AssignmentState)
  @IsOptional()
  @ApiPropertyOptional({
    enum: AssignmentState,
    description: 'Updated state of the assignment',
  })
  state?: AssignmentState;
}
