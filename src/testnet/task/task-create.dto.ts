import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Task } from './task.types.js';

export class TaskCreateDto
  implements Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
{
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Deliver package to location',
    description: 'Description of the task',
  })
  description: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Deliver package from New York to Los Angeles',
    description: 'Goal of the task',
  })
  goal: string;

  @IsNumber()
  @Min(0)
  @ApiProperty({
    example: 50,
    description: 'Reward for completing the task',
    minimum: 0,
  })
  reward: number;

  @IsOptional()
  @IsObject()
  @ApiProperty({
    description: 'Validation rules for the task',
    required: false,
  })
  validation: any; // Make it optional
}
