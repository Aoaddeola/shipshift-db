import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Assignment, AssignmentState } from './assignment.types.js';

export class AssignmentCreateDto
  implements
    Omit<Assignment, 'id' | 'createdAt' | 'updatedAt' | 'task' | 'performer'>
{
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'task-123',
    description: 'ID of the task being assigned',
  })
  taskId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'user-456',
    description: 'ID of the performer (user)',
  })
  performerId: string;

  @IsEnum(AssignmentState)
  @ApiProperty({
    enum: AssignmentState,
    default: AssignmentState.Pending,
    description: 'Current state of the assignment',
  })
  state: AssignmentState = AssignmentState.Pending;
}
