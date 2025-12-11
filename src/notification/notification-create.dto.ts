import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Notification, NotificationType } from './notification.types.js';

export class NotificationCreateDto
  implements
    Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'user' | 'timestamp'>
{
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'New message received' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'You have a new message from John' })
  message: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '5 min ago',
    description: 'Human-readable time format',
  })
  time: string;

  @IsEnum(NotificationType)
  @ApiProperty({
    enum: NotificationType,
    default: NotificationType.MESSAGE,
    description: 'Type of notification',
  })
  type: NotificationType = NotificationType.MESSAGE;

  @IsBoolean()
  @ApiProperty({
    example: false,
    description: 'Whether the notification has been read',
  })
  read: boolean = false;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'user-123',
    description: 'Optional user ID for personal notifications',
  })
  userId?: string;
}
